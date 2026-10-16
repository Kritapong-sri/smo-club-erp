import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { hashPassword } from '@/lib/password';

export async function PATCH(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check permissions
    const isAdminOrPresident = session.role === 'admin' || 
      session.role === 'board' ||
      (session.positionTitle && session.positionTitle.includes('นายก'));

    if (!isAdminOrPresident) {
      return NextResponse.json({ error: 'Forbidden: คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลสมาชิก' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing member ID' }, { status: 400 });
    }

    const body = await request.json();
    const updateData = {};

    if (body.firstNameTh !== undefined) updateData.firstNameTh = body.firstNameTh?.trim() || null;
    if (body.lastNameTh !== undefined) updateData.lastNameTh = body.lastNameTh?.trim() || null;
    if (body.nickname !== undefined) updateData.nickname = body.nickname?.trim() || null;
    if (body.studentId !== undefined) updateData.studentId = body.studentId?.trim() || null;
    if (body.password !== undefined && body.password.trim() !== '') {
      const normalizedPassword = body.password.trim();
      if (normalizedPassword.length < 8) {
        return NextResponse.json({ error: 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร' }, { status: 400 });
      }
      updateData.password = await hashPassword(normalizedPassword);
    }
    if (body.positionTitle !== undefined) updateData.positionTitle = body.positionTitle?.trim() || null;
    if (body.departmentId !== undefined) updateData.departmentId = body.departmentId || null;
    if (body.role !== undefined) updateData.role = body.role || 'member';
    if (body.year !== undefined) updateData.year = body.year ? parseInt(body.year, 10) : null;
    if (body.email !== undefined) updateData.email = body.email?.trim() || null;
    if (body.phone !== undefined) updateData.phone = body.phone?.trim() || null;

    const updatedMember = await prisma.member.update({
      where: { id },
      data: updateData,
      include: { department: true }
    });

    const { password: _password, ...safeMember } = updatedMember;
    return NextResponse.json(safeMember);
  } catch (error) {
    console.error('Update member error:', error);
    return NextResponse.json({ error: 'ไม่สามารถแก้ไขข้อมูลสมาชิกได้' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdminOrPresident = session.role === 'admin' || 
      session.role === 'board' ||
      (session.positionTitle && session.positionTitle.includes('นายก'));

    if (!isAdminOrPresident) {
      return NextResponse.json({ error: 'Forbidden: คุณไม่มีสิทธิ์ในการลบสมาชิก' }, { status: 403 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Missing member ID' }, { status: 400 });
    }

    await prisma.member.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'ลบสมาชิกเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Delete member error:', error);
    return NextResponse.json({ error: `Failed to delete member: ${error.message}` }, { status: 500 });
  }
}
