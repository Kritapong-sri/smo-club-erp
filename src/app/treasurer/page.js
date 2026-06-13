import StatusBadge from '@/components/StatusBadge';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getSession } from '@/lib/session';

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
    include: { department: true }
  });

  const totalBudget = activities.reduce((sum, a) => sum + (a.budgetRequested || 0), 0);
  const approvedBudget = activities.reduce((sum, a) => sum + (a.budgetApproved || 0), 0);
  
  const pendingActivities = activities.filter(a => a.status === 'pending_treasurer');
  const pendingBudget = pendingActivities.reduce((sum, a) => sum + (a.budgetRequested || 0), 0);

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>มุมมองเหรัญญิก</h1>
        <p>ตรวจสอบเอกสาร อนุมัติงบ และดูภาพรวมการเงิน</p>
      </div>

      <div className="grid-3 mb-lg stagger-children">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--blue-400)' }}>💰</div>
          <div className="stat-value">฿{totalBudget.toLocaleString()}</div>
          <div className="stat-label">งบประมาณที่ขอทั้งหมด</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)' }}>✅</div>
          <div className="stat-value">฿{approvedBudget.toLocaleString()}</div>
          <div className="stat-label">งบประมาณที่อนุมัติแล้ว</div>
          <div className="progress-bar mt-sm">
            <div 
              className="progress-fill" 
              style={{ width: `${totalBudget > 0 ? (approvedBudget/totalBudget)*100 : 0}%`, background: 'var(--color-success)' }}
            />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--color-warning)' }}>⏳</div>
          <div className="stat-value">฿{pendingBudget.toLocaleString()}</div>
          <div className="stat-label">งบที่รอการตรวจสอบ</div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-md">
          <h3>เอกสารรอตรวจ (Pending Reviews)</h3>
          <span className="status-badge pending_review">{pendingActivities.length} รายการ</span>
        </div>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>กิจกรรม</th>
                <th>ฝ่าย</th>
                <th>วันที่</th>
                <th>งบที่ขอ</th>
                <th>สถานะ</th>
                <th>การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {pendingActivities.map(act => {
                const dept = act.department;
                return (
                  <tr key={act.id}>
                    <td className="font-medium">{act.title}</td>
                    <td>
                      {dept && <span className="dept-tag" style={{ color: dept.color, borderColor: dept.color }}>{dept.name}</span>}
                    </td>
                    <td className="font-en">{new Date(act.createdAt).toLocaleDateString('th-TH')}</td>
                    <td className="font-en font-bold text-warning">฿{act.budgetRequested?.toLocaleString() || 0}</td>
                    <td><StatusBadge status={act.status} /></td>
                    <td>
                      <Link href={`/activities/${act.id}`} className="btn btn-primary btn-sm">ตรวจเอกสาร</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {pendingActivities.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">✅</div>
            <h3>ไม่มีเอกสารรอตรวจ</h3>
            <p>คุณตรวจสอบเอกสารครบหมดแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
}
