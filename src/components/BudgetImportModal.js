'use client';
import { useState } from 'react';

export default function BudgetImportModal({ isOpen, onClose, activityId, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('planned'); // planned or actual
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.csv')) {
        setError('กรุณาเลือกไฟล์ .csv เท่านั้น');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('กรุณาเลือกไฟล์ CSV ก่อนอัปโหลด');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const res = await fetch(`/api/activities/${activityId}/budget/import`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล');

      setSuccess(`นำเข้าข้อมูลเรียบร้อยแล้ว! นำเข้าทั้งหมด ${data.count} รายการ`);
      setFile(null);
      setTimeout(() => {
        onImportSuccess();
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fade-in 0.2s ease-out'
    }}>
      <div className="card animate-scale-in" style={{
        width: '100%',
        maxWidth: '500px',
        margin: '16px',
        padding: '24px',
        boxShadow: 'var(--shadow-xl)',
        border: '1px solid var(--border-primary)',
        background: 'var(--bg-glass)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>นำเข้าข้อมูลจาก Google Sheets (CSV)</h2>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-sm" 
            style={{ 
              background: 'transparent', 
              fontSize: '20px', 
              padding: '0 8px',
              color: 'var(--text-tertiary)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* File Type Selection */}
          <div className="mb-md">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>ประเภทข้อมูลที่นำเข้า</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className={`btn ${type === 'planned' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setType('planned')}
                style={{ justifyContent: 'center' }}
              >
                📝 แผนงบประมาณ (Money Plan)
              </button>
              <button
                type="button"
                className={`btn ${type === 'actual' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setType('actual')}
                style={{ justifyContent: 'center' }}
              >
                💰 รายจ่ายจริง (Tracking Cost)
              </button>
            </div>
          </div>

          {/* File Input */}
          <div className="mb-md">
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>อัปโหลดไฟล์ CSV</label>
            <div style={{
              border: '2px dashed var(--border-primary)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'rgba(255, 255, 255, 0.4)',
              position: 'relative'
            }}>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer'
                }}
              />
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📥</div>
              <p style={{ fontWeight: '500', marginBottom: '4px' }}>คลิกหรือลากไฟล์ CSV มาวางที่นี่</p>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>รองรับเฉพาะไฟล์ .csv ที่ส่งออกจา่กหน้า Google Sheets</p>
            </div>
            {file && (
              <div style={{ 
                marginTop: '12px', 
                padding: '8px 12px', 
                background: 'var(--blue-50)', 
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--blue-200)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '14px', color: 'var(--blue-700)', wordBreak: 'break-all' }}>📄 {file.name}</span>
                <button 
                  type="button" 
                  onClick={() => setFile(null)} 
                  style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-danger)' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-md" style={{ 
              padding: '10px 12px', 
              background: 'var(--color-danger-bg)', 
              color: 'var(--color-danger)', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div className="mb-md" style={{ 
              padding: '10px 12px', 
              background: 'var(--color-success-bg)', 
              color: 'var(--color-success)', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              ✅ {success}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>ยกเลิก</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !file}>
              {loading ? 'กำลังนำเข้าข้อมูล...' : 'นำเข้าข้อมูล'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
