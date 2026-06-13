import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: [
        { pinned: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        author: true,
      }
    });
    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAuthorized = session.role === 'admin' || session.role === 'board' || 
      ['นายกสโมสรนิสิต', 'อุปนายกฝ่ายใน', 'อุปนายกฝ่ายนอก', 'ผู้ช่วยนายกสโมสรนิสิต'].includes(session.positionTitle);
      
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Forbidden: คุณไม่มีสิทธิ์ในการสร้างประกาศ' }, { status: 403 });
    }

    const { title, content, customDate } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'กรุณากรอกหัวข้อและเนื้อหา' }, { status: 400 });
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        customDate: customDate ? new Date(customDate) : null,
        authorId: session.userId,
      },
      include: {
        author: true,
      }
    });

    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างประกาศ' }, { status: 500 });
  }
}
