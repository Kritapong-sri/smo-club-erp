import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// GET all budget items for an activity + summary stats
export async function GET(request, { params }) {
  try {
    const { id: activityId } = await params;
    
    // Check session
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      select: { budgetApproved: true, title: true }
    });

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    const budgetItems = await prisma.budgetItem.findMany({
      where: { activityId },
      orderBy: { createdAt: 'asc' }
    });

    // Calculate Summary Stats
    const summary = {
      budgetApproved: activity.budgetApproved || 0,
      planned: {
        total: 0,
        compensation: 0, // ค่าตอบแทน
        operating: 0,    // ค่าใช้สอย
        materials: 0,    // ค่าวัสดุ
        other: 0
      },
      actual: {
        total: 0,
        compensation: 0,
        operating: 0,
        materials: 0,
        other: 0
      },
      remaining: 0
    };

    budgetItems.forEach(item => {
      const value = item.total || 0;
      const type = item.type; // "planned" or "actual"
      const category = item.category;

      let catKey = 'other';
      if (category === 'ค่าตอบแทน') catKey = 'compensation';
      else if (category === 'ค่าใช้สอย') catKey = 'operating';
      else if (category === 'ค่าวัสดุ') catKey = 'materials';

      if (type === 'planned') {
        summary.planned.total += value;
        summary.planned[catKey] += value;
      } else if (type === 'actual') {
        summary.actual.total += value;
        summary.actual[catKey] += value;
      }
    });

    summary.remaining = summary.budgetApproved - summary.actual.total;

    return NextResponse.json({ budgetItems, summary });
  } catch (error) {
    console.error('Failed to fetch budget:', error);
    return NextResponse.json({ error: 'Failed to fetch budget data' }, { status: 500 });
  }
}

// POST a new budget item
export async function POST(request, { params }) {
  try {
    const { id: activityId } = await params;
    
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, name, quantity, unit, pricePerUnit, category, subCategory, isReceived, note } = body;

    if (!type || !name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const qty = parseFloat(quantity) || 1;
    const price = parseFloat(pricePerUnit) || 0;
    const total = qty * price;

    const newItem = await prisma.budgetItem.create({
      data: {
        activityId,
        type,
        name,
        quantity: qty,
        unit: unit || 'ชิ้น',
        pricePerUnit: price,
        total,
        category,
        subCategory: subCategory || null,
        isReceived: !!isReceived,
        note: note || null
      }
    });

    return NextResponse.json(newItem);
  } catch (error) {
    console.error('Failed to create budget item:', error);
    return NextResponse.json({ error: 'Failed to create budget item' }, { status: 500 });
  }
}

// PUT to update a budget item
export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, type, name, quantity, unit, pricePerUnit, category, subCategory, isReceived, note } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing budget item ID' }, { status: 400 });
    }

    const updateData = {};
    if (type !== undefined) updateData.type = type;
    if (name !== undefined) updateData.name = name;
    if (quantity !== undefined || pricePerUnit !== undefined) {
      // Fetch current item to calculate total if one is missing
      const currentItem = await prisma.budgetItem.findUnique({ where: { id } });
      if (!currentItem) return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      
      const qty = quantity !== undefined ? parseFloat(quantity) : currentItem.quantity;
      const price = pricePerUnit !== undefined ? parseFloat(pricePerUnit) : currentItem.pricePerUnit;
      updateData.quantity = qty;
      updateData.pricePerUnit = price;
      updateData.total = qty * price;
    }
    if (unit !== undefined) updateData.unit = unit;
    if (category !== undefined) updateData.category = category;
    if (subCategory !== undefined) updateData.subCategory = subCategory;
    if (isReceived !== undefined) updateData.isReceived = !!isReceived;
    if (note !== undefined) updateData.note = note;

    const updatedItem = await prisma.budgetItem.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Failed to update budget item:', error);
    return NextResponse.json({ error: 'Failed to update budget item' }, { status: 500 });
  }
}

// DELETE a budget item
export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing budget item ID' }, { status: 400 });
    }

    await prisma.budgetItem.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete budget item:', error);
    return NextResponse.json({ error: 'Failed to delete budget item' }, { status: 500 });
  }
}
