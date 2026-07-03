import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';

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

    console.log(`[LOGIN ATTEMPT] studentId: ${studentId}, password: ${password}`);

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

    // ตรวจสอบว่าพบสมาชิกและรหัสผ่านตรงกันหรือไม่
    // ถ้า password ใน DB เป็น null = ยังไม่ได้ตั้ง → ใช้รหัสนิสิตเป็นรหัสผ่านเริ่มต้น
    const expectedPassword = member.password || member.studentId;
    if (expectedPassword !== password) {
      console.log(`[LOGIN FAILED] Invalid password for studentId: ${studentId}. Expected: ${member.password}`);
      return NextResponse.json(
        { error: 'รหัสนิสิตหรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }

    // สร้าง Session Cookie
    await createSession(member);

    return NextResponse.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ' });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: `เกิดข้อผิดพลาดในการเข้าสู่ระบบ: ${error.message}` },
      { status: 500 }
    );
  }
}
