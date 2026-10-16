'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, User, LogOut, Menu, X } from 'lucide-react';
import NotificationPopover from '@/components/NotificationPopover';

export default function Navbar({ isOpen, onToggleSidebar, currentUser, onOpenSpotlight }) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setUnreadCount(data.unreadCount || 0))
      .catch(err => console.error('Notifications count error:', err));
  }, []);

  const getPageTitle = (path) => {
    if (path === '/') return { title: 'หน้าหลัก Dashboard', breadcrumb: 'ระบบบริหารจัดการสโมสร' };
    if (path.startsWith('/activities')) return { title: 'กิจกรรม Activities', breadcrumb: 'จัดการและติดตามกิจกรรมนิสิต' };
    if (path.startsWith('/members')) return { title: 'สมาชิก Members', breadcrumb: 'รายชื่อและข้อมูลสมาชิกสโมสร' };
    if (path.startsWith('/smo-helper')) return { title: 'SMO Helper', breadcrumb: 'เครื่องมือช่วยเหลือและแบบฟอร์ม' };
    if (path.startsWith('/profile')) return { title: 'โปรไฟล์ของฉัน Profile', breadcrumb: 'ข้อมูลส่วนตัวและการตั้งค่า' };
    if (path.startsWith('/treasurer')) return { title: 'เหรัญญิก Treasurer', breadcrumb: 'การเงิน งบประมาณ และสรุป MP' };
    if (path.startsWith('/executive')) return { title: 'สามเหลี่ยม Executive', breadcrumb: 'อนุมัติเอกสารและติดตามโครงการ' };
    return { title: 'SMO ERP', breadcrumb: 'สโมสรนิสิต' };
  };

  const pageInfo = getPageTitle(pathname);

  const getInitials = (name) => {
    if (!name) return 'SMO';
    const parts = name.trim().split(' ');
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0][0].toUpperCase();
  };

  const handleLogout = async () => {
    if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/login';
    }
  };

  const handleSearchClick = () => {
    if (onOpenSpotlight) {
      onOpenSpotlight(searchQuery);
    }
  };

  return (
    <header className={`top-navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="navbar-left">
        <button
          className={`navbar-toggle-btn hover-scale ${isOpen ? 'active' : ''}`}
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
          title={isOpen ? 'ซ่อนเมนูด้านข้าง' : 'แสดงเมนูด้านข้าง'}
        >
          {isOpen ? <X size={20} strokeWidth={1.8} /> : <Menu size={20} strokeWidth={1.8} />}
        </button>

        <div className="navbar-title-container">
          <div className="navbar-breadcrumb">{pageInfo.breadcrumb}</div>
          <h1 className="navbar-title">{pageInfo.title}</h1>
        </div>
      </div>

      <div className="navbar-center">
        <div className="navbar-search-wrapper hover-glow" onClick={handleSearchClick}>
          <span className="search-icon">
            <Search size={16} strokeWidth={1.8} />
          </span>
          <input
            type="text"
            className="navbar-search-input"
            placeholder="ค้นหากิจกรรม, สมาชิก, หน้าระบบ..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (onOpenSpotlight) onOpenSpotlight(e.target.value);
            }}
            onFocus={handleSearchClick}
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>
      </div>

      <div className="navbar-right" style={{ position: 'relative' }}>
        <button
          className="navbar-icon-btn hover-lift"
          title="การแจ้งเตือน"
          onClick={() => setNotifOpen(!notifOpen)}
          aria-expanded={notifOpen}
          aria-label={unreadCount > 0 ? `การแจ้งเตือนใหม่ ${unreadCount} รายการ` : 'การแจ้งเตือน'}
        >
          <Bell size={18} strokeWidth={1.8} />
          {unreadCount > 0 && <span className="notification-dot" />}
        </button>

        {/* Notification Popover Dropdown */}
        <NotificationPopover
          isOpen={notifOpen}
          onClose={() => setNotifOpen(false)}
          onUnreadCountChange={setUnreadCount}
        />

        <div className="navbar-user-pill hover-lift">
          <div className="user-pill-avatar">
            {currentUser?.name ? getInitials(currentUser.name) : <User size={16} strokeWidth={1.8} />}
          </div>
          <div className="user-pill-info">
            <span className="user-pill-name">{currentUser?.name || 'ผู้เยี่ยมชม'}</span>
            <span className="user-pill-role">{currentUser?.positionTitle || 'นิสิต'}</span>
          </div>
          
          {currentUser && (
            <button
              onClick={handleLogout}
              className="user-logout-btn"
              title="ออกจากระบบ"
            >
              <LogOut size={14} strokeWidth={1.8} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
