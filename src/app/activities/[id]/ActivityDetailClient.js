'use client';
import { useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';

export default function ActivityDetailClient({ initialActivity, session }) {
  const [activity, setActivity] = useState(initialActivity);
  
  // UI States
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Form
  const [editData, setEditData] = useState({
    title: activity.title,
    description: activity.description || '',
    startDate: activity.startDate ? new Date(activity.startDate).toISOString().split('T')[0] : '',
    endDate: activity.endDate ? new Date(activity.endDate).toISOString().split('T')[0] : '',
    budgetRequested: activity.budgetRequested || 0,
  });

  // Upload Form
  const [uploadData, setUploadData] = useState({
    fileName: '',
    fileUrl: '',
    fileType: 'pdf' // default
  });

  // Review Form
  const [reviewData, setReviewData] = useState({
    status: 'approved', // 'approved', 'revision'
    feedback: '',
    fileUrl: '' // optional
  });

  // --- Permissions Check ---
  const canEdit = session && (
    ['admin', 'board', 'head'].includes(session.role) ||
    (session.positionTitle && (
      session.positionTitle.includes('นายก') ||
      session.positionTitle.includes('อุปนายก') ||
      session.positionTitle.includes('ประธานฝ่าย')
    ))
  );

  const canUpload = !!session; // Anyone logged in

  const isTreasurerUser = session && (
    ['admin', 'board'].includes(session.role) ||
    (session.positionTitle && session.positionTitle.includes('เหรัญญิก'))
  );

  const isExecutiveUser = session && (
    ['admin', 'board'].includes(session.role) ||
    (session.positionTitle && (
      session.positionTitle.includes('นายก') ||
      session.positionTitle.includes('อุปนายก')
    ))
  );

  // --- Handlers ---
  const handleEditSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setActivity(updated);
      setShowEditModal(false);
    } catch (err) {
      alert('Error updating: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!confirm('ยืนยันการส่งเอกสารและงบประมาณให้เหรัญญิกและทีมบริหารตรวจสอบ?')) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending_treasurer' }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setActivity(updated);
    } catch (err) {
      alert('Error submitting for review: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/activities/${activity.id}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(uploadData),
      });
      if (!res.ok) throw new Error(await res.text());
      const newDoc = await res.json();
      
      setActivity(prev => ({
        ...prev,
        documents: [newDoc, ...(prev.documents || [])]
      }));
      setShowUploadModal(false);
      setUploadData({ fileName: '', fileUrl: '', fileType: 'pdf' });
    } catch (err) {
      alert('Error uploading: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalFeedback = reviewData.fileUrl 
        ? `${reviewData.feedback}\n\nไฟล์แนบ: ${reviewData.fileUrl}`
        : reviewData.feedback;

      const res = await fetch(`/api/activities/${activity.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: reviewData.status,
          feedback: finalFeedback
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { updatedActivity, review } = await res.json();
      
      setActivity(prev => ({
        ...updatedActivity,
        budgetReviews: [review, ...(prev.budgetReviews || [])]
      }));
      setShowReviewModal(false);
      setReviewData({ status: 'approved', feedback: '', fileUrl: '' });
    } catch (err) {
      alert('Error submitting review: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dept = activity.department;
  const creator = activity.createdBy;
  const documents = activity.documents || [];
  const reviews = activity.budgetReviews || [];

  return (
    <div className="page-container animate-fade-in">
      <div className="mb-md">
        <Link href="/activities" className="btn btn-ghost btn-sm px-0">
          ← กลับไปหน้ากิจกรรม
        </Link>
      </div>

      <div className="page-header-row mb-lg">
        <div className="page-header mb-0">
          <div className="flex items-center gap-md mb-xs">
            <h1>{activity.title}</h1>
            <StatusBadge status={activity.status} />
          </div>
          <p>{activity.description}</p>
        </div>
        <div className="flex gap-sm">
          {canEdit && (
            <button className="btn btn-secondary" onClick={() => setShowEditModal(true)}>✏️ แก้ไขข้อมูล</button>
          )}
          {canEdit && activity.status === 'draft' && (
            <button className="btn btn-primary" onClick={handleSubmitForReview} disabled={isSubmitting}>📤 ส่งตรวจงบ (เหรัญญิก)</button>
          )}
          {isTreasurerUser && activity.status === 'pending_treasurer' && (
            <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>📋 ตรวจงบประมาณ</button>
          )}
          {isExecutiveUser && activity.status === 'pending_executive' && (
            <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>📋 พิจารณาอนุมัติ</button>
          )}
        </div>
      </div>

      <div className="grid-3 stagger-children">
        <div className="col-span-2 flex-col gap-lg">
          {/* Details Card */}
          <div className="card">
            <h3 className="mb-md">รายละเอียดกิจกรรม</h3>
            <div className="grid-2 gap-md">
              <div>
                <div className="text-tertiary text-sm mb-xs">ฝ่ายที่จัด</div>
                {dept ? (
                  <span className="dept-tag" style={{ color: dept.color, borderColor: dept.color }}>
                    {dept.icon} {dept.name}
                  </span>
                ) : '-'}
              </div>
              <div>
                <div className="text-tertiary text-sm mb-xs">ผู้รับผิดชอบ</div>
                {creator ? (
                  <div className="flex items-center gap-sm">
                    <div className="avatar avatar-sm" style={{ background: 'var(--gradient-primary)' }}>
                      {creator.nickname?.[0] || creator.firstNameTh?.[0] || '?'}
                    </div>
                    <span className="font-medium">{creator.firstNameTh} {creator.lastNameTh} ({creator.nickname})</span>
                  </div>
                ) : '-'}
              </div>
              <div>
                <div className="text-tertiary text-sm mb-xs">วันที่เริ่มกิจกรรม</div>
                <div className="font-en font-medium">
                  {activity.startDate ? new Date(activity.startDate).toLocaleDateString('th-TH', { dateStyle: 'long' }) : '-'}
                </div>
              </div>
              <div>
                <div className="text-tertiary text-sm mb-xs">วันที่สิ้นสุดกิจกรรม</div>
                <div className="font-en font-medium">
                  {activity.endDate ? new Date(activity.endDate).toLocaleDateString('th-TH', { dateStyle: 'long' }) : '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Documents Card */}
          <div className="card">
            <div className="flex items-center justify-between mb-md">
              <h3>เอกสารแนบ (Documents)</h3>
              {canUpload && (
                <button className="btn btn-secondary btn-sm" onClick={() => setShowUploadModal(true)}>📎 แนบไฟล์/ลิงก์</button>
              )}
            </div>
            
            {documents.length > 0 ? (
              <div className="grid-2 gap-md">
                {documents.map(doc => {
                  const uploader = doc.uploadedBy;
                  return (
                    <div key={doc.id} className="file-item" style={{ cursor: 'pointer' }} onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}>
                      <div className={`file-icon ${doc.fileType}`}>
                        {doc.fileType === 'pdf' ? '📄' : doc.fileType === 'xlsx' ? '📊' : doc.fileType === 'link' ? '🔗' : '📁'}
                      </div>
                      <div className="file-info">
                        <div className="file-name" style={{ color: 'var(--blue-600)' }}>{doc.fileName}</div>
                        <div className="file-meta">
                          โดย {uploader?.nickname || 'ไม่ระบุ'} • {new Date(doc.uploadedAt).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                      {doc.fileUrl && <button className="btn-icon btn-ghost">↗️</button>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state py-lg">
                <div className="empty-state-icon">📄</div>
                <p>ยังไม่มีเอกสารแนบ</p>
              </div>
            )}
          </div>
          
          {/* Reviews Card */}
          {reviews.length > 0 && (
            <div className="card">
              <h3 className="mb-md">Feedback จากเหรัญญิก/กรรมการ</h3>
              <div className="flex-col gap-md">
                {reviews.map(review => {
                  const reviewer = review.reviewer;
                  return (
                    <div key={review.id} className="p-md rounded-md bg-surface border border-primary">
                      <div className="flex items-center justify-between mb-sm">
                        <div className="flex items-center gap-sm">
                          <div className="avatar avatar-sm bg-purple-500">{reviewer?.nickname?.[0] || '?'}</div>
                          <span className="font-medium text-sm">{reviewer?.firstNameTh} {reviewer?.lastNameTh} ({reviewer?.positionTitle || reviewer?.role})</span>
                        </div>
                        <span className="text-xs text-tertiary font-en">
                          {new Date(review.reviewedAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{review.feedback}</p>
                      <div className="mt-sm">
                        <StatusBadge status={review.status === 'approved' ? 'approved' : 'revision'} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex-col gap-lg">
          <div className="card">
            <h3 className="mb-md">งบประมาณ</h3>
            <div className="flex-col gap-md">
              <div>
                <div className="text-tertiary text-sm mb-xs">งบประมาณที่ขอ</div>
                <div className="text-2xl font-bold font-en text-warning">
                  ฿{activity.budgetRequested?.toLocaleString() || 0}
                </div>
              </div>
              
              {activity.budgetApproved !== null && (
                <div className="pt-md border-t border-secondary">
                  <div className="text-tertiary text-sm mb-xs">งบประมาณที่อนุมัติ</div>
                  <div className="text-2xl font-bold font-en text-success">
                    ฿{activity.budgetApproved.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="mb-md">สถานะ (Timeline)</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className={`timeline-dot completed`}></div>
                <div className="timeline-content">
                  <h4>ร่างกิจกรรม</h4>
                  <p>{new Date(activity.createdAt).toLocaleDateString('th-TH')}</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className={`timeline-dot ${activity.status !== 'draft' ? 'completed' : 'pending'}`}></div>
                <div className="timeline-content">
                  <h4>รอตรวจเอกสาร/งบ</h4>
                  <p>{activity.status !== 'draft' ? 'ดำเนินการแล้ว' : '-'}</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className={`timeline-dot ${['approved', 'completed'].includes(activity.status) ? 'completed' : activity.status === 'revision' ? 'active border-danger' : 'pending'}`}></div>
                <div className="timeline-content">
                  <h4>อนุมัติงบประมาณ</h4>
                  <p>{activity.status === 'revision' ? 'ต้องแก้ไขเอกสาร' : ['approved', 'completed'].includes(activity.status) ? 'อนุมัติแล้ว' : '-'}</p>
                </div>
              </div>
              
              <div className="timeline-item">
                <div className={`timeline-dot ${activity.status === 'completed' ? 'completed' : 'pending'}`}></div>
                <div className="timeline-content">
                  <h4>เสร็จสิ้นกิจกรรม</h4>
                  <p>{activity.status === 'completed' ? 'สรุปผลเรียบร้อย' : '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="flex justify-between items-center mb-md">
              <h3 className="mb-0">แก้ไขข้อมูลกิจกรรม</h3>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleEditSave}>
              <div className="input-group mb-sm">
                <label className="input-label">ชื่อกิจกรรม</label>
                <input type="text" className="input" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} required />
              </div>
              <div className="grid-2 mb-sm gap-md">
                <div className="input-group">
                  <label className="input-label">วันที่เริ่ม</label>
                  <input type="date" className="input" value={editData.startDate} onChange={e => setEditData({...editData, startDate: e.target.value})} required />
                </div>
                <div className="input-group">
                  <label className="input-label">วันที่สิ้นสุด</label>
                  <input type="date" className="input" value={editData.endDate} onChange={e => setEditData({...editData, endDate: e.target.value})} required />
                </div>
              </div>
              <div className="input-group mb-sm">
                <label className="input-label">งบประมาณที่ขอ (บาท)</label>
                <input type="number" className="input" value={editData.budgetRequested} onChange={e => setEditData({...editData, budgetRequested: e.target.value})} />
              </div>
              <div className="input-group mb-md">
                <label className="input-label">รายละเอียด</label>
                <textarea className="input" rows={3} value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} />
              </div>
              <div className="flex justify-end gap-sm">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Upload Modal */}
      {showUploadModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="flex justify-between items-center mb-md">
              <h3 className="mb-0">แนบไฟล์ / ลิงก์เอกสาร</h3>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleUploadSubmit}>
              <div className="input-group mb-sm">
                <label className="input-label">ชื่อเอกสาร</label>
                <input type="text" className="input" placeholder="เช่น โครงการค่าย.pdf, สลิปค่าของ" value={uploadData.fileName} onChange={e => setUploadData({...uploadData, fileName: e.target.value})} required />
              </div>
              <div className="input-group mb-sm">
                <label className="input-label">ประเภทไฟล์</label>
                <select className="select" value={uploadData.fileType} onChange={e => setUploadData({...uploadData, fileType: e.target.value})}>
                  <option value="pdf">PDF / เอกสารทั่วไป</option>
                  <option value="xlsx">Excel / ตารางงบประมาณ</option>
                  <option value="link">Link URL (Google Drive ฯลฯ)</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
              <div className="input-group mb-md">
                <label className="input-label">ลิงก์แนบไฟล์ (Google Drive, URL)</label>
                <input type="url" className="input" placeholder="https://..." value={uploadData.fileUrl} onChange={e => setUploadData({...uploadData, fileUrl: e.target.value})} required />
              </div>
              <div className="flex justify-end gap-sm">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเอกสาร'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Review Modal */}
      {showReviewModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '400px' }}>
            <div className="flex justify-between items-center mb-md">
              <h3 className="mb-0">📋 ตรวจเอกสารและงบประมาณ</h3>
              <button onClick={() => setShowReviewModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className="input-group mb-sm">
                <label className="input-label">ผลการตรวจ</label>
                <select className="select" value={reviewData.status} onChange={e => setReviewData({...reviewData, status: e.target.value})}>
                  <option value="approved">✅ อนุมัติผ่าน</option>
                  <option value="revision">❌ ส่งกลับไปแก้ไข (Revision)</option>
                </select>
              </div>
              <div className="input-group mb-sm">
                <label className="input-label">คอมเมนต์ / Feedback</label>
                <textarea className="input" rows={3} placeholder="อธิบายสิ่งที่ต้องแก้ หรือคอมเมนต์เพิ่มเติม" value={reviewData.feedback} onChange={e => setReviewData({...reviewData, feedback: e.target.value})} required />
              </div>
              <div className="input-group mb-md">
                <label className="input-label">ลิงก์ไฟล์แก้ไขคืน (Optional)</label>
                <input type="url" className="input" placeholder="เช่น Google Drive ไฟล์ที่แก้คอมเมนต์ให้แล้ว" value={reviewData.fileUrl} onChange={e => setReviewData({...reviewData, fileUrl: e.target.value})} />
              </div>
              <div className="flex justify-end gap-sm">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกผลการตรวจ'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
