import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(request, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { signType } = await request.json(); // 'head' | 'president'

    if (!signType || !['head', 'president'].includes(signType)) {
      return NextResponse.json({ error: 'ประเภทการลงนามไม่ถูกต้อง' }, { status: 400 });
    }

    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        department: true,
        budgetReviews: { include: { reviewer: true } }
      }
    });

    if (!activity) return NextResponse.json({ error: 'ไม่พบกิจกรรม' }, { status: 404 });

    // โครงการต้องอยู่ในสถานะที่ผ่านการตรวจอนุมัติแล้ว (approved หรือ completed)
    if (!['approved', 'completed'].includes(activity.status)) {
      return NextResponse.json({ error: 'โครงการต้องผ่านการตรวจอนุมัติจากเหรัญญิกและฝ่ายบริหารก่อนลงนาม' }, { status: 400 });
    }

    const alreadyHeadSigned = activity.budgetReviews.some(r => r.status === 'head_signed');
    const alreadyPresidentSigned = activity.budgetReviews.some(r => r.status === 'president_signed');

    const signerName = session.name || session.firstNameTh || 'ผู้ลงนาม';
    const signerPosition = session.positionTitle || (signType === 'head' ? 'ประธานฝ่าย' : 'นายกสโมสรนิสิต');

    let reviewStatus = '';
    let feedbackText = '';
    let nextActivityStatus = activity.status;

    if (signType === 'head') {
      // สิทธิ์ประธานฝ่าย: admin, board, ประธานฝ่ายของฝ่ายนั้น หรือคนที่มี headId หรือ positionTitle ประธาน/หัวหน้า
      const isDeptHead =
        session.role === 'admin' ||
        session.role === 'board' ||
        (session.departmentId && session.departmentId === activity.departmentId && (session.role === 'head' || session.positionTitle?.includes('ประธาน') || session.positionTitle?.includes('หัวหน้า'))) ||
        (activity.department?.headId && session.userId === activity.department.headId) ||
        (session.positionTitle && session.positionTitle.includes('ประธานฝ่าย'));

      if (!isDeptHead) {
        return NextResponse.json({ error: 'เฉพาะประธานฝ่ายของโครงการนี้หรือผู้มีอำนาจเท่านั้นที่ลงนามได้' }, { status: 403 });
      }

      if (alreadyHeadSigned) {
        return NextResponse.json({ error: 'ประธานฝ่ายได้ลงนามรับรองโครงการนี้ไปแล้ว' }, { status: 400 });
      }

      reviewStatus = 'head_signed';
      feedbackText = `ประธานฝ่าย${activity.department?.name || ''} ลงนามรับรองโครงการเรียบร้อยแล้ว โดย ${signerName} (${signerPosition})`;
    } else if (signType === 'president') {
      // สิทธิ์นายกสโมสร: admin, หรือ positionTitle นายกสโมสร
      const isPresident =
        session.role === 'admin' ||
        (session.positionTitle && (session.positionTitle.includes('นายกสโมสรนิสิต') || session.positionTitle.includes('นายกสโมสร') || session.positionTitle.includes('นายก'))) ||
        (session.role === 'board' && session.positionTitle?.includes('นายก'));

      if (!isPresident) {
        return NextResponse.json({ error: 'เฉพาะนายกสโมสรนิสิตเท่านั้นที่มีอำนาจลงนามขั้นสุดท้าย' }, { status: 403 });
      }

      if (alreadyPresidentSigned) {
        return NextResponse.json({ error: 'นายกสโมสรนิสิตได้ลงนามอนุมัติโครงการนี้ไปแล้ว' }, { status: 400 });
      }

      // ต้องผ่านการลงนามจากประธานฝ่ายก่อน (ยกเว้น admin)
      if (!alreadyHeadSigned && session.role !== 'admin') {
        return NextResponse.json({ error: 'กรุณารอให้ประธานฝ่ายลงนามรับรองโครงการก่อน นายกสโมสรจึงจะลงนามอนุมัติ' }, { status: 400 });
      }

      reviewStatus = 'president_signed';
      feedbackText = `นายกสโมสรนิสิต ลงนามอนุมัติโครงการอย่างเป็นทางการ โดย ${signerName} (${signerPosition})`;
      nextActivityStatus = 'completed'; // เมื่อนายกเซ็นครบ ถือว่าเสร็จสิ้นสมบูรณ์
    }

    // บันทึกการลงนามลง BudgetReview และอัปเดตสถานะโครงการ
    const [review, updatedActivity] = await prisma.$transaction([
      prisma.budgetReview.create({
        data: {
          status: reviewStatus,
          feedback: feedbackText,
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
          status: nextActivityStatus,
        },
        include: {
          department: true,
          createdBy: true,
          documents: { include: { uploadedBy: true }, orderBy: { uploadedAt: 'desc' } },
          budgetReviews: { include: { reviewer: true }, orderBy: { reviewedAt: 'desc' } }
        }
      })
    ]);

    return NextResponse.json({ success: true, review, updatedActivity });
  } catch (error) {
    console.error('Failed to sign activity:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลงนาม: ' + error.message }, { status: 500 });
  }
}
