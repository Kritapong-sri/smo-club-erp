import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';
import { hashPassword, isPasswordHash, verifyPassword } from '@/lib/password';

export async function POST(request) {
  try {
    let { studentId, password } = await request.json();

    if (!studentId || !password) {
      return NextResponse.json(
        { error: 'กรุณากรอกรหัสนิสิตและรหัสผ่าน' },
        { status: 400 }
      );
    }

    studentId = studentId.trim();
    password = password.trim();

    // ค้นหาสมาชิกในฐานข้อมูล
    const member = await prisma.member.findUnique({
      where: { studentId },
    });

    if (!member) {
      console.log(`[LOGIN FAILED] Member not found for studentId: ${studentId}`);
      return NextResponse.json(
        { error: 'รหัสนิสิตหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // รองรับข้อมูลเดิมที่เป็น plaintext/null แล้วอัปเกรดเป็น hash หลังล็อกอินสำเร็จ
    const isValidPassword = await verifyPassword(password, member.password, member.studentId);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'รหัสนิสิตหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    if (!isPasswordHash(member.password)) {
      await prisma.member.update({
        where: { id: member.id },
        data: { password: await hashPassword(password) },
      });
    }

    // สร้าง Session Cookie
    await createSession(member);

    return NextResponse.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}
