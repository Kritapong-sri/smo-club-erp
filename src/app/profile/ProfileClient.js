'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, KeyRound, Lock, Camera, Loader2, User } from 'lucide-react';

export default function ProfileClient({ user }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nickname: user.nickname || '',
    phone: user.phone || '',
    lineId: user.lineId || '',
    instagram: user.instagram || '',
    address: user.address || '',
    shirtSize: user.shirtSize || '',
    bloodGroup: user.bloodGroup || '',
    allergies: user.allergies || '',
    medicalCondition: user.medicalCondition || '',
    mbti: user.mbti || '',
    eColor: user.eColor || ''
  });

  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const useCloudinary = cloudName && cloudName !== "demo" && uploadPreset;

    try {
      if (useCloudinary) {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: data,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error?.message || "Cloudinary Upload failed");
        }

        const result = await res.json();
        setAvatarUrl(result.secure_url);
      } else {
        const data = new FormData();
        data.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: data,
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error("Upload Proxy failed: " + errData.error);
        }

        const result = await res.json();
        setAvatarUrl(result.url);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          avatarUrl
        })
      });

      if (!res.ok) {
        throw new Error('บันทึกข้อมูลไม่สำเร็จ');
      }

      alert('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
      router.refresh();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }
    if (newPassword.length < 4) {
      alert('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setIsChangingPass(true);

    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ');
      }

      alert('เปลี่ยนรหัสผ่านเรียบร้อยแล้ว!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      alert(err.message);
    } finally {
      setIsChangingPass(false);
    }
  };

  const fullName = `${user.prefix || ''}${user.firstNameTh || ''} ${user.lastNameTh || ''}`.trim();

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: '900px' }}>
      <div className="page-header mb-lg">
        <h1>โปรไฟล์ส่วนตัว (My Profile)</h1>
        <p>จัดการและแก้ไขข้อมูลส่วนตัวสำหรับสมาชิกสโมสรนิสิต</p>
      </div>

      <div className="card mb-lg hover-glow">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-lg mb-lg pb-lg" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                fontWeight: 'bold',
                color: 'white',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)'
              }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt={fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  user.nickname ? user.nickname[0] : (user.firstNameTh ? user.firstNameTh[0] : <User size={40} />)
                )}
              </div>
              <label 
                htmlFor="avatar-input" 
                className="hover-scale"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  background: 'var(--blue-600)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
                title="เปลี่ยนรูปโปรไฟล์"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
              </label>
              <input 
                id="avatar-input" 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                style={{ display: 'none' }} 
                disabled={isUploading}
              />
            </div>

            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>{fullName || user.studentId}</h2>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="status-badge approved" style={{ textTransform: 'capitalize' }}>
                  {user.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : user.role === 'board' ? 'กรรมการสโมสร' : 'สมาชิก (Member)'}
                </span>
                {user.positionTitle && (
                  <span style={{ fontSize: '13px', color: 'var(--blue-600)', fontWeight: 600 }}>
                    {user.positionTitle}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                รหัสนิสิต: {user.studentId} {user.department?.name && `• ฝ่าย${user.department.name}`}
              </p>
            </div>
          </div>

          <div className="grid-2 mb-md">
            <div className="input-group">
              <label className="input-label">ชื่อเล่น (Nickname)</label>
              <input 
                type="text" 
                className="input" 
                name="nickname" 
                value={formData.nickname} 
                onChange={handleInputChange} 
                placeholder="เช่น โอม"
              />
            </div>
            <div className="input-group">
              <label className="input-label">เบอร์โทรศัพท์ (Phone)</label>
              <input 
                type="text" 
                className="input font-en" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                placeholder="เช่น 081-234-5678"
              />
            </div>
          </div>

          <div className="grid-2 mb-md">
            <div className="input-group">
              <label className="input-label">Line ID</label>
              <input 
                type="text" 
                className="input font-en" 
                name="lineId" 
                value={formData.lineId} 
                onChange={handleInputChange} 
                placeholder="Line ID"
              />
            </div>
            <div className="input-group">
              <label className="input-label">Instagram (@username)</label>
              <input 
                type="text" 
                className="input font-en" 
                name="instagram" 
                value={formData.instagram} 
                onChange={handleInputChange} 
                placeholder="เช่น @smo_cbs"
              />
            </div>
          </div>

          <div className="input-group mb-md">
            <label className="input-label">ที่อยู่ปัจจุบัน (Address)</label>
            <textarea 
              className="input" 
              name="address" 
              rows="2" 
              value={formData.address} 
              onChange={handleInputChange} 
              placeholder="ที่อยู่สำหรับจัดส่งเอกสารหรือติดต่อ"
            />
          </div>

          <div className="grid-3 mb-md">
            <div className="input-group">
              <label className="input-label">ไซส์เสื้อ (Shirt Size)</label>
              <input 
                type="text" 
                className="input font-en" 
                name="shirtSize" 
                value={formData.shirtSize} 
                onChange={handleInputChange} 
                placeholder="เช่น M, L, XL"
              />
            </div>
            <div className="input-group">
              <label className="input-label">กรุ๊ปเลือด (Blood Group)</label>
              <input 
                type="text" 
                className="input font-en" 
                name="bloodGroup" 
                value={formData.bloodGroup} 
                onChange={handleInputChange} 
                placeholder="เช่น O, A, B, AB"
              />
            </div>
            <div className="input-group">
              <label className="input-label">MBTI</label>
              <input 
                type="text" 
                className="input font-en" 
                name="mbti" 
                value={formData.mbti} 
                onChange={handleInputChange} 
                placeholder="เช่น ENFP, INTJ"
              />
            </div>
          </div>

          <div className="grid-2 mb-lg">
            <div className="input-group">
              <label className="input-label">สิ่งที่แพ้ (Allergies)</label>
              <input 
                type="text" 
                className="input" 
                name="allergies" 
                value={formData.allergies} 
                onChange={handleInputChange} 
                placeholder="เช่น แพ้กุ้ง, แพ้ยาแก้ปวด"
              />
            </div>
            <div className="input-group">
              <label className="input-label">โรคประจำตัว (Medical Condition)</label>
              <input 
                type="text" 
                className="input" 
                name="medicalCondition" 
                value={formData.medicalCondition} 
                onChange={handleInputChange} 
                placeholder="เช่น หอบหืด"
              />
            </div>
          </div>

          <div className="flex justify-end pt-md" style={{ borderTop: '1px solid var(--border-primary)' }}>
            <button type="submit" className="btn btn-primary flex items-center gap-xs" disabled={isSaving}>
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}</span>
            </button>
          </div>
        </form>
      </div>

      <div className="card hover-glow">
        <h3 className="mb-md flex items-center gap-xs">
          <KeyRound size={20} style={{ color: 'var(--blue-600)' }} />
          <span>เปลี่ยนรหัสผ่านส่วนตัว (Change Password)</span>
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          ตั้งรหัสผ่านใหม่ของคุณเองเพื่อความปลอดภัยในการเข้าใช้งาน
        </p>

        <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="input-group">
            <label className="input-label">รหัสผ่านปัจจุบัน (Current Password)</label>
            <input 
              type="password" 
              className="input font-en" 
              value={currentPassword} 
              onChange={e => setCurrentPassword(e.target.value)} 
              placeholder="กรอกรหัสผ่านปัจจุบัน (ถ้ายังไม่เคยเปลี่ยน คือ รหัสนิสิต)"
              required 
            />
          </div>

          <div className="grid-2 gap-md">
            <div className="input-group">
              <label className="input-label">รหัสผ่านใหม่ (New Password)</label>
              <input 
                type="password" 
                className="input font-en" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                placeholder="รหัสผ่านใหม่ อย่างน้อย 4 ตัวอักษร"
                required 
              />
            </div>
            <div className="input-group">
              <label className="input-label">ยืนยันรหัสผ่านใหม่ (Confirm Password)</label>
              <input 
                type="password" 
                className="input font-en" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                required 
              />
            </div>
          </div>

          <div className="flex justify-end mt-sm">
            <button type="submit" className="btn btn-secondary flex items-center gap-xs" disabled={isChangingPass} style={{ fontWeight: '700' }}>
              {isChangingPass ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              <span>{isChangingPass ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
