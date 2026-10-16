import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const isTreasurerUser = ['admin', 'board'].includes(session.role) || 
      (session.positionTitle && session.positionTitle.includes('เหรัญญิก'));

    const isExecutiveUser = ['admin', 'board'].includes(session.role) || 
      (session.positionTitle && (session.positionTitle.includes('นายก') || session.positionTitle.includes('อุปนายก')));

    if (!isTreasurerUser && !isExecutiveUser) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { status, feedback } = await request.json();

    if (!status || !feedback) {
      return NextResponse.json({ error: 'Missing status or feedback' }, { status: 400 });
    }

    // Fetch current activity to know its status
    const currentActivity = await prisma.activity.findUnique({ where: { id } });
    if (!currentActivity) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    let nextStatus = status; // 'revision' or 'approved'
    
    if (status === 'approved') {
      if (isExecutiveUser) {
        // ฝ่ายบริหาร (นายก/อุปนายก/admin/board) อนุมัติ → อนุมัติเสร็จสมบูรณ์
        nextStatus = 'approved';
      } else if (isTreasurerUser) {
        // ถ้าเหรัญญิกอนุมัติ: หากผ่านการตรวจของผู้บริหารแล้วหรือรอผู้บริหารอยู่
        nextStatus = currentActivity.status === 'pending_executive' ? 'approved' : 'pending_executive';
      }
    } else if (status === 'revision') {
      nextStatus = 'revision';
    }

    // Use transaction to update Activity and Create Review
    const [review, updatedActivity] = await prisma.$transaction([
      prisma.budgetReview.create({
        data: {
          status, // the input status (approved/revision)
          feedback,
          activityId: id,
          reviewerId: session.userId,
        },
        include: {
          reviewer: true
        }
      }),
      prisma.activity.update({
        where: { id },
        data: {
          status: nextStatus,
        },
        include: {
          department: true,
          createdBy: true,
          documents: { include: { uploadedBy: true }, orderBy: { uploadedAt: 'desc' } },
          budgetReviews: { include: { reviewer: true }, orderBy: { reviewedAt: 'desc' } }
        }
      })
    ]);

    return NextResponse.json({ review, updatedActivity }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit review:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}
