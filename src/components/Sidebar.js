'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to check roles
  const isTreasurer = (user) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'board') return true;
    return user.positionTitle && user.positionTitle.includes('เหรัญญิก');
  };

  const isExecutive = (user) => {
    if (!user) return false;
    if (user.role === 'admin' || user.role === 'board') return true;
    const pos = user.positionTitle || '';
    return pos.includes('นายก') || pos.includes('อุปนายก');
  };

  const getNavItems = (user) => {
    const items = [
      { label: 'หน้า', type: 'section' },
      { href: '/', icon: '🏠', label: 'Home', badge: null },
      { href: '/activities', icon: '📋', label: 'กิจกรรม Activities', badge: null },
      { href: '/members', icon: '👥', label: 'สมาชิก Members', badge: null },
      { label: 'เครื่องมือ', type: 'section' },
      { href: '/smo-helper', icon: '🔒', label: 'SMO Helper', badge: null },
      { href: '/profile', icon: '⚙️', label: 'โปรไฟล์ของฉัน', badge: null },
    ];

    if (isTreasurer(user)) {
      items.splice(5, 0, { href: '/treasurer', icon: '💰', label: 'เหรัญญิก Treasurer', badge: null });
    }
    if (isExecutive(user)) {
      items.splice(isTreasurer(user) ? 6 : 5, 0, { href: '/executive', icon: '🏛️', label: 'สามเหลี่ยม Executive', badge: null });
    }

    return items;
  };

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    return parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0][0];
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/Logo SMO.png" alt="SMO Logo" style={{ width: '64px', height: '64px', borderRadius: '16px' }} className="sidebar-logo" />
          <div className="sidebar-brand">
            <h2>SMO</h2>
            <p>Student Union Chulalongkorn Business School</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {getNavItems(currentUser).map((item, i) => {
            if (item.type === 'section') {
              return (
                <div key={i} className="nav-section-label">
                  {item.label}
                </div>
              );
            }

            const isActive = item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <span className="nav-icon">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-user" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <div className="user-avatar" style={{ background: 'var(--gradient-primary)' }}>
            {isLoading ? '⏳' : getInitials(currentUser?.name)}
          </div>
          <div className="user-info">
            <div className="user-name">{isLoading ? 'กำลังโหลด...' : (currentUser?.name || 'ผู้เยี่ยมชม')}</div>
            <div className="user-role" style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {isLoading ? 'ตรวจสอบสิทธิ์...' : (currentUser?.positionTitle || 'ไม่ได้เข้าสู่ระบบ')}
            </div>
          </div>
          
          {currentUser && (
            <button 
              onClick={() => { if (confirm('ต้องการออกจากระบบหรือไม่?')) handleLogout(); }}
              style={{ 
                marginLeft: 'auto', 
                background: 'var(--color-danger-bg, #FEE2E2)', 
                border: 'none', 
                color: 'var(--color-danger)', 
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }} 
              title="ออกจากระบบ (Logout)"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
