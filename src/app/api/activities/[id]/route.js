import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isAuthorized = ['admin', 'board', 'head'].includes(session.role) || 
      (session.positionTitle && (
        session.positionTitle.includes('นายก') ||
        session.positionTitle.includes('อุปนายก') ||
        session.positionTitle.includes('ประธานฝ่าย')
      ));

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { title, description, startDate, endDate, budgetRequested, status } = await request.json();

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (budgetRequested !== undefined) updateData.budgetRequested = parseFloat(budgetRequested) || 0;
    if (status !== undefined) updateData.status = status;

    const activity = await prisma.activity.update({
      where: { id },
      data: updateData,
      include: {
        department: true,
        createdBy: true,
        documents: { include: { uploadedBy: true }, orderBy: { uploadedAt: 'desc' } },
        budgetReviews: { include: { reviewer: true }, orderBy: { reviewedAt: 'desc' } }
      }
    });

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Failed to update activity:', error);
    return NextResponse.json({ error: 'Failed to update activity' }, { status: 500 });
  }
}
