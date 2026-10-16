'use client';
import { CalendarRange } from 'lucide-react';
import CompactActivityCard from './CompactActivityCard';

export default function ActivityCarousel({ activities }) {
  if (!activities.length) {
    return (
      <div className="empty-state compact-empty-state">
        <CalendarRange size={30} aria-hidden="true" />
        <p>ยังไม่มีกิจกรรมในระบบ</p>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', minWidth: 0 }}>
      {/* Scroll Container */}
      <div 
        className="horizontal-scroll-container"
        style={{
          display: 'flex',
          gap: '16px',
          overflowX: 'auto',
          paddingBottom: '16px',
          scrollBehavior: 'smooth',
          scrollbarWidth: 'thin', // Firefox
        }}
      >
        {activities.map(act => (
          <CompactActivityCard key={act.id} activity={act} />
        ))}
      </div>
    </div>
  );
}
