import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { hashPassword } from '@/lib/password';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminOrPresident = session.role === 'admin' || 
      session.role === 'board' ||
      (session.positionTitle && session.positionTitle.includes('นายก'));

    if (!isAdminOrPresident) {
      return NextResponse.json({ error: 'Forbidden: คุณไม่มีสิทธิ์ในการรีเซ็ตรหัสผ่าน' }, { status: 403 });
    }

    const { defaultPassword } = await request.json();

    const normalizedDefaultPassword = defaultPassword?.trim();
    if (normalizedDefaultPassword && normalizedDefaultPassword.length < 8) {
      return NextResponse.json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
    }

    const members = await prisma.member.findMany({
      where: { studentId: { not: null } },
      select: { id: true, studentId: true },
    });

    const passwordUpdates = await Promise.all(
      members.map(async (member) => ({
        id: member.id,
        password: await hashPassword(normalizedDefaultPassword || member.studentId),
      }))
    );

    await prisma.$transaction(
      passwordUpdates.map(({ id, password }) => prisma.member.update({
        where: { id },
        data: { password },
      }))
    );

    const message = normalizedDefaultPassword
      ? 'รีเซ็ตรหัสผ่านสมาชิกทุกคนเป็นรหัสผ่านกลางเรียบร้อยแล้ว'
      : 'รีเซ็ตรหัสผ่านสมาชิกทุกคนเป็นรหัสนิสิตเริ่มต้นเรียบร้อยแล้ว';
    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error('Reset passwords error:', error);
    return NextResponse.json({ error: 'ไม่สามารถรีเซ็ตรหัสผ่านได้' }, { status: 500 });
  }
}
