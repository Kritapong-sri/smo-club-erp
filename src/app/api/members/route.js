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
      return NextResponse.json({ error: 'Forbidden: คุณไม่มีสิทธิ์ในการเพิ่มสมาชิก' }, { status: 403 });
    }

    const body = await request.json();
    const { 
      firstNameTh, lastNameTh, nickname, studentId, 
      password, positionTitle, departmentId, role, year, email, phone 
    } = body;

    if (!studentId || !studentId.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุรหัสนิสิต' }, { status: 400 });
    }

    if (!firstNameTh || !firstNameTh.trim()) {
      return NextResponse.json({ error: 'กรุณาระบุชื่อจริง' }, { status: 400 });
    }

    const normalizedStudentId = studentId.trim();
    const initialPassword = password?.trim() || normalizedStudentId;
    if (initialPassword.length < 8) {
      return NextResponse.json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
    }

    // Check duplicate studentId
    const existing = await prisma.member.findUnique({
      where: { studentId: normalizedStudentId }
    });

    if (existing) {
      return NextResponse.json({ error: 'รหัสนิสิตนี้มีในระบบแล้ว' }, { status: 400 });
    }

    const newMember = await prisma.member.create({
      data: {
        firstNameTh: firstNameTh.trim(),
        lastNameTh: lastNameTh?.trim() || null,
        nickname: nickname?.trim() || null,
        studentId: normalizedStudentId,
        password: await hashPassword(initialPassword),
        positionTitle: positionTitle?.trim() || null,
        departmentId: departmentId || null,
        role: role || 'member',
        year: year ? parseInt(year, 10) : null,
        email: email?.trim() || null,
        phone: phone?.trim() || null,
      },
      include: { department: true }
    });

    const { password: _password, ...safeMember } = newMember;
    return NextResponse.json(safeMember);
  } catch (error) {
    console.error('Create member error:', error);
    return NextResponse.json({ error: 'ไม่สามารถเพิ่มสมาชิกได้' }, { status: 500 });
  }
}
