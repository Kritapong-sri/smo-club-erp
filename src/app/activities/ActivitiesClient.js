'use client';
import { useState } from 'react';
import ActivityCard from '@/components/ActivityCard';

export default function ActivitiesClient({ initialActivities, departments, session }) {
  const [activities, setActivities] = useState(initialActivities);
  const [filterDept, setFilterDept] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const canCreateActivity = session && (
    ['admin', 'board', 'od', 'head'].includes(session.role) ||
    (session.positionTitle && (
      session.positionTitle.includes('นายก') ||
      session.positionTitle.includes('อุปนายก') ||
      session.positionTitle.includes('ประธานฝ่าย')
    ))
  );

  // --- 2. Form State (ตัวแปรเก็บค่าฟอร์มสร้างกิจกรรม) ---
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budgetRequested, setBudgetRequested] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const filteredActivities = activities.filter(a => {
    if (filterDept !== 'all' && a.departmentId !== filterDept) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !departmentId || !startDate || !endDate) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลที่มีเครื่องหมาย * ให้ครบถ้วน' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          departmentId,
          startDate,
          endDate,
          budgetRequested: budgetRequested ? parseFloat(budgetRequested) : 0,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'เกิดข้อผิดพลาดในการสร้างกิจกรรม');
      }

      const newActivity = await res.json();
      
      // อัปเดตรายการกิจกรรมบนหน้าจอทันที ไม่ต้องรีเฟรช
      const selectedDept = departments.find(d => d.id === newActivity.departmentId);
      const activityForUI = { ...newActivity, department: selectedDept };
      
      setActivities(prev => [activityForUI, ...prev]);
      setMessage({ type: 'success', text: '✅ สร้างกิจกรรมสำเร็จ!' });
      
      // ล้างฟอร์ม
      setTitle('');
      setDescription('');
      setDepartmentId('');
      setStartDate('');
      setEndDate('');
      setBudgetRequested('');
      
      // ปิดฟอร์มหลังจากสำเร็จ 1.5 วินาที
      setTimeout(() => {
        setShowCreateForm(false);
        setMessage(null);
      }, 1500);

    } catch (err) {
      setMessage({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header-row mb-lg" style={{ alignItems: 'flex-start' }}>
        <div className="page-header mb-0">
          <h1>กิจกรรมแต่ละฝ่าย</h1>
          <p>ติดตามสถานะ งบประมาณ และเอกสารของทุกกิจกรรม</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          {/* 
            เอาปุ่มจำลองสิทธิ์ (Mock Role Selector) ออก 
            และใช้สิทธิ์จาก Session ของผู้ใช้แทน
          */}

          <div style={{ position: 'relative' }}>
            <button 
              className="btn btn-primary"
              onClick={() => canCreateActivity && setShowCreateForm(!showCreateForm)}
              style={{ 
                opacity: canCreateActivity ? 1 : 0.5, 
                cursor: canCreateActivity ? 'pointer' : 'not-allowed',
                background: canCreateActivity ? 'var(--blue-600)' : 'var(--text-tertiary)'
              }}
              title={!canCreateActivity ? 'เฉพาะระดับประธานฝ่ายขึ้นไปเท่านั้น' : ''}
            >
              {showCreateForm ? '❌ ปิดฟอร์ม' : '➕ สร้างกิจกรรมใหม่'}
            </button>
            {!canCreateActivity && (
              <div style={{ fontSize: '11px', color: 'var(--color-danger)', position: 'absolute', right: 0, top: '40px', width: 'max-content' }}>
                * เฉพาะหัวหน้าฝ่ายขึ้นไป
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Activity Creation Form --- */}
      {showCreateForm && canCreateActivity && (
        <form onSubmit={handleSubmit} className="card mb-lg animate-fade-in" style={{ borderTop: '4px solid var(--blue-500)', boxShadow: 'var(--shadow-md)' }}>
          <div className="flex items-center gap-sm mb-md">
            <div style={{ background: 'var(--color-info-bg)', color: 'var(--blue-600)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📝</div>
            <h3 style={{ margin: 0 }}>แบบฟอร์มเสนอจัดกิจกรรมใหม่</h3>
          </div>

          {message && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px', fontWeight: 600,
              background: message.type === 'success' ? 'var(--color-success-bg, #DCFCE7)' : 'var(--color-danger-bg, #FEE2E2)',
              color: message.type === 'success' ? 'var(--color-success, #16A34A)' : 'var(--color-danger, #DC2626)',
            }}>
              {message.text}
            </div>
          )}

          <div className="grid-2 mb-md">
            <div className="input-group">
              <label className="input-label">ชื่อกิจกรรม <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input type="text" className="input" placeholder="เช่น ค่ายรับน้อง..." value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">ฝ่ายที่รับผิดชอบ <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <select className="select" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                <option value="">-- โปรดเลือกฝ่าย --</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2 mb-md">
            <div className="input-group">
              <label className="input-label">วันที่เริ่ม <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input type="date" className="input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="input-group">
              <label className="input-label">วันที่สิ้นสุด <span style={{ color: 'var(--color-danger)' }}>*</span></label>
              <input type="date" className="input" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="input-group mb-md">
            <label className="input-label">รายละเอียด / วัตถุประสงค์สั้นๆ</label>
            <textarea className="input" placeholder="อธิบายกิจกรรมคร่าวๆ..." value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="input-group mb-lg">
            <label className="input-label">งบประมาณที่ขออนุมัติเบื้องต้น (บาท)</label>
            <input type="number" className="input" placeholder="เช่น 5000" value={budgetRequested} onChange={e => setBudgetRequested(e.target.value)} />
          </div>

          <div className="flex justify-end gap-sm">
            <button type="button" className="btn btn-secondary" onClick={() => setShowCreateForm(false)}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.6 : 1 }}>
              {isSubmitting ? '⏳ กำลังบันทึก...' : 'บันทึกและส่งร่างกิจกรรม'}
            </button>
          </div>
        </form>
      )}

      {/* --- Filter & List --- */}
      <div className="card mb-lg">
        <div className="flex items-center gap-md">
          <select 
            className="select flex-1"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="all">ทุกฝ่าย (All Departments)</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          
          <select 
            className="select flex-1"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">ทุกสถานะ (All Statuses)</option>
            <option value="draft">Draft (ร่าง)</option>
            <option value="pending_review">รอตรวจ</option>
            <option value="revision">แก้ไข</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="completed">เสร็จสิ้น</option>
          </select>
        </div>
      </div>

      <div className="grid-3 stagger-children">
        {filteredActivities.map(act => (
          <ActivityCard key={act.id} activity={act} />
        ))}
      </div>
      
      {filteredActivities.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>ไม่พบกิจกรรม</h3>
          <p>ลองเปลี่ยนตัวกรองเพื่อค้นหาอีกครั้ง</p>
        </div>
      )}
    </div>
  );
}
