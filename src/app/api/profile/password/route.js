import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { hashPassword, verifyPassword } from '@/lib/password';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่' }, { status: 400 });
    }

    const normalizedCurrentPassword = currentPassword.trim();
    const normalizedNewPassword = newPassword.trim();

    if (normalizedNewPassword.length < 8) {
      return NextResponse.json({ error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
    }

    const member = await prisma.member.findUnique({
      where: { id: session.userId }
    });

    if (!member) {
      return NextResponse.json({ error: 'ไม่พบผู้ใช้ในระบบ' }, { status: 404 });
    }

    if (!await verifyPassword(normalizedCurrentPassword, member.password, member.studentId)) {
      return NextResponse.json({ error: 'รหัสผ่านเดิมไม่ถูกต้อง' }, { status: 400 });
    }

    await prisma.member.update({
      where: { id: session.userId },
      data: { password: await hashPassword(normalizedNewPassword) }
    });

    return NextResponse.json({ success: true, message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'ไม่สามารถเปลี่ยนรหัสผ่านได้' }, { status: 500 });
  }
}
