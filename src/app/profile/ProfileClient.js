'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

    // Use Imgur API as a free fallback if Cloudinary is not properly configured
    const useCloudinary = cloudName && cloudName !== "demo" && uploadPreset;

    try {
      if (useCloudinary) {
        // --- CLOUDINARY UPLOAD ---
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
        // --- IMGUR FALLBACK UPLOAD via Next.js Proxy (Fix CORS) ---
        const data = new FormData();
        data.append('file', file); // API expects 'file'

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
        throw new Error(await res.text());
      }

      alert('บันทึกข้อมูลเรียบร้อยแล้ว!');
      router.refresh();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>โปรไฟล์ของฉัน (My Profile)</h1>
        <p>คุณสามารถแก้ไขข้อมูลส่วนตัวและการติดต่อได้ที่นี่</p>
      </div>

      <div className="card mb-lg" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleSubmit}>
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-xl">
            <div style={{
              width: '120px', height: '120px', borderRadius: 'var(--radius-full)',
              background: avatarUrl ? `url(${avatarUrl}) center/cover` : 'var(--gradient-primary)', 
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '48px', fontWeight: 'bold', marginBottom: 'var(--space-md)',
              boxShadow: 'var(--shadow-glow)'
            }}>
              {!avatarUrl && (user.nickname?.[0] || user.firstNameTh?.[0] || '?')}
            </div>
            
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              {isUploading ? 'กำลังอัปโหลด...' : '📷 เปลี่ยนรูปโปรไฟล์'}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
                style={{ display: 'none' }} 
                disabled={isUploading}
              />
            </label>
            <div className="text-secondary mt-xs" style={{ fontSize: '12px' }}>รองรับ JPG, PNG (ขนาดไม่เกิน 5MB)</div>
          </div>

          {/* Form Fields */}
          <div className="grid-2 gap-md mb-lg">
            <div className="input-group">
              <label className="input-label">ชื่อเล่น</label>
              <input type="text" name="nickname" className="input" value={formData.nickname} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label className="input-label">เบอร์โทรศัพท์</label>
              <input type="tel" name="phone" className="input" value={formData.phone} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label className="input-label">Line ID</label>
              <input type="text" name="lineId" className="input" value={formData.lineId} onChange={handleInputChange} />
            </div>
            <div className="input-group">
              <label className="input-label">Instagram</label>
              <input type="text" name="instagram" className="input" value={formData.instagram} onChange={handleInputChange} />
            </div>
            <div className="input-group" style={{ gridColumn: '1 / -1' }}>
              <label className="input-label">ที่อยู่ปัจจุบัน</label>
              <textarea name="address" className="textarea" value={formData.address} onChange={handleInputChange} rows={2}></textarea>
            </div>
          </div>

          <hr className="mb-lg" style={{ borderColor: 'var(--border-primary)' }} />
          
          <h3 className="mb-md">ข้อมูลเพิ่มเติม / สุขภาพ</h3>
          <div className="grid-2 gap-md mb-xl">
            <div className="input-group">
              <label className="input-label">ไซส์เสื้อ</label>
              <select name="shirtSize" className="select" value={formData.shirtSize} onChange={handleInputChange}>
                <option value="">- เลือกไซส์ -</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="2XL">2XL</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">กรุ๊ปเลือด</label>
              <select name="bloodGroup" className="select" value={formData.bloodGroup} onChange={handleInputChange}>
                <option value="">- เลือกกรุ๊ปเลือด -</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="O">O</option>
                <option value="AB">AB</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">สิ่งที่แพ้ (อาหาร, ยา ฯลฯ)</label>
              <input type="text" name="allergies" className="input" value={formData.allergies} onChange={handleInputChange} placeholder="ไม่มี ให้เว้นว่าง" />
            </div>
            <div className="input-group">
              <label className="input-label">โรคประจำตัว</label>
              <input type="text" name="medicalCondition" className="input" value={formData.medicalCondition} onChange={handleInputChange} placeholder="ไม่มี ให้เว้นว่าง" />
            </div>
            <div className="input-group">
              <label className="input-label">MBTI</label>
              <input type="text" name="mbti" className="input" value={formData.mbti} onChange={handleInputChange} placeholder="เช่น ENFP" />
            </div>
            <div className="input-group">
              <label className="input-label">E-Color</label>
              <input type="text" name="eColor" className="input" value={formData.eColor} onChange={handleInputChange} placeholder="สีประจำตัว" />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={isSaving || isUploading} style={{ minWidth: '150px' }}>
              {isSaving ? 'กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
