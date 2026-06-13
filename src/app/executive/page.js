import StatusBadge from '@/components/StatusBadge';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function ExecutivePage() {
  const session = await getSession();

  const isExecutive = session && (
    session.role === 'admin' || 
    session.role === 'board' || 
    (session.positionTitle && (session.positionTitle.includes('นายก') || session.positionTitle.includes('อุปนายก')))
  );

  if (!isExecutive) {
    return (
      <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ color: 'var(--color-danger)', marginBottom: '8px' }}>ไม่มีสิทธิ์เข้าถึง (Access Denied)</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>หน้านี้สงวนสิทธิ์เฉพาะ <b>"นายกสโมสรนิสิต และ อุปนายก"</b> เท่านั้น</p>
        <Link href="/" className="btn btn-primary">กลับสู่หน้าหลัก</Link>
      </div>
    );
  }

  const activities = await prisma.activity.findMany({
    include: { department: true },
    orderBy: { createdAt: 'desc' }
  });

  const pendingActivities = activities.filter(a => a.status === 'pending_executive');
  const approvedActivities = activities.filter(a => a.status === 'approved' || a.status === 'completed');

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>มุมมองทีมบริหาร (สามเหลี่ยม)</h1>
        <p>ตรวจสอบรายละเอียดกิจกรรมและเอกสารก่อนอนุมัติ</p>
      </div>

      <div className="grid-2 mb-lg stagger-children">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.2)', color: 'var(--color-warning)' }}>⏳</div>
          <div className="stat-value">{pendingActivities.length}</div>
          <div className="stat-label">กิจกรรมที่รอการตรวจสอบ</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--color-success)' }}>✅</div>
          <div className="stat-value">{approvedActivities.length}</div>
          <div className="stat-label">กิจกรรมที่อนุมัติแล้วทั้งหมด</div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-md">
          <h3>กิจกรรมรอตรวจเอกสาร (Pending Reviews)</h3>
          <span className="status-badge pending_review">{pendingActivities.length} รายการ</span>
        </div>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>กิจกรรม</th>
                <th>ฝ่าย</th>
                <th>วันที่เริ่มกิจกรรม</th>
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
                    <td className="font-en">{act.startDate ? new Date(act.startDate).toLocaleDateString('th-TH') : '-'}</td>
                    <td className="font-en font-bold">฿{act.budgetRequested?.toLocaleString() || 0}</td>
                    <td><StatusBadge status={act.status} /></td>
                    <td>
                      <Link href={`/activities/${act.id}`} className="btn btn-primary btn-sm">ตรวจสอบ</Link>
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
            <h3>ไม่มีกิจกรรมรอตรวจ</h3>
            <p>คุณตรวจสอบเอกสารครบหมดแล้ว</p>
          </div>
        )}
      </div>
    </div>
  );
}
