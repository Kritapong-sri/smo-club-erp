'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  SearchX,
  X,
  User,
  FileText,
  ChevronRight,
  LayoutDashboard,
  ClipboardList,
  Users,
  Wrench,
  UserCog,
  Wallet,
  Building2,
  Sparkles,
  Loader2,
  Zap
} from 'lucide-react';

const pageIconMap = {
  '/': <LayoutDashboard size={18} strokeWidth={1.8} style={{ color: 'var(--blue-600)' }} />,
  '/activities': <ClipboardList size={18} strokeWidth={1.8} style={{ color: 'var(--blue-600)' }} />,
  '/members': <Users size={18} strokeWidth={1.8} style={{ color: 'var(--blue-600)' }} />,
  '/smo-helper': <Wrench size={18} strokeWidth={1.8} style={{ color: 'var(--blue-600)' }} />,
  '/profile': <UserCog size={18} strokeWidth={1.8} style={{ color: 'var(--blue-600)' }} />,
  '/treasurer': <Wallet size={18} strokeWidth={1.8} style={{ color: 'var(--blue-600)' }} />,
  '/executive': <Building2 size={18} strokeWidth={1.8} style={{ color: 'var(--blue-600)' }} />,
};

const getPageIcon = (href) => {
  return pageIconMap[href] || <Sparkles size={18} strokeWidth={1.8} style={{ color: 'var(--blue-600)' }} />;
};

export default function SpotlightSearch({ isOpen, onClose, initialQuery = '' }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState({ activities: [], members: [], pages: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const frame = requestAnimationFrame(() => {
        setQuery(initialQuery);
        setSelectedIndex(0);
        if (inputRef.current) inputRef.current.focus();
      });
      return () => cancelAnimationFrame(frame);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          window.dispatchEvent(new CustomEvent('open-spotlight'));
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      setIsLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          setResults({
            pages: data.pages || [],
            members: data.members || [],
            activities: data.activities || []
          });
          setSelectedIndex(0);
        })
        .catch(err => console.error('Search fetch error:', err))
        .finally(() => setIsLoading(false));
    }, 180);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const flatItems = [
    ...(results.pages || []).map(p => ({ ...p, type: 'page' })),
    ...(results.members || []).map(m => ({ ...m, type: 'member' })),
    ...(results.activities || []).map(a => ({ ...a, type: 'activity' })),
  ];

  const handleSelect = (item) => {
    if (!item) return;
    onClose();
    if (item.type === 'page') {
      router.push(item.href);
    } else if (item.type === 'member') {
      router.push(`/members/${item.id}`);
    } else if (item.type === 'activity') {
      router.push(`/activities/${item.id}`);
    }
  };

  const handleKeyDownInput = (e) => {
    if (flatItems.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % flatItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelect(flatItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  let currentIndexTracker = 0;

  return (
    <div className="spotlight-overlay" onClick={onClose}>
      <div className="spotlight-container hover-glow" onClick={(e) => e.stopPropagation()}>
        <div className="spotlight-header">
          <Search size={18} className="spotlight-search-icon" strokeWidth={1.8} />
          <input
            ref={inputRef}
            type="text"
            className="spotlight-input"
            placeholder="ค้นหากิจกรรม, นิสิต/สมาชิก, หน้าระบบ หรือเอกสาร..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDownInput}
          />
          {isLoading && <Loader2 size={16} className="animate-spin" style={{ color: 'var(--blue-600)' }} />}
          {query && (
            <button
              className="spotlight-clear-btn"
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              title="ล้างคำค้นหา"
            >
              <X size={14} strokeWidth={1.8} />
            </button>
          )}
          <kbd className="spotlight-esc-badge" onClick={onClose}>ESC</kbd>
        </div>

        <div className="spotlight-body">
          {flatItems.length === 0 && !isLoading && (
            <div className="spotlight-empty">
              <SearchX size={36} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)' }} />
              <p className="empty-title">ไม่พบข้อมูลที่ตรงกับ “{query}”</p>
              <p className="empty-desc">ลองค้นหาด้วยชื่อนิสิต รหัสนิสิต หรือชื่อกิจกรรมสโมสร</p>
            </div>
          )}

          {results.pages && results.pages.length > 0 && (
            <div className="spotlight-section">
              <div className="spotlight-section-title flex items-center gap-xs">
                <Zap size={14} style={{ color: 'var(--blue-600)' }} />
                <span>หน้าระบบ & เมนูด่วน</span>
              </div>
              <div className="spotlight-list">
                {results.pages.map((p) => {
                  const itemIndex = currentIndexTracker++;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <div
                      key={p.href}
                      className={`spotlight-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect({ ...p, type: 'page' })}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <span className="item-icon">
                        {getPageIcon(p.href)}
                      </span>
                      <div className="item-content">
                        <span className="item-title">{p.title}</span>
                        <span className="item-desc">{p.desc}</span>
                      </div>
                      <span className="item-action">
                        เปิดหน้า <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {results.members && results.members.length > 0 && (
            <div className="spotlight-section">
              <div className="spotlight-section-title flex items-center gap-xs">
                <Users size={14} style={{ color: 'var(--blue-600)' }} />
                <span>สมาชิก & คณะทำงานสโมสร</span>
              </div>
              <div className="spotlight-list">
                {results.members.map((m) => {
                  const itemIndex = currentIndexTracker++;
                  const isSelected = itemIndex === selectedIndex;
                  const fullName = `${m.prefix || ''}${m.firstNameTh || ''} ${m.lastNameTh || ''}`.trim() || 'นิสิตสโมสร';
                  return (
                    <div
                      key={m.id}
                      className={`spotlight-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect({ ...m, type: 'member' })}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <div className="item-avatar">
                        {m.nickname ? m.nickname[0] : (m.firstNameTh ? m.firstNameTh[0] : <User size={16} />)}
                      </div>
                      <div className="item-content">
                        <div className="item-title-wrapper">
                          <span className="item-title">{fullName}</span>
                          {m.nickname && <span className="item-badge">({m.nickname})</span>}
                        </div>
                        <span className="item-desc">
                          {m.positionTitle || 'สมาชิก'} {m.studentId ? `• รหัส ${m.studentId}` : ''}
                        </span>
                      </div>
                      <span className="item-action">
                        ดูโปรไฟล์ <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {results.activities && results.activities.length > 0 && (
            <div className="spotlight-section">
              <div className="spotlight-section-title flex items-center gap-xs">
                <ClipboardList size={14} style={{ color: 'var(--blue-600)' }} />
                <span>กิจกรรม & โครงการ</span>
              </div>
              <div className="spotlight-list">
                {results.activities.map((a) => {
                  const itemIndex = currentIndexTracker++;
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <div
                      key={a.id}
                      className={`spotlight-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelect({ ...a, type: 'activity' })}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                    >
                      <span className="item-icon">
                        <FileText size={18} strokeWidth={1.8} style={{ color: 'var(--blue-600)' }} />
                      </span>
                      <div className="item-content">
                        <span className="item-title">{a.title}</span>
                        <span className="item-desc">
                          {a.department?.name ? `ฝ่าย${a.department.name}` : 'สโมสรนิสิต'} • สถานะ: {a.status === 'approved' || a.status === 'completed' ? 'อนุมัติแล้ว' : 'กำลังดำเนินการ'}
                        </span>
                      </div>
                      <span className="item-action">
                        ดูโครงการ <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
