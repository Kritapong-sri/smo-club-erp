import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        department: { select: { name: true } }
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
      ...activities.map(act => ({
        id: `act-${act.id}`,
        type: 'activity',
        title: `กิจกรรม: ${act.title}`,
        message: `ฝ่าย${act.department?.name || 'สโมสร'} • สถานะ: ${act.status === 'approved' || act.status === 'completed' ? 'อนุมัติแล้ว' : 'กำลังดำเนินการ'}`,
        time: new Date(act.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        link: `/activities/${act.id}`,
        badgeColor: act.status === 'approved' || act.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)'
      }))
    ];

    return NextResponse.json({ notifications, unreadCount: notifications.length });
  } catch (error) {
    console.error('Notifications API error:', error);
    return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 500 });
  }
}
