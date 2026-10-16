'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ListFilter } from 'lucide-react';

export default function CalendarWidget({ events = [], onDateSelect }) {
  const [today] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const scrollRef = useRef(null);

  const year = viewYear;
  const month = viewMonth;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const dayNames = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

  const scrollDays = useCallback((direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = 200;
    container.scrollLeft += direction * scrollAmount;
  }, []);

  const changeMonth = (direction) => {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setViewMonth(newMonth);
    setViewYear(newYear);
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    }, 50);
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const todayIndex = today.getDate() - 1;
    const itemWidth = 56;
    const offset = todayIndex * itemWidth - container.clientWidth / 2 + itemWidth / 2;
    container.scrollLeft = Math.max(0, offset);
  }, [today]);

  const handleDateClick = (day) => {
    const newSelected = new Date(year, month, day);
    setSelectedDate(newSelected);
    if (onDateSelect) {
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      onDateSelect(formattedDate);
    }
  };

  const getEventsForDay = (day) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === formattedDate);
  };

  const selYear = selectedDate.getFullYear();
  const selMonth = selectedDate.getMonth();
  const selectedDateFormatted = `${selYear}-${String(selMonth + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  const selectedEvents = events.filter(e => e.date === selectedDateFormatted);

  const isToday = (day) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  };

  const monthLabelStyle = {
    margin: 0,
    fontSize: '16px',
    fontWeight: 700,
    color: 'var(--blue-700)',
  };

  const arrowBtnStyle = {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-secondary)',
    borderRadius: '10px',
    background: 'var(--bg-surface)',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    transition: 'background 0.15s',
  };

  const scrollContainerStyle = {
    display: 'flex',
    gap: '6px',
    overflowX: 'auto',
    paddingBottom: '8px',
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch',
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
  };

  const getDayStyle = (day) => {
    const selected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
    const todayCheck = isToday(day);

    return {
      minWidth: '48px',
      height: '60px',
      borderRadius: '14px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2px',
      cursor: 'pointer',
      flexShrink: 0,
      transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
      border: selected ? 'none' : todayCheck ? '1px solid var(--blue-400)' : '1px solid var(--border-secondary)',
      background: selected ? 'var(--gradient-primary)' : todayCheck ? 'var(--blue-50, #EBF5FF)' : 'var(--bg-surface)',
      color: selected ? '#ffffff' : todayCheck ? 'var(--blue-600)' : 'var(--text-primary)',
      boxShadow: selected ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none',
      position: 'relative',
    };
  };

  return (
    <div style={{ userSelect: 'none' }}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => changeMonth(-1)}
            aria-label="เดือนก่อนหน้า"
            style={{ ...arrowBtnStyle, width: '28px', height: '28px', borderRadius: '8px' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
          >
            <ChevronLeft size={16} />
          </button>
          <h3 style={monthLabelStyle}>
            {monthNames[month]} {year + 543}
          </h3>
          <button
            type="button"
            onClick={() => changeMonth(1)}
            aria-label="เดือนถัดไป"
            style={{ ...arrowBtnStyle, width: '28px', height: '28px', borderRadius: '8px' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={() => scrollDays(-1)}
            aria-label="เลื่อนวันไปทางซ้าย"
            style={arrowBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => scrollDays(1)}
            aria-label="เลื่อนวันไปทางขวา"
            style={arrowBtnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)'; }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} style={scrollContainerStyle}>
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayDate = new Date(year, month, day);
          const dayOfWeek = dayNames[dayDate.getDay()];
          const dayEvents = getEventsForDay(day);
          const selected = selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;

          return (
            <div
              key={day}
              onClick={() => handleDateClick(day)}
              style={getDayStyle(day)}
              onMouseEnter={(e) => {
                if (!selected) e.currentTarget.style.background = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (!selected) {
                  e.currentTarget.style.background = isToday(day) ? 'var(--blue-50, #EBF5FF)' : 'var(--bg-surface)';
                }
              }}
            >
              <span style={{ fontSize: '11px', color: selected ? 'rgba(255,255,255,0.8)' : 'var(--text-tertiary)', fontWeight: 600, lineHeight: 1 }}>
                {dayOfWeek}
              </span>
              <span style={{ fontSize: '18px', fontWeight: selected ? 700 : 500, lineHeight: 1.2 }}>
                {day}
              </span>
              {dayEvents.length > 0 && (
                <div style={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '5px' }}>
                  {dayEvents.slice(0, 3).map((e, idx) => (
                    <div key={idx} style={{
                      width: '4px', height: '4px', borderRadius: '50%',
                      background: selected ? 'white' : (e.color || 'var(--blue-500)')
                    }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        div[style*="overflowX"]::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '12px', marginTop: '4px' }}>
        <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ListFilter size={15} /> รายการวันที่ {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {selectedEvents.length > 0 ? (
            selectedEvents.map(evt => (
              <div key={evt.id} style={{
                padding: '10px 14px',
                background: 'var(--bg-surface-hover)',
                borderRadius: '10px',
                borderLeft: `3px solid ${evt.color || 'var(--blue-500)'}`
              }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{evt.title}</div>
                {evt.subtitle && <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '3px' }}>{evt.subtitle}</div>}
              </div>
            ))
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
              ไม่มีกิจกรรมในวันนี้
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
