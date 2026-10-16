'use client';
import { FileText, Banknote, AlertTriangle, Wallet } from 'lucide-react';

export default function BudgetDashboard({ summary }) {
  const { budgetApproved = 0, planned = {}, actual = {}, remaining = 0 } = summary || {};
  
  const plannedTotal = planned.total || 0;
  const actualTotal = actual.total || 0;
  const spentPercent = budgetApproved > 0 ? Math.min(Math.round((actualTotal / budgetApproved) * 100), 100) : 0;
  
  const fmt = (val) => `฿${Math.round(val).toLocaleString()}`;

  const categories = [
    { label: 'ค่าตอบแทน', planned: planned.compensation || 0, actual: actual.compensation || 0, colorPlanned: 'var(--blue-300)', colorActual: 'var(--blue-600)' },
    { label: 'ค่าใช้สอย', planned: planned.operating || 0, actual: actual.operating || 0, colorPlanned: 'rgba(245, 158, 11, 0.4)', colorActual: 'var(--color-warning)' },
    { label: 'ค่าวัสดุ', planned: planned.materials || 0, actual: actual.materials || 0, colorPlanned: 'rgba(16, 185, 129, 0.4)', colorActual: 'var(--color-success)' }
  ];

  const maxVal = Math.max(...categories.map(c => Math.max(c.planned, c.actual)), 10000);

  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (spentPercent / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="grid-3 stagger-children">
        <div className="stat-card hover-lift" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: 'var(--blue-600)' }}>
            <FileText size={20} />
          </div>
          <div className="stat-value">{fmt(budgetApproved)}</div>
          <div className="stat-label">งบประมาณอนุมัติทั้งหมด</div>
          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            งบประมาณวางแผนรวม: {fmt(plannedTotal)}
          </div>
        </div>

        <div className="stat-card hover-lift" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', position: 'relative', overflow: 'hidden' }}>
          <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-success)' }}>
            <Banknote size={20} />
          </div>
          <div className="stat-value" style={{ color: actualTotal > budgetApproved ? 'var(--color-danger)' : 'var(--text-primary)' }}>
            {fmt(actualTotal)}
          </div>
          <div className="stat-label">รายจ่ายเกิดขึ้นจริง</div>
          
          <div className="progress-bar mt-sm" style={{ height: '6px' }}>
            <div 
              className="progress-fill" 
              style={{ 
                width: `${spentPercent}%`, 
                background: actualTotal > budgetApproved ? 'var(--color-danger)' : 'var(--color-success)' 
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
            <span>การใช้งานงบ</span>
            <span>{spentPercent}%</span>
          </div>
        </div>

        <div className="stat-card hover-lift" style={{ 
          background: 'var(--bg-glass)', 
          border: remaining < 0 ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-primary)',
          backgroundColor: remaining < 0 ? 'rgba(239, 68, 68, 0.03)' : 'var(--bg-surface)'
        }}>
          <div className="stat-icon" style={{ 
            backgroundColor: remaining < 0 ? 'var(--color-danger-bg)' : 'rgba(245, 158, 11, 0.15)', 
            color: remaining < 0 ? 'var(--color-danger)' : 'var(--color-warning)' 
          }}>
            {remaining < 0 ? <AlertTriangle size={20} /> : <Wallet size={20} />}
          </div>
          <div className="stat-value" style={{ color: remaining < 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>
            {fmt(remaining)}
          </div>
          <div className="stat-label">งบประมาณคงเหลือ</div>
          <div style={{ fontSize: '12px', color: remaining < 0 ? 'var(--color-danger)' : 'var(--text-tertiary)', marginTop: '4px' }}>
            {remaining < 0 ? 'ใช้งบประมาณเกินอนุมัติ!' : 'งบประมาณคงเหลือพร้อมใช้งาน'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="desktop-grid-2">
        <div className="card hover-glow" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)' }}>
          <h3 className="mb-md">เปรียบเทียบงบประมาณรายหมวด (แผนงาน vs จ่ายจริง)</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>
            {categories.map((cat, idx) => {
              const plannedWidth = Math.max((cat.planned / maxVal) * 100, 2);
              const actualWidth = Math.max((cat.actual / maxVal) * 100, 2);

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '500', fontSize: '14px' }}>
                    <span>{cat.label}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>
                      แผน: <span style={{ color: 'var(--text-primary)' }}>{fmt(cat.planned)}</span> | จริง: <span style={{ color: cat.actual > cat.planned ? 'var(--color-danger)' : 'var(--text-primary)' }}>{fmt(cat.actual)}</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0,0,0,0.02)', padding: '6px', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', width: '32px' }}>แผน</span>
                      <div style={{ flexGrow: 1, height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${plannedWidth}%`, 
                            height: '100%', 
                            background: cat.colorPlanned,
                            borderRadius: '999px',
                            transition: 'width 0.5s ease-in-out'
                          }} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', width: '32px' }}>จริง</span>
                      <div style={{ flexGrow: 1, height: '12px', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            width: `${actualWidth}%`, 
                            height: '100%', 
                            background: cat.actual > cat.planned ? 'var(--color-danger)' : cat.colorActual,
                            borderRadius: '999px',
                            transition: 'width 0.5s ease-in-out'
                          }} 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px', fontSize: '12px', color: 'var(--text-tertiary)', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', background: 'var(--blue-300)' }} />
              <span>แผนงบประมาณ (Money Plan)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', background: 'var(--blue-600)' }} />
              <span>ค่าใช้จ่ายที่จ่ายจริง</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '2px', background: 'var(--color-danger)' }} />
              <span>เกินงบแผนงาน</span>
            </div>
          </div>
        </div>

        <div className="card hover-glow" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <h3 className="mb-md" style={{ width: '100%' }}>ความก้าวหน้าการเบิกจ่าย</h3>
          
          <div style={{ position: 'relative', width: '150px', height: '150px', margin: '20px 0' }}>
            <svg width="150" height="150" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="rgba(0, 0, 0, 0.05)"
                strokeWidth={strokeWidth}
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={actualTotal > budgetApproved ? 'var(--color-danger)' : 'var(--blue-500)'}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
              />
            </svg>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>{spentPercent}%</span>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>ของงบอนุมัติ</span>
            </div>
          </div>

          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            ใช้จริงแล้ว <b>{fmt(actualTotal)}</b> จากงบอนุมัติทั้งหมด <b>{fmt(budgetApproved)}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
