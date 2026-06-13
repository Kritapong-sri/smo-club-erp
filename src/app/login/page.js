'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      // 🔄 บังคับรีเฟรชหน้าหลักเพื่อดึงข้อมูล Cookie ล่าสุดมาใช้
      window.location.href = '/';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🎓</div>
        <h1>SMO Club ERP</h1>
        <p className="subtitle">ระบบบริหารจัดการสโมสรนิสิต</p>
        
        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">รหัสนิสิต (Student ID)</label>
            <input 
              type="text" 
              className="input" 
              placeholder="เช่น 6631xxxx26"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <div className="flex justify-between">
              <label className="input-label">รหัสผ่าน (Password)</label>
            </div>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ (Login)'}
          </button>
        </form>
        
        <div className="mt-md text-center text-xs text-tertiary">
          <p>ล็อกอินด้วย <b>รหัสนิสิต</b></p>
          <p className="mt-xs">รหัสผ่านเริ่มต้นคือ <b>รหัสนิสิตของคุณเอง</b></p>
        </div>
      </div>
    </div>
  );
}
