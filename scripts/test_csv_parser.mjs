import { parse } from 'csv-parse/sync';

const mockCsv = `,รายการ,Calculation detail/จำนวน,Calculation detail/หน่วย,Calculation detail/ราคาต่อหน่วย,Calculation detail/รวม,แยกประเภทค่าใช้จ่าย/หมวด,แยกประเภทค่าใช้จ่าย/หมวดย่อย,Status/Ref,Status/ได้รับสินค้าแล้ว,หมายเหตุ
,ค่าตอบแทนวิทยากร,1,คน,2000,2000,ค่าตอบแทน,ค่าตอบแทนวิทยากร,,ได้รับแล้ว,วิทยากรภายนอก
,ค่าอาหารกลางวัน,50,กล่อง,60,3000,ค่าใช้สอย,ค่าอาหาร,,ได้รับแล้ว,สำหรับนิสิต
,กระดาษ A4,2,แพ็ค,150,300,ค่าวัสดุ,วัสดุสำนักงาน,,,-
,รวม,,,5300,,,,
`;

function testParser() {
  console.log('--- Testing CSV Budget Parser ---');
  
  const rows = parse(mockCsv, {
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true
  });

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

  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const row = rows[i];
    const nameColIdx = row.findIndex(val => val && (val.includes('รายการ') || val === 'รายการ'));
    if (nameColIdx !== -1) {
      nameIndex = nameColIdx;
      
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
      startRowIndex = i + 1;
      break;
    }
  }

  console.log('Header Row Found:', headerRowFound);
  console.log('Indices Mapped:');
  console.log({ nameIndex, qtyIndex, unitIndex, priceIndex, categoryIndex, subCategoryIndex, receivedIndex, noteIndex });

  const dataRows = rows.slice(startRowIndex);
  const parsedItems = [];

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

  for (const row of dataRows) {
    const name = cleanStr(row[nameIndex]);
    if (!name) continue;

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

    parsedItems.push({
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

  console.log('Parsed Items List:');
  console.log(JSON.stringify(parsedItems, null, 2));

  if (parsedItems.length === 3) {
    console.log('✅ TEST PASSED: Successfully parsed 3 items and skipped "รวม" row.');
  } else {
    console.log('❌ TEST FAILED: Expected 3 items, got ' + parsedItems.length);
  }
}

testParser();
