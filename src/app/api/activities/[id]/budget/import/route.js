import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { parse } from 'csv-parse/sync';

export async function POST(request, { params }) {
  try {
    const { id: activityId } = await params;

    // Auth check
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // "planned" or "actual"

    if (!file || !type) {
      return NextResponse.json({ error: 'Missing file or type' }, { status: 400 });
    }

    if (type !== 'planned' && type !== 'actual') {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const text = await file.text();
    
    // Parse CSV as raw array of arrays
    const rows = parse(text, {
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true
    });

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file is empty' }, { status: 400 });
    }

    // Default indices based on the spreadsheet template structure
    // Col 0: Empty, Col 1: รายการ, Col 2: จำนวน, Col 3: หน่วย, Col 4: ราคาต่อหน่วย, Col 5: รวม, Col 6: หมวด, Col 7: หมวดย่อย, Col 8: Status/Ref, Col 9: ได้รับสินค้าแล้ว, Col 10: หมายเหตุ
    let nameIndex = 1;
    let qtyIndex = 2;
    let unitIndex = 3;
    let priceIndex = 4;
    let categoryIndex = 6;
    let subCategoryIndex = 7;
    let receivedIndex = 9;
    let noteIndex = 10;

    let headerRowFound = false;
    let startRowIndex = 0;

    // Scan for header row to map indices dynamically (in case columns are shifted)
    for (let i = 0; i < Math.min(rows.length, 10); i++) {
      const row = rows[i];
      const nameColIdx = row.findIndex(val => val && (val.includes('รายการ') || val === 'รายการ'));
      if (nameColIdx !== -1) {
        nameIndex = nameColIdx;
        
        // Find other columns based on search terms
        const qtyColIdx = row.findIndex(val => val && (val.includes('จำนวน') || val.includes('QTY')));
        if (qtyColIdx !== -1) qtyIndex = qtyColIdx;
        
        const unitColIdx = row.findIndex(val => val && val.includes('หน่วย'));
        if (unitColIdx !== -1) unitIndex = unitColIdx;
        
        const priceColIdx = row.findIndex(val => val && (val.includes('ราคาต่อหน่วย') || val.includes('ราคา/หน่วย') || val.includes('ราคา')));
        if (priceColIdx !== -1) priceIndex = priceColIdx;
        
        const catColIdx = row.findIndex(val => val && (val.includes('หมวด') && !val.includes('หมวดย่อย')));
        if (catColIdx !== -1) categoryIndex = catColIdx;
        
        const subCatColIdx = row.findIndex(val => val && val.includes('หมวดย่อย'));
        if (subCatColIdx !== -1) subCategoryIndex = subCatColIdx;

        const recColIdx = row.findIndex(val => val && (val.includes('ได้รับสินค้า') || val.includes('รับของ')));
        if (recColIdx !== -1) receivedIndex = recColIdx;
        
        const noteColIdx = row.findIndex(val => val && val.includes('หมายเหตุ'));
        if (noteColIdx !== -1) noteIndex = noteColIdx;

        headerRowFound = true;
        startRowIndex = i + 1; // Start processing data on the next row
        break;
      }
    }

    // If no header found, we start from row 0 and use defaults
    const dataRows = rows.slice(startRowIndex);
    const createdItems = [];

    // Helper functions to clean values
    const cleanStr = (val) => {
      if (!val) return null;
      const t = val.trim();
      return (t === '' || t === '-' || t === 'undefined') ? null : t;
    };

    const cleanNum = (val) => {
      if (!val) return 0;
      const clean = val.replace(/,/g, '').trim();
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    };

    const cleanBool = (val) => {
      if (!val) return false;
      const t = val.trim().toLowerCase();
      return t === 'true' || t === 'yes' || t === '1' || t === 'ได้รับแล้ว' || t === 'checked';
    };

    // Filter and build DB entries
    for (const row of dataRows) {
      const name = cleanStr(row[nameIndex]);
      if (!name) continue; // Skip empty rows

      // Skip header rows or total/summary rows
      const lowerName = name.toLowerCase();
      if (
        lowerName.includes('รายการ') || 
        lowerName === 'รวม' || 
        lowerName.includes('รวมงบประมาณ') || 
        lowerName.includes('ยอดรวม') || 
        lowerName.includes('total') || 
        lowerName === 'ค่าตอบแทน' || 
        lowerName === 'ค่าใช้สอย' || 
        lowerName === 'ค่าวัสดุ'
      ) {
        continue;
      }

      const categoryVal = cleanStr(row[categoryIndex]);
      // If category is not set, default to "ค่าใช้สอย"
      let category = 'ค่าใช้สอย';
      if (categoryVal) {
        if (categoryVal.includes('ตอบแทน')) category = 'ค่าตอบแทน';
        else if (categoryVal.includes('ใช้สอย')) category = 'ค่าใช้สอย';
        else if (categoryVal.includes('วัสดุ')) category = 'ค่าวัสดุ';
      }

      const quantity = cleanNum(row[qtyIndex]) || 1;
      const pricePerUnit = cleanNum(row[priceIndex]) || 0;
      const total = quantity * pricePerUnit;
      
      const unit = cleanStr(row[unitIndex]) || 'หน่วย';
      const subCategory = cleanStr(row[subCategoryIndex]);
      const isReceived = cleanBool(row[receivedIndex]);
      const note = cleanStr(row[noteIndex]);

      createdItems.push({
        activityId,
        type,
        name,
        quantity,
        unit,
        pricePerUnit,
        total,
        category,
        subCategory,
        isReceived,
        note
      });
    }

    // Transaction to clear old items of this type and insert new ones
    if (createdItems.length > 0) {
      await prisma.$transaction([
        prisma.budgetItem.deleteMany({
          where: {
            activityId,
            type
          }
        }),
        prisma.budgetItem.createMany({
          data: createdItems
        })
      ]);
    } else {
      return NextResponse.json({ error: 'No valid budget rows found in CSV' }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      count: createdItems.length,
      message: `Successfully imported ${createdItems.length} budget items.`
    });

  } catch (error) {
    console.error('CSV import error:', error);
    return NextResponse.json({ error: 'Failed to import CSV: ' + error.message }, { status: 500 });
  }
}
