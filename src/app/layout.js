'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import './globals.css';

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <html lang="th">
      <head>
        <title>SMO Club ERP — ระบบหลังบ้านสโมสร</title>
        <meta name="description" content="ระบบ ERP สำหรับบริหารจัดการสโมสรนิสิต จัดการกิจกรรม สมาชิก งบประมาณ และเอกสาร" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <div className="app-layout">
          <button
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="main-content">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
