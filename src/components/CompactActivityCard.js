'use client';
import Link from 'next/link';

export default function CompactActivityCard({ activity }) {
  const startDate = activity.startDate || activity.start_date;
  const dept = activity.department;

  // Helper to map status to styling
  const getStatusProps = (status) => {
    switch (status) {
      case 'approved':
        return { label: 'อนุมัติแล้ว', bg: 'var(--color-success-bg, #DCFCE7)', color: 'var(--color-success, #16A34A)' };
      case 'completed':
        return { label: 'เสร็จสิ้น', bg: 'var(--color-success-bg, #DCFCE7)', color: 'var(--color-success, #16A34A)' };
      case 'pending_review':
        return { label: 'รอตรวจ', bg: 'var(--color-info-bg, #DBEAFE)', color: 'var(--color-info, #2563EB)' };
      case 'revision':
        return { label: 'แก้ไข', bg: 'var(--color-danger-bg, #FEE2E2)', color: 'var(--color-danger, #DC2626)' };
      default:
        return { label: 'ร่าง / วางแผน', bg: 'var(--color-warning-bg, #FEF9C3)', color: 'var(--color-warning, #D97706)' };
    }
  };

  const statusProps = getStatusProps(activity.status);

  return (
    <Link href={`/activities/${activity.id}`} style={{ display: 'block', flexShrink: 0, textDecoration: 'none' }}>
      <div 
        style={{
          width: '280px',
          padding: '16px',
          border: '1px solid var(--border-primary)',
          borderRadius: '12px',
          background: 'var(--bg-surface)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--blue-400)';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--border-primary)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
        }}
      >
        <div>
          <span style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 600,
            backgroundColor: statusProps.bg,
            color: statusProps.color
          }}>
            {statusProps.label}
          </span>
        </div>
        
        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>
          {activity.title}
        </h4>
        
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {dept && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ 
                width: '8px', height: '8px', borderRadius: '50%', 
                backgroundColor: dept.color || 'var(--blue-500)' 
              }}></span>
              {dept.name}
            </div>
          )}
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            {startDate ? new Date(startDate).toLocaleDateString('th-TH') : 'ไม่ระบุวัน'}
          </div>
        </div>
      </div>
    </Link>
  );
}
