'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import BudgetDashboard from '@/components/BudgetDashboard';
import StatusBadge from '@/components/StatusBadge';

export default function TreasurerClient({ initialActivities, departments }) {
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [selectedDeptId, setSelectedDeptId] = useState('all');

  // Compute stats based on filters
  const filteredActivities = useMemo(() => {
    return initialActivities.filter(act => {
      const matchProject = selectedProjectId === 'all' || act.id === selectedProjectId;
      const matchDept = selectedDeptId === 'all' || act.departmentId === selectedDeptId;
      return matchProject && matchDept;
    });
  }, [initialActivities, selectedProjectId, selectedDeptId]);

  // Aggregate budget items from filtered activities
  const aggregatedSummary = useMemo(() => {
    // Collect all activities that match the filters
    const acts = filteredActivities;
    
    // Total budget approved is sum of budgetApproved of filtered activities
    const budgetApproved = acts.reduce((sum, a) => sum + (a.budgetApproved || 0), 0);
    
    const summary = {
      budgetApproved,
      planned: { total: 0, compensation: 0, operating: 0, materials: 0, other: 0 },
      actual: { total: 0, compensation: 0, operating: 0, materials: 0, other: 0 },
      remaining: 0
    };

    acts.forEach(act => {
      const items = act.budgetItems || [];
      items.forEach(item => {
        const val = item.total || 0;
        const type = item.type;
        const category = item.category;

        let catKey = 'other';
        if (category === 'ค่าตอบแทน') catKey = 'compensation';
        else if (category === 'ค่าใช้สอย') catKey = 'operating';
        else if (category === 'ค่าวัสดุ') catKey = 'materials';

        if (type === 'planned') {
          summary.planned.total += val;
          summary.planned[catKey] += val;
        } else if (type === 'actual') {
          summary.actual.total += val;
          summary.actual[catKey] += val;
        }
      });
    });

    summary.remaining = summary.budgetApproved - summary.actual.total;
    return summary;
  }, [filteredActivities]);

  // Helper to format currency
  const fmt = (val) => `฿${Math.round(val).toLocaleString()}`;

  // Activities pending treasurer check
  const pendingActivities = initialActivities.filter(a => a.status === 'pending_treasurer');

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header */}
      <div className="card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>📊 แดชบอร์ดการเงินสโมสรนิสิต (Treasurer Hub)</h1>
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '4px' }}>ภาพรวมงบประมาณรายรับ-รายจ่าย คัดกรอง ค้นหา และอนุมัติโครงการ</p>
          </div>
          
          {/* Pending counter button */}
          <Link href="#pending-reviews" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>⏳ รอตรวจงบ:</span>
            <span className="status-badge pending_review" style={{ fontSize: '12px' }}>{pendingActivities.length} โครงการ</span>
          </Link>
        </div>

        {/* Filter Bar */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '12px', 
          marginTop: '20px', 
          paddingTop: '20px', 
          borderTop: '1px solid var(--border-secondary)' 
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>คัดกรองโครงการ</label>
            <select 
              className="input" 
              value={selectedProjectId} 
              onChange={e => {
                setSelectedProjectId(e.target.value);
                // Reset department filter if selecting specific project to avoid empty results
                if (e.target.value !== 'all') setSelectedDeptId('all');
              }}
            >
              <option value="all">📂 โครงการทั้งหมด ({initialActivities.length})</option>
              {initialActivities.map(a => (
                <option key={a.id} value={a.id}>
                  {a.title} ({a.status === 'approved' ? 'อนุมัติแล้ว' : a.status === 'completed' ? 'เสร็จสิ้น' : 'แบบร่าง'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', marginBottom: '6px', color: 'var(--text-secondary)' }}>คัดกรองตามฝ่าย</label>
            <select 
              className="input" 
              value={selectedDeptId} 
              onChange={e => {
                setSelectedDeptId(e.target.value);
                if (e.target.value !== 'all') setSelectedProjectId('all');
              }}
            >
              <option value="all">🏢 ฝ่ายทั้งหมด ({departments.length})</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => { setSelectedProjectId('all'); setSelectedDeptId('all'); }} 
              style={{ width: '100%', justifyContent: 'center' }}
            >
              🔄 ล้างฟิลเตอร์
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate Finance Dashboard */}
      <BudgetDashboard summary={aggregatedSummary} />

      {/* Pending Reviews Section */}
      <div id="pending-reviews" className="card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>📝 กิจกรรมที่ส่งตรวจงบ (Pending Budget Reviews)</h3>
          <span className="status-badge pending_review">{pendingActivities.length} รายการ</span>
        </div>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>กิจกรรม</th>
                <th>ฝ่าย</th>
                <th>งบที่ขอ</th>
                <th>สถานะ</th>
                <th>วันที่ส่งตรวจ</th>
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
                    <td className="font-en font-bold text-warning">{fmt(act.budgetRequested || 0)}</td>
                    <td><StatusBadge status={act.status} /></td>
                    <td className="font-en text-sm">{new Date(act.createdAt).toLocaleDateString('th-TH')}</td>
                    <td>
                      <Link href={`/activities/${act.id}`} className="btn btn-primary btn-sm">ตรวจงบละเอียด</Link>
                    </td>
                  </tr>
                );
              })}
              {pendingActivities.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                    ✅ ตรวจสอบครบทุกโครงการแล้ว ไม่มีงานค้าง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Projects Health Overview */}
      <div className="card" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '20px' }}>
        <h3 className="mb-md">📂 สถานะการเงินจำแนกตามโครงการ (Projects Financial Health)</h3>
        
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ชื่อโครงการ</th>
                <th>ฝ่ายที่รับผิดชอบ</th>
                <th className="text-right">งบที่อนุมัติ</th>
                <th className="text-right">แผนงบรวม (MP)</th>
                <th className="text-right">ใช้จ่ายจริง (Actual)</th>
                <th className="text-right">งบคงเหลือ</th>
                <th>สุขภาพงบประมาณ</th>
                <th>เข้าดูรายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map(act => {
                const dept = act.department;
                const items = act.budgetItems || [];
                const approved = act.budgetApproved || 0;
                
                const planned = items
                  .filter(i => i.type === 'planned')
                  .reduce((sum, i) => sum + (i.total || 0), 0);
                  
                const spent = items
                  .filter(i => i.type === 'actual')
                  .reduce((sum, i) => sum + (i.total || 0), 0);
                  
                const rem = approved - spent;
                
                let healthLabel = 'ปกติ';
                let healthColor = 'var(--color-success)';
                if (rem < 0) {
                  healthLabel = 'งบเกินอนุมัติ';
                  healthColor = 'var(--color-danger)';
                } else if (spent === 0 && planned > approved) {
                  healthLabel = 'แผนงบเกินงบอนุมัติ';
                  healthColor = 'var(--color-warning)';
                } else if (spent > 0 && spent >= approved * 0.9) {
                  healthLabel = 'งบใกล้หมด (90%+)';
                  healthColor = 'var(--color-warning)';
                }

                return (
                  <tr key={act.id}>
                    <td className="font-medium">{act.title}</td>
                    <td>
                      {dept && <span className="dept-tag" style={{ color: dept.color, borderColor: dept.color }}>{dept.icon} {dept.name}</span>}
                    </td>
                    <td className="text-right font-en font-bold text-success">{fmt(approved)}</td>
                    <td className="text-right font-en">{fmt(planned)}</td>
                    <td className="text-right font-en font-bold">{fmt(spent)}</td>
                    <td className="text-right font-en font-bold" style={{ color: rem < 0 ? 'var(--color-danger)' : 'var(--text-primary)' }}>{fmt(rem)}</td>
                    <td>
                      <span className="font-medium" style={{ color: healthColor }}>
                        ● {healthLabel}
                      </span>
                    </td>
                    <td>
                      <Link href={`/activities/${act.id}`} className="btn btn-sm btn-outline">
                        🔎 ดูระบบการเงิน
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {filteredActivities.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                    ไม่พบโครงการที่ตรงตามเงื่อนไขตัวกรอง
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
