'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck, Megaphone, ClipboardList, Clock, ChevronRight, X } from 'lucide-react';

export default function NotificationPopover({ isOpen, onClose, onUnreadCountChange }) {
  const router = useRouter();
  const popoverRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
        onUnreadCountChange?.(data.unreadCount || 0);
      })
      .catch(err => console.error('Notifications fetch error:', err))
      .finally(() => setIsLoading(false));
  }, [isOpen, onUnreadCountChange]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const handleMarkAllRead = () => {
    setUnreadCount(0);
    onUnreadCountChange?.(0);
  };

  const handleItemClick = (notif) => {
    onClose();
    if (notif.link) {
      router.push(notif.link);
    }
  };

  if (!isOpen) return null;

  return (
    <div ref={popoverRef} className="notification-popover hover-glow">
      <div className="notif-header">
        <div className="notif-title-wrapper">
          <Bell size={18} className="text-accent" strokeWidth={1.8} />
          <h3>การแจ้งเตือน</h3>
          {unreadCount > 0 && <span className="notif-badge">{unreadCount} ใหม่</span>}
        </div>
        <div className="notif-actions">
          {unreadCount > 0 && (
            <button className="notif-read-all-btn" onClick={handleMarkAllRead} title="อ่านทั้งหมดแล้ว">
              <CheckCheck size={14} /> อ่านแล้ว
            </button>
          )}
          <button className="notif-close-btn" onClick={onClose} title="ปิด">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="notif-body">
        {isLoading ? (
          <div className="notif-loading">
            <Clock size={20} className="animate-spin" />
            <span>กำลังโหลดการแจ้งเตือน...</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notif-empty">
            <Bell size={32} style={{ color: 'var(--text-tertiary)' }} />
            <p>ไม่มีการแจ้งเตือนใหม่ในขณะนี้</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="notif-item hover-slide"
                onClick={() => handleItemClick(n)}
              >
                <div className="notif-icon-wrapper" style={{ background: n.badgeColor + '15', color: n.badgeColor }}>
                  {n.type === 'announcement' ? (
                    <Megaphone size={16} strokeWidth={1.8} />
                  ) : (
                    <ClipboardList size={16} strokeWidth={1.8} />
                  )}
                </div>
                <div className="notif-content">
                  <div className="notif-item-title">{n.title}</div>
                  <div className="notif-item-desc">{n.message}</div>
                  <div className="notif-item-time">{n.time}</div>
                </div>
                <ChevronRight size={14} className="notif-arrow" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="notif-footer">
        <span>สโมสรนิสิต ERP Notification Center</span>
      </div>
    </div>
  );
}
