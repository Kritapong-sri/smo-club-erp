'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

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
    <div className="login-minimal-page">
      <div className="login-minimal-card">
        <h1 className="login-minimal-title">ERP SMO BANSHI</h1>

        {error && (
          <div className="login-minimal-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="login-minimal-form">
          <div className="login-minimal-field">
            <label htmlFor="student-id">รหัสนิสิต</label>
            <input
              id="student-id"
              type="text"
              inputMode="numeric"
              placeholder="รหัสนิสิต"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="login-minimal-field">
            <label htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="login-minimal-btn" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
