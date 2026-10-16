import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';

  const allPages = [
    { href: '/', title: 'หน้าหลัก Dashboard', desc: 'ภาพรวมระบบและปฏิทินกิจกรรมสโมสร' },
    { href: '/activities', title: 'กิจกรรม Activities', desc: 'โครงการ งบประมาณ และเอกสารกิจกรรม' },
    { href: '/members', title: 'สมาชิก Members', desc: 'ทำเนียบนิสิต และข้อมูลสมาชิกสโมสร' },
    { href: '/smo-helper', title: 'SMO Helper', desc: 'เครื่องมือช่วยเหลือ แบบฟอร์มสโมสร' },
    { href: '/profile', title: 'โปรไฟล์ของฉัน Profile', desc: 'ข้อมูลส่วนตัว รหัสผ่าน และการตั้งค่า' },
    { href: '/treasurer', title: 'เหรัญญิก Treasurer', desc: 'สรุปการเงิน และ Money Plan (MP)' },
    { href: '/executive', title: 'สามเหลี่ยม Executive', desc: 'ระบบพิจารณาอนุมัติโครงการ' },
  ];

  if (!q) {
    return NextResponse.json({
      activities: [],
      members: [],
      pages: allPages.slice(0, 4)
    });
  }

  try {
    const members = await prisma.member.findMany({
      where: {
        OR: [
          { firstNameTh: { contains: q, mode: 'insensitive' } },
          { lastNameTh: { contains: q, mode: 'insensitive' } },
          { nickname: { contains: q, mode: 'insensitive' } },
          { studentId: { contains: q, mode: 'insensitive' } },
          { positionTitle: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
        ]
      },
      take: 6,
      select: {
        id: true,
        prefix: true,
        firstNameTh: true,
        lastNameTh: true,
        nickname: true,
        studentId: true,
        positionTitle: true,
        avatarUrl: true,
        year: true,
        major: true
      }
    });

    const activities = await prisma.activity.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 6,
      select: {
        id: true,
        title: true,
        status: true,
        startDate: true,
        createdAt: true,
        department: { select: { name: true } }
      }
    });

    const pages = allPages.filter(p =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.desc.toLowerCase().includes(q.toLowerCase()) ||
      p.href.toLowerCase().includes(q.toLowerCase())
    );

    return NextResponse.json({ activities, members, pages });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ activities: [], members: [], pages: [] }, { status: 500 });
  }
}
