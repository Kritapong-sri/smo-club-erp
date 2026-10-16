'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/StatusBadge';
import BudgetDashboard from '@/components/BudgetDashboard';
import BudgetTable from '@/components/BudgetTable';
import DetailedMPTable from '@/components/DetailedMPTable';
import MPSummaryView from '@/components/MPSummaryView';
import BudgetImportModal from '@/components/BudgetImportModal';
import {
  ArrowLeft,
  Pencil,
  Send,
  ClipboardCheck,
  CheckSquare,
  FileText,
  BarChart3,
  Paperclip,
  Link as LinkIcon,
  Folder,
  X,
  UploadCloud,
  Loader2,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Trash2
} from 'lucide-react';

export default function ActivityDetailClient({ initialActivity, session }) {
  const [activity, setActivity] = useState(initialActivity);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [budgetSubTab, setBudgetSubTab] = useState('all');
  const [budgetData, setBudgetData] = useState({ budgetItems: [], summary: {} });
  const [loadingBudget, setLoadingBudget] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [editData, setEditData] = useState({
    title: activity.title,
    description: activity.description || '',
    startDate: activity.startDate ? new Date(activity.startDate).toISOString().split('T')[0] : '',
    endDate: activity.endDate ? new Date(activity.endDate).toISOString().split('T')[0] : '',
    budgetRequested: activity.budgetRequested || 0,
  });

  // Upload Form State
  const [uploadMode, setUploadMode] = useState('file'); // 'file' or 'link'
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploadingGDrive, setIsUploadingGDrive] = useState(false);
  const [uploadMessage, setUploadMessage] = useState(null);
  const [uploadData, setUploadData] = useState({
    fileName: '',
    fileUrl: '',
    fileType: 'pdf'
  });

  const [reviewData, setReviewData] = useState({
    status: 'approved',
    feedback: '',
    fileUrl: ''
  });

  const canEdit = session && (
    ['admin', 'board', 'head'].includes(session.role) ||
    (session.positionTitle && (
      session.positionTitle.includes('นายก') ||
      session.positionTitle.includes('อุปนายก') ||
      session.positionTitle.includes('ประธานฝ่าย')
    ))
  );

  const canUpload = !!session;

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

  const fetchBudget = async () => {
    setLoadingBudget(true);
    try {
      const res = await fetch(`/api/activities/${activity.id}/budget`);
      if (!res.ok) throw new Error('Failed to fetch budget');
      const data = await res.json();
      setBudgetData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBudget(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const loadBudget = async () => {
      try {
        const res = await fetch(`/api/activities/${activity.id}/budget`);
        if (!res.ok) throw new Error('Failed to fetch budget');
        const data = await res.json();
        if (isActive) setBudgetData(data);
      } catch (err) {
        console.error(err);
      } finally {
        if (isActive) setLoadingBudget(false);
      }
    };

    loadBudget();
    return () => {
      isActive = false;
    };
  }, [activity.id]);

  const handleAddItem = async (itemData) => {
    try {
      const res = await fetch(`/api/activities/${activity.id}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchBudget();
    } catch (err) {
      alert('Error adding budget item: ' + err.message);
    }
  };

  const handleUpdateItem = async (itemData) => {
    try {
      const res = await fetch(`/api/activities/${activity.id}/budget`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchBudget();
    } catch (err) {
      alert('Error updating budget item: ' + err.message);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('ต้องการลบรายการนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/activities/${activity.id}/budget?itemId=${itemId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchBudget();
    } catch (err) {
      alert('Error deleting budget item: ' + err.message);
    }
  };

  const handleImportItems = async (importedItems) => {
    try {
      const res = await fetch(`/api/activities/${activity.id}/budget/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: importedItems }),
      });
      if (!res.ok) throw new Error(await res.text());
      await fetchBudget();
      setShowImportModal(false);
    } catch (err) {
      alert('Error importing budget items: ' + err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editData.title || !editData.startDate || !editData.endDate) {
      alert('กรุณากรอกชื่อกิจกรรม วันที่เริ่ม และวันที่สิ้นสุดให้ครบ');
      return;
    }
    if (new Date(editData.endDate) < new Date(editData.startDate)) {
      alert('วันที่สิ้นสุดต้องไม่อยู่ก่อนวันที่เริ่มกิจกรรม');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setActivity(prev => ({ ...prev, ...updated }));
      setShowEditModal(false);
    } catch (err) {
      alert('Error updating activity: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Drive File Upload Handler
  const handleFileSelectAndUploadGDrive = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsUploadingGDrive(true);
    setUploadMessage({ type: 'info', text: 'กำลังอัปโหลดไฟล์ขึ้น Google Drive...' });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload/gdrive', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'อัปโหลดไฟล์ไม่สำเร็จ');

      setUploadData({
        fileName: file.name,
        fileUrl: data.url,
        fileType: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.xlsx') || file.name.endsWith('.csv') ? 'xlsx' : 'other'
      });

      setUploadMessage({
        type: 'success',
        text: data.warning ? `สำเร็จ: ${data.warning}` : 'อัปโหลดขึ้น Google Drive สำเร็จแล้ว!'
      });

    } catch (err) {
      console.error(err);
      setUploadMessage({ type: 'error', text: err.message });
    } finally {
      setIsUploadingGDrive(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadData.fileName || !uploadData.fileUrl) {
      alert('กรุณาระบุชื่อเอกสารและอัปโหลดไฟล์หรือวางลิงก์ก่อนบันทึก');
      return;
    }
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
      setSelectedFile(null);
      setUploadMessage(null);
    } catch (err) {
      alert('Error uploading document: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDocument = async (docId, e) => {
    e.stopPropagation();
    if (!confirm('คุณต้องการลบเอกสารแนบนี้ใช่หรือไม่?')) return;
    try {
      const res = await fetch(`/api/activities/${activity.id}/documents?documentId=${docId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(await res.text());
      setActivity(prev => ({
        ...prev,
        documents: (prev.documents || []).filter(d => d.id !== docId)
      }));
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบเอกสาร: ' + err.message);
    }
  };

  const isAdmin = session?.role === 'admin';

  const handleDeleteActivity = async () => {
    if (!confirm(`ลบโครงการ "${activity.title}" ใช่หรือไม่?\nเอกสาร งบประมาณ และประวัติการตรวจทั้งหมดของโครงการนี้จะถูกลบด้วย และกู้คืนไม่ได้`)) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/activities/${activity.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'ลบโครงการไม่สำเร็จ');
      }
      window.location.href = '/activities';
    } catch (err) {
      alert(err.message);
      setIsSubmitting(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!confirm('ยืนยันส่งร่างงบประมาณให้เหรัญญิกตรวจสอบใช่หรือไม่?')) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/activities/${activity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending_treasurer' }),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setActivity(prev => ({ ...prev, status: updated.status }));
    } catch (err) {
      alert('Error submitting for review: ' + err.message);
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
        <Link href="/activities" className="btn btn-ghost btn-sm px-0 flex items-center gap-xs">
          <ArrowLeft size={16} /> กลับไปหน้ากิจกรรม
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
            <button className="btn btn-secondary flex items-center gap-xs" onClick={() => setShowEditModal(true)}>
              <Pencil size={15} /> แก้ไขข้อมูล
            </button>
          )}
          {canEdit && activity.status === 'draft' && (
            <button className="btn btn-primary flex items-center gap-xs" onClick={handleSubmitForReview} disabled={isSubmitting}>
              <Send size={15} /> ส่งตรวจงบ (เหรัญญิก)
            </button>
          )}
          {isTreasurerUser && activity.status === 'pending_treasurer' && (
            <button className="btn btn-primary flex items-center gap-xs" onClick={() => setShowReviewModal(true)}>
              <ClipboardCheck size={15} /> ตรวจงบประมาณ
            </button>
          )}
          {isExecutiveUser && activity.status === 'pending_executive' && (
            <button className="btn btn-primary flex items-center gap-xs" onClick={() => setShowReviewModal(true)}>
              <CheckSquare size={15} /> พิจารณาอนุมัติ
            </button>
          )}
          {isAdmin && (
            <button className="btn btn-danger flex items-center gap-xs" onClick={handleDeleteActivity} disabled={isSubmitting}>
              <Trash2 size={15} /> ลบโครงการ
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-primary)', marginBottom: '24px' }}>
        <button 
          className="btn btn-sm flex items-center gap-xs"
          onClick={() => setActiveTab('details')}
          style={{ 
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', 
            background: activeTab === 'details' ? 'var(--blue-500)' : 'transparent', 
            color: activeTab === 'details' ? 'white' : 'var(--text-secondary)',
            border: activeTab === 'details' ? '1px solid var(--blue-500)' : '1px solid transparent',
            fontWeight: '600'
          }}
        >
          <FileText size={15} /> รายละเอียด & เอกสารแนบ
        </button>
        <button 
          className="btn btn-sm flex items-center gap-xs"
          onClick={() => setActiveTab('budget')}
          style={{ 
            borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', 
            background: activeTab === 'budget' ? 'var(--blue-500)' : 'transparent', 
            color: activeTab === 'budget' ? 'white' : 'var(--text-secondary)',
            border: activeTab === 'budget' ? '1px solid var(--blue-500)' : '1px solid transparent',
            fontWeight: '600'
          }}
        >
          <BarChart3 size={15} /> MP & Cost Tracking
        </button>
      </div>

      {activeTab === 'details' ? (
        <div className="grid-3 stagger-children">
        <div className="col-span-2 flex-col gap-lg">
          <div className="card hover-glow">
            <h3 className="mb-md">รายละเอียดกิจกรรม</h3>
            <div className="grid-2 gap-md">
              <div>
                <div className="text-tertiary text-sm mb-xs">ฝ่ายที่จัด</div>
                {dept ? (
                  <span className="dept-tag" style={{ color: dept.color, borderColor: dept.color }}>
                    {dept.name}
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

          <div className="card hover-glow">
            <div className="flex items-center justify-between mb-md">
              <h3>เอกสารแนบ (Documents)</h3>
              {canUpload && (
                <button className="btn btn-primary btn-sm flex items-center gap-xs hover-scale" onClick={() => setShowUploadModal(true)}>
                  <UploadCloud size={15} /> แนบไฟล์ Google Drive
                </button>
              )}
            </div>
            
            {documents.length > 0 ? (
              <div className="grid-2 gap-md">
                {documents.map(doc => {
                  const uploader = doc.uploadedBy;
                  const isGDrive = doc.fileUrl && doc.fileUrl.includes('drive.google.com');
                  const canDeleteDoc = session && (doc.uploadedById === session.userId || ['admin', 'board', 'head'].includes(session.role));

                  return (
                    <div 
                      key={doc.id} 
                      className="file-item hover-lift flex items-center justify-between" 
                      style={{ cursor: 'pointer', position: 'relative' }} 
                      onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                    >
                      <div className="flex items-center gap-md" style={{ overflow: 'hidden', flex: 1 }}>
                        <div className={`file-icon ${doc.fileType}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {isGDrive ? <HardDrive size={20} style={{ color: '#0284c7' }} /> : doc.fileType === 'pdf' ? <FileText size={20} /> : doc.fileType === 'xlsx' ? <BarChart3 size={20} /> : doc.fileType === 'link' ? <LinkIcon size={20} /> : <Folder size={20} />}
                        </div>
                        <div className="file-info" style={{ overflow: 'hidden' }}>
                          <div className="file-name" style={{ color: 'var(--blue-600)', display: 'flex', alignItems: 'center', gap: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            <span>{doc.fileName}</span>
                            {isGDrive && <span style={{ fontSize: '10px', background: '#e0f2fe', color: '#0284c7', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, flexShrink: 0 }}>Google Drive</span>}
                          </div>
                          <div className="file-meta">
                            {uploader?.nickname || uploader?.firstNameTh || 'อัปโหลดแล้ว'} • {new Date(doc.uploadedAt).toLocaleDateString('th-TH')}
                          </div>
                        </div>
                      </div>

                      {canDeleteDoc && (
                        <button
                          type="button"
                          className="btn-delete-doc hover-scale"
                          title="ลบเอกสารโครงการนี้"
                          onClick={(e) => handleDeleteDocument(doc.id, e)}
                          style={{
                            border: 'none',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--color-danger, #ef4444)',
                            cursor: 'pointer',
                            padding: '6px 8px',
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '8px',
                            flexShrink: 0
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state py-md">
                <div className="empty-state-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <Folder size={40} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <p className="text-tertiary text-sm">ยังไม่มีเอกสารแนบใน Google Drive</p>
              </div>
            )}
          </div>

          {reviews.length > 0 && (
            <div className="card hover-glow">
              <h3 className="mb-md">ประวัติการตรวจเอกสาร / คำแนะนำ</h3>
              <div className="flex-col gap-md">
                {reviews.map(rev => (
                  <div key={rev.id} style={{ padding: '12px', background: 'var(--bg-surface-hover)', borderRadius: 'var(--radius-md)', borderLeft: `3px solid ${rev.status === 'approved' ? 'var(--color-success)' : 'var(--color-warning)'}` }}>
                    <div className="flex justify-between items-center mb-xs">
                      <span className="font-semibold text-sm">{rev.reviewer?.positionTitle || rev.reviewer?.firstNameTh || 'ผู้ตรวจ'}</span>
                      <span className="text-xs text-tertiary">{new Date(rev.reviewedAt).toLocaleDateString('th-TH')}</span>
                    </div>
                    <div className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{rev.feedback}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex-col gap-lg">
          <div className="card hover-glow">
            <h3 className="mb-md">งบประมาณ</h3>
            <div className="text-tertiary text-sm mb-xs">งบประมาณที่ขอ</div>
            <div className="font-en text-2xl font-bold mb-md" style={{ color: 'var(--text-primary)' }}>
              ฿{activity.budgetRequested?.toLocaleString() || 0}
            </div>

            {activity.budgetApproved != null && (
              <>
                <div className="text-tertiary text-sm mb-xs">งบประมาณที่อนุมัติ</div>
                <div className="font-en text-2xl font-bold" style={{ color: 'var(--color-success)' }}>
                  ฿{activity.budgetApproved.toLocaleString()}
                </div>
              </>
            )}
          </div>

          <div className="card hover-glow">
            <h3 className="mb-md">สถานะ (Timeline)</h3>
            <div className="timeline">
              <div className="timeline-item active">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">ร่างกิจกรรม</div>
                  <div className="timeline-date">{new Date(activity.createdAt).toLocaleDateString('th-TH')}</div>
                </div>
              </div>
              <div className={`timeline-item ${['pending_treasurer', 'pending_executive', 'approved', 'completed'].includes(activity.status) ? 'active' : ''}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">รอตรวจเอกสาร/งบ</div>
                  <div className="timeline-date">-</div>
                </div>
              </div>
              <div className={`timeline-item ${['approved', 'completed'].includes(activity.status) ? 'active' : ''}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">อนุมัติงบประมาณ</div>
                  <div className="timeline-date">-</div>
                </div>
              </div>
              <div className={`timeline-item ${activity.status === 'completed' ? 'active' : ''}`}>
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-title">เสร็จสิ้นกิจกรรม</div>
                  <div className="timeline-date">-</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : (
        <div className="stagger-children flex-col gap-lg">
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {[
              { key: 'all', label: 'ภาพรวมทั้งหมด (All)' },
              { key: 'detailed_mp', label: 'กรอก MP ละเอียด' },
              { key: 'mp_sum', label: 'สรุป MP ตามหมวด' },
              { key: 'tracking_cost', label: 'Tracking ค่าใช้จ่ายจริง' },
              { key: 'budget_status', label: 'สถานะการเบิกจ่าย' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`btn btn-sm ${budgetSubTab === tab.key ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setBudgetSubTab(tab.key)}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loadingBudget ? (
            <div className="card py-xl text-center text-tertiary">กำลังโหลดข้อมูลชิ้นงบประมาณ...</div>
          ) : (
            <>
              {(budgetSubTab === 'all' || budgetSubTab === 'budget_status') && (
                <BudgetDashboard 
                  summary={budgetData.summary} 
                  budgetRequested={activity.budgetRequested}
                  budgetApproved={activity.budgetApproved}
                />
              )}

              {(budgetSubTab === 'all' || budgetSubTab === 'detailed_mp') && (
                <DetailedMPTable
                  items={budgetData.budgetItems?.filter(i => i.type === 'planned') || []}
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  canEdit={canEdit && ['draft', 'revision'].includes(activity.status)}
                  onOpenImportModal={() => setShowImportModal(true)}
                />
              )}

              {(budgetSubTab === 'all' || budgetSubTab === 'mp_sum') && (
                <MPSummaryView
                  plannedItems={budgetData.budgetItems?.filter(i => i.type === 'planned') || []}
                  actualItems={budgetData.budgetItems?.filter(i => i.type === 'actual') || []}
                />
              )}

              {(budgetSubTab === 'all' || budgetSubTab === 'tracking_cost') && (
                <BudgetTable 
                  items={budgetData.budgetItems?.filter(i => i.type === 'actual') || []} 
                  onAddItem={handleAddItem}
                  onUpdateItem={handleUpdateItem}
                  onDeleteItem={handleDeleteItem}
                  canEdit={canEdit}
                />
              )}
            </>
          )}
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content card animate-fade-in" style={{ width: '90%', maxWidth: '500px', margin: 'auto' }}>
            <div className="flex justify-between items-center mb-md">
              <h3>แก้ไขข้อมูลกิจกรรม</h3>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost btn-sm px-xs"><X size={18} /></button>
            </div>
            <form onSubmit={handleEditSubmit}>
              <div className="input-group mb-sm">
                <label className="input-label">ชื่อกิจกรรม</label>
                <input type="text" className="input" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} required />
              </div>
              <div className="input-group mb-sm">
                <label className="input-label">รายละเอียด</label>
                <textarea className="input" rows="3" value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} />
              </div>
              <div className="grid-2 gap-sm mb-sm">
                <div className="input-group">
                  <label className="input-label">วันที่เริ่ม</label>
                  <input type="date" className="input" value={editData.startDate} onChange={e => setEditData({ ...editData, startDate: e.target.value })} required />
                </div>
                <div className="input-group">
                  <label className="input-label">วันที่สิ้นสุด</label>
                  <input type="date" className="input" min={editData.startDate || undefined} value={editData.endDate} onChange={e => setEditData({ ...editData, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="input-group mb-md">
                <label className="input-label">งบประมาณที่ขออนุมัติ</label>
                <input type="number" className="input" min="0" step="0.01" value={editData.budgetRequested} onChange={e => setEditData({ ...editData, budgetRequested: parseFloat(e.target.value) || 0 })} />
              </div>
              <div className="flex justify-end gap-sm">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Drive & Document Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content card animate-fade-in" style={{ width: '90%', maxWidth: '520px', margin: 'auto' }}>
            <div className="flex justify-between items-center mb-md">
              <h3 className="flex items-center gap-xs">
                <UploadCloud size={20} style={{ color: 'var(--blue-600)' }} />
                <span>แนบเอกสารโครงการ (Google Drive Storage)</span>
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="btn btn-ghost btn-sm px-xs"><X size={18} /></button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
              <button
                type="button"
                className={`btn btn-sm ${uploadMode === 'file' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setUploadMode('file')}
                style={{ justifyContent: 'center' }}
              >
                <Folder size={16} aria-hidden="true" />
                <span>อัปโหลดไฟล์ขึ้น Google Drive</span>
              </button>
              <button
                type="button"
                className={`btn btn-sm ${uploadMode === 'link' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setUploadMode('link')}
                style={{ justifyContent: 'center' }}
              >
                <LinkIcon size={16} aria-hidden="true" />
                <span>แปะลิงก์ Google Drive</span>
              </button>
            </div>

            <form onSubmit={handleUploadSubmit}>
              {uploadMode === 'file' ? (
                <div className="mb-md">
                  <label className="input-label mb-xs">เลือกไฟล์ PDF / เอกสารโครงการ</label>
                  <div style={{
                    border: '2px dashed var(--blue-300)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px 16px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--blue-50)',
                    position: 'relative'
                  }}>
                    <input
                      type="file"
                      accept=".pdf,.xlsx,.csv,.doc,.docx"
                      onChange={handleFileSelectAndUploadGDrive}
                      disabled={isUploadingGDrive}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                      {isUploadingGDrive ? (
                        <Loader2 size={36} className="animate-spin" style={{ color: 'var(--blue-600)' }} />
                      ) : (
                        <UploadCloud size={36} style={{ color: 'var(--blue-600)' }} />
                      )}
                    </div>
                    <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '4px', color: 'var(--blue-700)' }}>
                      {isUploadingGDrive ? 'กำลังส่งไฟล์ขึ้น Google Drive...' : 'คลิกหรือลากไฟล์ PDF / เอกสารมาวางที่นี่'}
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>ระบบจะบันทึกเข้าโฟลเดอร์ Google Drive ของสโมสรนิสิตให้อัตโนมัติ</p>
                  </div>
                </div>
              ) : (
                <div className="input-group mb-sm">
                  <label className="input-label">URL / ลิงก์ Google Drive เอกสาร</label>
                  <input
                    type="url"
                    className="input font-en"
                    placeholder="https://drive.google.com/file/d/..."
                    value={uploadData.fileUrl}
                    onChange={e => setUploadData({ ...uploadData, fileUrl: e.target.value })}
                    required
                  />
                </div>
              )}

              {uploadMessage && (
                <div className="mb-md flex items-center gap-xs" style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: uploadMessage.type === 'success' ? 'var(--color-success-bg, #DCFCE7)' : uploadMessage.type === 'error' ? 'var(--color-danger-bg, #FEE2E2)' : 'var(--blue-50)',
                  color: uploadMessage.type === 'success' ? 'var(--color-success, #16A34A)' : uploadMessage.type === 'error' ? 'var(--color-danger, #DC2626)' : 'var(--blue-700)',
                }}>
                  {uploadMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{uploadMessage.text}</span>
                </div>
              )}

              <div className="input-group mb-sm">
                <label className="input-label">ชื่อเรียกเอกสาร <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="เช่น ร่างโครงการรับน้องปี69.pdf" 
                  value={uploadData.fileName} 
                  onChange={e => setUploadData({ ...uploadData, fileName: e.target.value })} 
                  required 
                />
              </div>

              <div className="input-group mb-md">
                <label className="input-label">ประเภทไฟล์</label>
                <select className="select" value={uploadData.fileType} onChange={e => setUploadData({ ...uploadData, fileType: e.target.value })}>
                  <option value="pdf">PDF Document</option>
                  <option value="xlsx">Excel / Spreadsheet</option>
                  <option value="link">Google Drive / Web Link</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>

              <div className="flex justify-end gap-sm">
                <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary flex items-center gap-xs" disabled={isSubmitting || isUploadingGDrive || !uploadData.fileUrl}>
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <HardDrive size={16} />}
                  <span>{isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเอกสาร'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content card animate-fade-in" style={{ width: '90%', maxWidth: '500px', margin: 'auto' }}>
            <div className="flex justify-between items-center mb-md">
              <h3>พิจารณาอนุมัติกิจกรรม / งบประมาณ</h3>
              <button onClick={() => setShowReviewModal(false)} className="btn btn-ghost btn-sm px-xs"><X size={18} /></button>
            </div>
            <form onSubmit={handleReviewSubmit}>
              <div className="input-group mb-sm">
                <label className="input-label">ผลการพิจารณา</label>
                <select className="select" value={reviewData.status} onChange={e => setReviewData({ ...reviewData, status: e.target.value })}>
                  <option value="approved">อนุมัติ (Approved)</option>
                  <option value="revision">ขอให้แก้ไขเพิ่มเติม (Revision Required)</option>
                </select>
              </div>
              <div className="input-group mb-sm">
                <label className="input-label">คำแนะนำ / ความคิดเห็นเพิ่มเติม</label>
                <textarea className="input" rows="3" placeholder="ระบุเหตุผลหรือคำแนะนำ..." value={reviewData.feedback} onChange={e => setReviewData({ ...reviewData, feedback: e.target.value })} required />
              </div>
              <div className="flex justify-end gap-sm">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>บันทึกผลการตรวจ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showImportModal && (
        <BudgetImportModal
          onClose={() => setShowImportModal(false)}
          onImport={handleImportItems}
        />
      )}
    </div>
  );
}
