'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
  CalendarCheck2,
  Loader2,
  LogIn,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from 'lucide-react';

export default function LoginPage() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'ไม่สามารถเข้าสู่ระบบได้');
      }

      window.location.href = '/';
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-brand-panel" aria-label="แนะนำระบบ SMO ERP">
        <div className="login-brand-mark">
          <Image src="/Logo SMO.png" alt="SMO Logo" width={76} height={76} priority />
          <div>
            <span className="login-eyebrow">STUDENT UNION · CBS</span>
            <h1>SMO ERP</h1>
          </div>
        </div>

        <div className="login-brand-copy">
          <span className="login-kicker">พื้นที่ทำงานของสโมสรนิสิต</span>
          <h2>จัดการงานสโมสร<br />ให้ชัดเจนในที่เดียว</h2>
          <p>กิจกรรม งบประมาณ เอกสาร และข้อมูลสมาชิก เชื่อมต่อกันอย่างเป็นระบบ</p>
        </div>

        <div className="login-feature-list">
          <div><CalendarCheck2 size={18} /><span>ติดตามกิจกรรมและสถานะอนุมัติ</span></div>
          <div><WalletCards size={18} /><span>วางแผนและตรวจสอบงบประมาณ</span></div>
          <div><UsersRound size={18} /><span>ดูแลข้อมูลสมาชิกอย่างปลอดภัย</span></div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-card">
          <div className="login-mobile-logo">
            <Image src="/Logo SMO.png" alt="SMO Logo" width={64} height={64} priority />
          </div>

          <div className="login-heading">
            <span className="login-secure-label"><ShieldCheck size={15} /> ระบบภายในสโมสร</span>
            <h1>ยินดีต้อนรับกลับ</h1>
            <p className="subtitle">เข้าสู่ระบบด้วยรหัสนิสิตของคุณ</p>
          </div>

          {error && <div className="form-alert error" role="alert">{error}</div>}

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label" htmlFor="student-id">รหัสนิสิต (Student ID)</label>
              <input
                id="student-id"
                type="text"
                inputMode="numeric"
                className="input font-en"
                placeholder="เช่น 6631xxxx26"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">รหัสผ่าน (Password)</label>
              <input
                id="password"
                type="password"
                className="input font-en"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
              {loading ? <Loader2 size={17} className="animate-spin" /> : <LogIn size={17} />}
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
            </button>
          </form>

          <div className="login-help">
            <ShieldCheck size={16} />
            <span>รหัสผ่านเริ่มต้นคือรหัสนิสิต และควรเปลี่ยนหลังเข้าใช้งานครั้งแรก</span>
          </div>
        </div>
      </section>
    </div>
  );
}
