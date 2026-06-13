import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        department: true,
        createdBy: true,
      }
    });
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAuthorized = ['admin', 'board', 'od', 'head'].includes(session.role) || 
      (session.positionTitle && (
        session.positionTitle.includes('นายก') ||
        session.positionTitle.includes('อุปนายก') ||
        session.positionTitle.includes('ประธานฝ่าย')
      ));

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await request.json();
    data.createdById = session.userId;

    const activity = await prisma.activity.create({
      data: {
        title: data.title,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        budgetRequested: parseFloat(data.budgetRequested) || 0,
        budgetApproved: parseFloat(data.budgetApproved) || null,
        status: data.status || 'draft',
        departmentId: data.departmentId || null,
        createdById: data.createdById,
      }
    });
    
    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error('Failed to create activity:', error);
    return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 });
  }
}
