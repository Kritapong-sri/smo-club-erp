'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import SpotlightSearch from '@/components/SpotlightSearch';
import './globals.css';

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const pathname = usePathname();
  const isAuthRoute = pathname === '/login';

  // Set initial sidebar state based on screen width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Listen to custom global event for Spotlight search
  useEffect(() => {
    const handleCustomOpen = (e) => {
      setSpotlightQuery(e.detail?.query || '');
      setSpotlightOpen(true);
    };

    window.addEventListener('open-spotlight', handleCustomOpen);
    return () => window.removeEventListener('open-spotlight', handleCustomOpen);
  }, []);

  useEffect(() => {
    if (isAuthRoute) return;
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(err => console.error(err));
  }, [isAuthRoute]);

  const handleOpenSpotlight = (initialQ = '') => {
    setSpotlightQuery(initialQ);
    setSpotlightOpen(true);
  };

  return (
    <html lang="th" data-scroll-behavior="smooth">
      <head>
        <title>SMO Club ERP — ระบบหลังบ้านสโมสร</title>
        <meta name="description" content="ระบบ ERP สำหรับบริหารจัดการสโมสรนิสิต จัดการกิจกรรม สมาชิก งบประมาณ และเอกสาร" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={isAuthRoute ? 'auth-body' : ''}>
        {isAuthRoute ? (
          <main className="auth-content">{children}</main>
        ) : (
          <>
            <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
              <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                currentUser={currentUser}
              />
              <div className="main-wrapper">
                <Navbar
                  isOpen={sidebarOpen}
                  onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                  currentUser={currentUser}
                  onOpenSpotlight={handleOpenSpotlight}
                />
                <main className="main-content">
                  {children}
                </main>
              </div>
            </div>

            <SpotlightSearch
              isOpen={spotlightOpen}
              onClose={() => setSpotlightOpen(false)}
              initialQuery={spotlightQuery}
            />
          </>
        )}
      </body>
    </html>
  );
}
