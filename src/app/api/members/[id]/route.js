import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const isAdminOrPresident = session.role === 'admin' || 
      (session.positionTitle && session.positionTitle.includes('นายก'));

    if (!isAdminOrPresident) {
      return NextResponse.json({ error: 'Forbidden: คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลสมาชิก' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing member ID' }, { status: 400 });
    }

    const { positionTitle, departmentId, role } = await request.json();

    const updatedMember = await prisma.member.update({
      where: { id },
      data: {
        positionTitle: positionTitle || null,
        departmentId: departmentId || null,
        role: role || 'member',
      },
      include: { department: true }
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 });
  }
}
