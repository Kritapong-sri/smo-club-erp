'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import BudgetDashboard from '@/components/BudgetDashboard';
import StatusBadge from '@/components/StatusBadge';
import { PieChart, Clock, RotateCcw, FileText, CheckCircle2, Folder, Search } from 'lucide-react';

export default function TreasurerClient({ initialActivities, departments }) {
  const [selectedProjectId, setSelectedProjectId] = useState('all');
  const [selectedDeptId, setSelectedDeptId] = useState('all');

  const filteredActivities = useMemo(() => {
    return initialActivities.filter(act => {
      const matchProject = selectedProjectId === 'all' || act.id === selectedProjectId;
      const matchDept = selectedDeptId === 'all' || act.departmentId === selectedDeptId;
      return matchProject && matchDept;
    });
  }, [initialActivities, selectedProjectId, selectedDeptId]);

  const aggregatedSummary = useMemo(() => {
    const acts = filteredActivities;
    
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

  const fmt = (val) => `฿${Math.round(val).toLocaleString()}`;

  const pendingActivities = initialActivities.filter(a => a.status === 'pending_treasurer');

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div className="card hover-glow" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={24} style={{ color: 'var(--blue-600)' }} />
              <span>แดชบอร์ดการเงินสโมสรนิสิต (Treasurer Hub)</span>
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '4px' }}>ภาพรวมงบประมาณรายรับ-รายจ่าย คัดกรอง ค้นหา และอนุมัติโครงการ</p>
          </div>
          
          <Link href="#pending-reviews" className="btn btn-secondary btn-sm hover-scale" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} style={{ color: 'var(--color-warning)' }} />
            <span>รอตรวจงบ:</span>
            <span className="status-badge pending_review" style={{ fontSize: '12px' }}>{pendingActivities.length} โครงการ</span>
          </Link>
        </div>

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
                if (e.target.value !== 'all') setSelectedDeptId('all');
              }}
            >
              <option value="all">โครงการทั้งหมด ({initialActivities.length})</option>
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
              <option value="all">ฝ่ายทั้งหมด ({departments.length})</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button 
              className="btn btn-outline hover-lift flex items-center justify-center gap-xs" 
              onClick={() => { setSelectedProjectId('all'); setSelectedDeptId('all'); }} 
              style={{ width: '100%' }}
            >
              <RotateCcw size={14} />
              <span>ล้างฟิลเตอร์</span>
            </button>
          </div>
        </div>
      </div>

      <BudgetDashboard summary={aggregatedSummary} />

      <div id="pending-reviews" className="card hover-glow" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} style={{ color: 'var(--blue-600)' }} />
            <span>กิจกรรมที่ส่งตรวจงบ (Pending Budget Reviews)</span>
          </h3>
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <CheckCircle2 size={16} style={{ color: 'var(--color-success)' }} />
                      <span>ตรวจสอบครบทุกโครงการแล้ว ไม่มีงานค้าง</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card hover-glow" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-primary)', padding: '20px' }}>
        <h3 className="mb-md flex items-center gap-xs">
          <Folder size={18} style={{ color: 'var(--blue-600)' }} />
          <span>สถานะการเงินจำแนกตามโครงการ (Projects Financial Health)</span>
        </h3>
        
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
                      {dept && <span className="dept-tag" style={{ color: dept.color, borderColor: dept.color }}>{dept.name}</span>}
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
                      <Link href={`/activities/${act.id}`} className="btn btn-sm btn-outline flex items-center gap-xs">
                        <Search size={13} /> ดูระบบการเงิน
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
