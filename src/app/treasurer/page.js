import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import TreasurerClient from '@/components/TreasurerClient';

export const dynamic = 'force-dynamic';

export default async function TreasurerPage() {
  const session = await getSession();

  const isTreasurer = session && (
    session.role === 'admin' || 
    session.role === 'board' || 
    (session.positionTitle && session.positionTitle.includes('เหรัญญิก'))
  );

  if (!isTreasurer) {
    return (
      <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ color: 'var(--color-danger)', marginBottom: '8px' }}>ไม่มีสิทธิ์เข้าถึง (Access Denied)</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>หน้านี้สงวนสิทธิ์เฉพาะผู้ที่มีตำแหน่ง <b>"เหรัญญิก"</b> เท่านั้น</p>
        <Link href="/" className="btn btn-primary">กลับสู่หน้าหลัก</Link>
      </div>
    );
  }

  const activities = await prisma.activity.findMany({
    include: { 
      department: true,
      budgetItems: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <TreasurerClient 
      initialActivities={activities} 
      departments={departments} 
    />
  );
}

