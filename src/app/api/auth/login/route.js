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

    // ตรวจสอบรหัสผ่าน:
    // 1. ถ้า password ใน DB เป็น null (ยังไม่เคยตั้ง) → รหัสผ่านเริ่มต้นคือ studentId
    // 2. ถ้าตั้งรหัสแล้ว → ต้องตรงกับรหัสที่ตั้งไว้เท่านั้น (รองรับทั้ง hash และ plaintext เก่า)
    let isValidPassword = false;
    if (!member.password) {
      isValidPassword = (password === member.studentId);
    } else {
      isValidPassword = await verifyPassword(password, member.password);
    }

    if (!isValidPassword) {
      console.log(`[LOGIN FAILED] Invalid password for studentId: ${studentId}`);
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
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}
