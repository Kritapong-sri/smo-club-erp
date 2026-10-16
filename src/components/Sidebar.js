'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Wrench,
  UserCog,
  Wallet,
  Building2,
  LogOut
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose, currentUser: initialUser }) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState(initialUser || null);
  const [isLoading, setIsLoading] = useState(!initialUser);

  useEffect(() => {
    if (initialUser) return;
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
  }, [initialUser]);

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
      { label: 'หลักการทำงาน', type: 'section' },
      { href: '/', icon: <LayoutDashboard size={19} strokeWidth={1.8} />, label: 'หน้าหลัก Dashboard' },
      { href: '/activities', icon: <ClipboardList size={19} strokeWidth={1.8} />, label: 'กิจกรรม Activities' },
      { href: '/members', icon: <Users size={19} strokeWidth={1.8} />, label: 'สมาชิก Members' },
      { label: 'เครื่องมือและโปรไฟล์', type: 'section' },
      { href: '/smo-helper', icon: <Wrench size={19} strokeWidth={1.8} />, label: 'SMO Helper' },
      { href: '/profile', icon: <UserCog size={19} strokeWidth={1.8} />, label: 'โปรไฟล์ของฉัน' },
    ];

    if (isTreasurer(user)) {
      items.splice(4, 0, { href: '/treasurer', icon: <Wallet size={19} strokeWidth={1.8} />, label: 'เหรัญญิก Treasurer' });
    }
    if (isExecutive(user)) {
      items.splice(isTreasurer(user) ? 5 : 4, 0, { href: '/executive', icon: <Building2 size={19} strokeWidth={1.8} />, label: 'สามเหลี่ยม Executive' });
    }

    return items;
  };

  const getInitials = (name) => {
    if (!name) return 'SMO';
    const parts = name.split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const handleLogout = async () => {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    }
  };

  const handleNavClick = () => {
    if (window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      <div
        className="sidebar-overlay"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-container hover-scale">
            <Image src="/Logo SMO.png" alt="SMO Logo" className="sidebar-logo" width={44} height={44} priority />
          </div>
          <div className="sidebar-brand">
            <h2>SMO ERP</h2>
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
                className={`nav-item ${isActive ? 'active' : ''} hover-slide`}
                onClick={handleNavClick}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {isActive && <span className="nav-active-pill" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user-card hover-lift">
            <div className="user-avatar-badge">
              {isLoading ? '...' : getInitials(currentUser?.name)}
            </div>
            <div className="user-info-text">
              <div className="user-name-title">{isLoading ? 'กำลังโหลด...' : (currentUser?.name || 'ผู้เยี่ยมชม')}</div>
              <div className="user-role-title">
                {isLoading ? 'ตรวจสอบสิทธิ์...' : (currentUser?.positionTitle || 'นิสิตทั่วไป')}
              </div>
            </div>
            {currentUser && (
              <button
                onClick={handleLogout}
                className="sidebar-logout-btn hover-scale"
                title="ออกจากระบบ"
              >
                <LogOut size={16} strokeWidth={1.8} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
