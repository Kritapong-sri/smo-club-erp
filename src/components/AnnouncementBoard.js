'use client';
import { useState } from 'react';

export default function AnnouncementBoard({ initialAnnouncements, session }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // เช็คสิทธิ์ว่ามีสิทธิ์โพสต์ประกาศหรือไม่
  const canPost = session && (
    ['admin', 'board'].includes(session.role) ||
    (session.positionTitle && (
      session.positionTitle.includes('นายก') ||
      session.positionTitle.includes('อุปนายก')
    ))
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, customDate }),
      });

      if (!res.ok) throw new Error('Failed to post announcement');

      const newAnnouncement = await res.json();
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      
      setShowModal(false);
      setTitle('');
      setContent('');
      setCustomDate('');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ position: 'relative' }}>
      <div className="flex items-center justify-between mb-md">
        <h3 className="mb-0">ประกาศล่าสุด</h3>
        
        {/* ปุ่มวงกลมบวก สำหรับคนที่มีสิทธิ์ */}
        {canPost && (
          <button 
            onClick={() => setShowModal(true)}
            style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'var(--blue-600)', color: 'white',
              border: 'none', cursor: 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 'bold', lineHeight: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            title="เพิ่มประกาศใหม่"
          >
            +
          </button>
        )}
      </div>

      <div className="flex-col gap-sm">
        {announcements.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-tertiary)', padding: '20px 0', fontSize: '13px' }}>
            ยังไม่มีประกาศในขณะนี้
          </div>
        ) : (
          announcements.map(ann => {
            // ใช้วันที่ที่ตั้งเอง (customDate) ถ้ามี, ถ้าไม่มีใช้วันที่สร้าง (createdAt)
            const displayDate = ann.customDate ? new Date(ann.customDate) : new Date(ann.createdAt);
            
            return (
              <div key={ann.id} className={`announcement-card ${ann.pinned ? 'pinned' : ''}`}>
                <div className="announcement-title">
                  {ann.pinned && '📌 '}{ann.title}
                </div>
                <div className="announcement-body" style={{ whiteSpace: 'pre-wrap' }}>{ann.content}</div>
                <div className="announcement-date flex justify-between">
                  <span>{displayDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  {ann.author && <span>โดย {ann.author.nickname || ann.author.firstNameTh}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal เพิ่มประกาศ */}
      {showModal && typeof window !== 'undefined' && require('react-dom').createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '500px', margin: 'auto' }}>
            <div className="flex justify-between items-center mb-md">
              <h3 className="mb-0">สร้างประกาศใหม่</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="input-group mb-sm">
                <label className="input-label">หัวข้อประกาศ <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              
              <div className="input-group mb-sm">
                <label className="input-label">เนื้อหา <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <textarea className="input" rows="4" value={content} onChange={e => setContent(e.target.value)} required></textarea>
              </div>

              <div className="input-group mb-md">
                <label className="input-label">วันที่แสดง (ตัวเลือก - ไม่ระบุคือใช้วันนี้)</label>
                <input type="date" className="input" value={customDate} onChange={e => setCustomDate(e.target.value)} />
              </div>

              <div className="flex justify-end gap-sm">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'กำลังบันทึก...' : 'โพสต์ประกาศ'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
