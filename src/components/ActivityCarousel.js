'use client';
import { useRef } from 'react';
import CompactActivityCard from './CompactActivityCard';

export default function ActivityCarousel({ activities }) {
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
