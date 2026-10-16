import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      take: 6,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        department: { select: { name: true } },
        budgetReviews: {
          select: { status: true }
        }
      }
    });

    const announcements = await prisma.announcement.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true
      }
    });

    const notifications = [
      ...announcements.map(a => ({
        id: `ann-${a.id}`,
        type: 'announcement',
        title: `ประกาศ: ${a.title}`,
        message: a.content ? (a.content.length > 50 ? a.content.substring(0, 50) + '...' : a.content) : 'มีประกาศใหม่จากสโมสร',
        time: new Date(a.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        link: '/',
        badgeColor: 'var(--blue-600)'
      })),
      ...activities.map(act => {
        const isPresSigned = act.budgetReviews?.some(r => r.status === 'president_signed');
        const isHeadSigned = act.budgetReviews?.some(r => r.status === 'head_signed');

        let title = `กิจกรรม: ${act.title}`;
        let message = `ฝ่าย${act.department?.name || 'สโมสร'} • กำลังดำเนินการ`;
        let badgeColor = 'var(--color-warning)';

        if (act.status === 'completed' || isPresSigned) {
          title = `✅ ลงนามครบถ้วน: ${act.title}`;
          message = `ฝ่าย${act.department?.name || 'สโมสร'} • นายกสโมสรและประธานฝ่ายลงนามอนุมัติสมบูรณ์แล้ว`;
          badgeColor = 'var(--color-success)';
        } else if (act.status === 'approved') {
          if (!isHeadSigned) {
            title = `✍️ รอประธานฝ่ายลงนาม: ${act.title}`;
            message = `ฝ่าย${act.department?.name || 'สโมสร'} • ผ่านการตรวจงบแล้ว รอประธานฝ่ายลงนามรับรอง`;
            badgeColor = '#6366f1';
          } else {
            title = `✍️ รอนายกสโมสรลงนาม: ${act.title}`;
            message = `ฝ่าย${act.department?.name || 'สโมสร'} • ประธานฝ่ายเซ็นรับรองแล้ว รอนายกสโมสรนิสิตลงนามอนุมัติ`;
            badgeColor = '#e11d48';
          }
        } else if (act.status === 'revision') {
          title = `⚠️ ส่งกลับให้แก้ไข: ${act.title}`;
          message = `ฝ่าย${act.department?.name || 'สโมสร'} • มีข้อเสนอแนะให้ปรับปรุงโครงการ`;
          badgeColor = '#f59e0b';
        } else if (act.status === 'pending_treasurer' || act.status === 'pending_executive') {
          title = `📋 รอตรวจโครงการ: ${act.title}`;
          message = `ฝ่าย${act.department?.name || 'สโมสร'} • ส่งร่างงบประมาณให้เหรัญญิกและฝ่ายบริหารตรวจ`;
          badgeColor = 'var(--blue-600)';
        }

        return {
          id: `act-${act.id}`,
          type: 'activity',
          title,
          message,
          time: new Date(act.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
          link: `/activities/${act.id}`,
          badgeColor
        };
      })
    ];

    return NextResponse.json({ notifications, unreadCount: notifications.length });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 500 });
  }
}
