import Link from 'next/link';
import StatusBadge from './StatusBadge';
import { Calendar } from 'lucide-react';

export default function ActivityCard({ activity }) {
  const startDate = activity.startDate || activity.start_date;
  const budgetReq = activity.budgetRequested ?? activity.budget_requested ?? 0;
  const budgetApp = activity.budgetApproved ?? activity.budget_approved;
  
  const dept = activity.department;
  
  return (
    <Link href={`/activities/${activity.id}`}>
      <div className="activity-card hover-lift">
        {dept && (
          <div 
            className="activity-card-dept" 
            style={{ backgroundColor: dept.color }}
          />
        )}
        
        <div className="activity-card-header">
          <h3 className="activity-card-title">{activity.title}</h3>
          <StatusBadge status={activity.status} />
        </div>
        
        <div className="activity-card-meta">
          <span className="flex items-center gap-xs">
            <Calendar size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span>{startDate ? new Date(startDate).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', year: 'numeric' }) : 'ไม่ระบุวัน'}</span>
          </span>
          {dept && <span className="dept-tag" style={{ color: dept.color, borderColor: dept.color }}>{dept.name}</span>}
        </div>
        
        <div className="activity-card-budget">
          <div>
            <div className="budget-label">งบที่ขอ</div>
            <div className="budget-amount">฿{budgetReq.toLocaleString()}</div>
          </div>
          {budgetApp != null && (
            <div className="text-right">
              <div className="budget-label">อนุมัติแล้ว</div>
              <div className="budget-amount" style={{ color: 'var(--color-success)' }}>
                ฿{budgetApp.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
