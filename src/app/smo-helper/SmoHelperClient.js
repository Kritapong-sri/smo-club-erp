'use client';
import { useState } from 'react';
import CalendarWidget from '@/components/CalendarWidget';

export default function SmoHelperClient({ initialBookings }) {
  const [activeTab, setActiveTab] = useState('rooms');

  // ──────────────────────────────────────────────
  // 🔑 STEP 1: สร้าง State เก็บค่าจากฟอร์ม
  // ──────────────────────────────────────────────
  // useState คือ React Hook ที่ใช้เก็บค่าตัวแปรที่เปลี่ยนแปลงได้
  // ทุกครั้งที่ค่า state เปลี่ยน → หน้าจอ render ใหม่อัตโนมัติ
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  // 🆕 State ใหม่: ชื่อผู้จอง + ฝ่าย
  // ผู้ใช้จะพิมพ์เอง ไม่ต้องเลือกจาก dropdown
  const [bookerName, setBookerName] = useState('');
  const [bookerDept, setBookerDept] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // เก็บ bookings ใน state เพื่อให้ update หน้าจอได้ทันทีหลังจอง
  const [bookings, setBookings] = useState(initialBookings);

  // ──────────────────────────────────────────────
  // 🔑 STEP 2: แปลง bookings → events สำหรับปฏิทิน
  // ──────────────────────────────────────────────
  // .map() = วนลูปแปลง array ตัวหนึ่ง → เป็น array ใหม่
  const roomCalendarEvents = bookings.map(b => {
    return {
      id: b.id,
      date: b.date,               // ปฏิทินจะเช็คว่า event.date ตรงกับวันที่ไหน
      title: `${b.roomName} (${b.startTime} - ${b.endTime})`,
      subtitle: `${b.purpose} โดย: ${b.bookerName || b.bookedBy?.nickname || 'ไม่ระบุ'} (${b.bookerDept || ''})`.trim(),
      color: b.status === 'confirmed' ? 'var(--color-success)' : 'var(--color-warning)'
    };
  });

  // ──────────────────────────────────────────────
  // 🔑 STEP 3: ฟังก์ชันส่งข้อมูลไป API (Backend)
  // ──────────────────────────────────────────────
  // เมื่อกดปุ่ม "ส่งคำขอจองห้อง" ฟังก์ชันนี้จะทำงาน
  const handleSubmit = async (e) => {
    e.preventDefault(); // ป้องกันหน้าเว็บรีโหลด (พฤติกรรมปกติของ <form>)

    // 3.1: เช็คว่ากรอกครบมั้ย
    if (!date || !startTime || !endTime || !purpose || !bookerName || !bookerDept) {
      setMessage({ type: 'error', text: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' });
      return;
    }

    setIsSubmitting(true); // แสดง loading
    setMessage(null);

    try {
      // 3.2: ส่งข้อมูลไปที่ API Route → /api/room-bookings (POST)
      //      fetch() คือคำสั่ง JavaScript สำหรับเรียก API
      //      method: 'POST' = สร้างข้อมูลใหม่
      //      body: ข้อมูลที่จะส่งไป (ต้องแปลงเป็น JSON ก่อน)
      const res = await fetch('/api/room-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: 'simo',  // ล็อคเป็นห้อง SIMO เท่านั้น
          date,              // วันที่ (YYYY-MM-DD)
          startTime,     // เวลาเริ่ม (HH:MM)
          endTime,       // เวลาจบ (HH:MM)
          purpose,       // วัตถุประสงค์
          bookerName,    // 🆕 ชื่อผู้จอง
          bookerDept,    // 🆕 ฝ่าย
        }),
      });

      // 3.3: เช็คว่า API ตอบกลับมาว่าสำเร็จหรือไม่
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'เกิดข้อผิดพลาด');
      }

      const newBooking = await res.json();

      // 3.4: เพิ่ม booking ใหม่เข้าไปใน state → ปฏิทินจะ update ทันที
      setBookings(prev => [...prev, newBooking]);

      // 3.5: แสดงข้อความสำเร็จ + เคลียร์ฟอร์ม
      setMessage({ type: 'success', text: '✅ จองห้อง SIMO สำเร็จ!' });
      setDate('');
      setStartTime('');
      setEndTime('');
      setPurpose('');
      setBookerName('');
      setBookerDept('');

    } catch (err) {
      setMessage({ type: 'error', text: `❌ ${err.message}` });
    } finally {
      setIsSubmitting(false); // หยุด loading
    }
  };

  // ──────────────────────────────────────────────
  // 🔑 STEP 4: แสดง UI (JSX)
  // ──────────────────────────────────────────────
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-sm mb-xs">
          <h1>SMO Helper</h1>
          <span className="status-badge approved">สโมเท่านั้น</span>
        </div>
        <p>บริการสำหรับสโมสร จองห้องประชุม และค้นหาเอกสารเก่า</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-item ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          📅 จองห้อง (Room Booking)
        </button>
        <button
          className={`tab-item ${activeTab === 'docs' ? 'active' : ''}`}
          onClick={() => setActiveTab('docs')}
        >
          📂 เอกสารเก่า (Archive)
        </button>
        <button
          className={`tab-item ${activeTab === 'services' ? 'active' : ''}`}
          onClick={() => setActiveTab('services')}
        >
          🛠️ บริการฝ่ายต่างๆ
        </button>
      </div>

      {activeTab === 'rooms' && (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* ─── Section 1: จองห้อง SIMO (เฉพาะสโม) ─── */}
          <div className="grid-2" style={{ gap: '24px' }}>
            <form onSubmit={handleSubmit} className="card" style={{ borderTop: '4px solid var(--purple-500, #8B5CF6)', boxShadow: 'var(--shadow-md)' }}>
              <div className="flex items-center gap-sm mb-sm">
                <div style={{ background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)', color: '#7C3AED', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🔒</div>
                <div>
                  <h3 style={{ margin: 0 }}>จองห้อง SIMO</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>เฉพาะสมาชิกสโมสรเท่านั้น</span>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
                border: '1px solid #C4B5FD',
                borderRadius: '10px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#6D28D9',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <span>ℹ️</span>
                <span>ห้อง SIMO สงวนสิทธิ์สำหรับสมาชิกสโมสรนิสิตเท่านั้น ชมรมและนิสิตภายนอกกรุณาจองห้องอื่นผ่านระบบจองห้องทั่วไป</span>
              </div>

              {/* แสดงข้อความ success/error */}
              {message && (
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: message.type === 'success' ? 'var(--color-success-bg, #DCFCE7)' : 'var(--color-danger-bg, #FEE2E2)',
                  color: message.type === 'success' ? 'var(--color-success, #16A34A)' : 'var(--color-danger, #DC2626)',
                }}>
                  {message.text}
                </div>
              )}

              <div className="grid-2 mb-md">
                <div className="input-group">
                  <label className="input-label">ชื่อผู้จอง <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="text"
                    className="input"
                    placeholder="เช่น โอม, ไรเฟิล"
                    value={bookerName}
                    onChange={(e) => setBookerName(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">ฝ่าย <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="text"
                    className="input"
                    placeholder="เช่น หัวปี, สินวัด..."
                    value={bookerDept}
                    onChange={(e) => setBookerDept(e.target.value)}
                  />
                </div>
              </div>

              {/* ห้อง SIMO ล็อคไว้ ไม่ต้องเลือก */}
              <input type="hidden" value="simo" />

              <div className="input-group mb-md" style={{ pointerEvents: 'none', opacity: 0.7 }}>
                <label className="input-label">ห้องที่จอง</label>
                <div className="input" style={{ background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔒</span> ห้อง SIMO
                </div>
              </div>

              <div className="grid-2 mb-md">
                <div className="input-group">
                  <label className="input-label">วันที่ <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <input
                    type="date"
                    className="input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">เวลา <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                  <div className="flex items-center gap-xs">
                    <input
                      type="time"
                      className="input flex-1"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                    <span style={{ color: 'var(--text-tertiary)' }}>ถึง</span>
                    <input
                      type="time"
                      className="input flex-1"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="input-group mb-lg">
                <label className="input-label">วัตถุประสงค์ในการใช้งาน <span style={{ color: 'var(--color-danger)' }}>*</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="เช่น ประชุมเตรียมงานฝ่าย..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full justify-center"
                style={{ padding: '12px', fontSize: '15px', opacity: isSubmitting ? 0.6 : 1, background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }}
              >
                {isSubmitting ? '⏳ กำลังส่ง...' : '🔒 จองห้อง SIMO'}
              </button>
            </form>

            {/* ─── Booking Calendar (SIMO) ─── */}
            <div className="card" style={{ background: 'var(--bg-primary)' }}>
              <div className="flex items-center gap-sm mb-md">
                <div style={{ background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📅</div>
                <h3 style={{ margin: 0 }}>ปฏิทินห้อง SIMO</h3>
              </div>

              <CalendarWidget events={roomCalendarEvents} />

              {/* แสดงรายการจองทั้งหมด */}
              {bookings.length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-primary)', paddingTop: '12px' }}>
                  <h4 style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>📋 รายการจองห้อง SIMO ({bookings.length})</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                    {bookings.map(b => (
                      <div key={b.id} style={{
                        padding: '8px 12px',
                        background: 'var(--bg-surface)',
                        borderRadius: '8px',
                        borderLeft: `3px solid ${b.status === 'confirmed' ? 'var(--color-success)' : 'var(--color-warning, #F59E0B)'}`,
                        fontSize: '12px',
                      }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {b.roomName} • {b.date} ({b.startTime}-{b.endTime})
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', marginTop: '2px' }}>
                          {b.purpose} {b.bookerName && `• จองโดย: ${b.bookerName}`} {b.bookerDept && `(${b.bookerDept})`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ─── Section 2: จองห้องอื่นๆ (Link ไป smo-room-booking) ─── */}
          <a
            href="https://smo-room-booking.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="card"
            style={{
              borderTop: '4px solid var(--blue-500, #3B82F6)',
              boxShadow: 'var(--shadow-md)',
              textDecoration: 'none',
              color: 'inherit',
              display: 'block',
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ background: 'linear-gradient(135deg, #DBEAFE, #BFDBFE)', color: '#2563EB', borderRadius: '50%', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>🌐</div>
                <div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '16px' }}>จองห้องอื่นๆ (PUFFSHI, SEEFAH, ห้องกลาง)</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-tertiary)' }}>
                    สำหรับทุกคน — นิสิต, ชมรม, และสมาชิกสโม สามารถจองผ่านระบบจองห้องทั่วไปได้เลย
                  </p>
                </div>
              </div>
              <div style={{ fontSize: '24px', color: 'var(--blue-500, #3B82F6)', flexShrink: 0 }}>→</div>
            </div>

            <div style={{
              marginTop: '12px',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              {['PUFFSHI Room', 'SEEFAH Room', 'ห้องกลาง'].map(room => (
                <span key={room} style={{
                  background: 'var(--bg-surface, #F1F5F9)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}>
                  {room}
                </span>
              ))}
            </div>
          </a>

        </div>
      )}

      {activeTab === 'docs' && (
        <div className="card">
          <div className="flex items-center justify-between mb-md">
            <h3>ค้นหาเอกสารเก่า</h3>
            <div className="search-input-wrapper w-64">
              <span className="search-icon">🔍</span>
              <input type="text" className="input" placeholder="ค้นหาชื่อเอกสาร..." />
            </div>
          </div>
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <h3>ระบบคลังเอกสารเก่า</h3>
            <p>อยู่ระหว่างการเชื่อมต่อข้อมูลกับ Cloud Storage ของปีก่อนๆ</p>
          </div>
        </div>
      )}
    </div>
  );
}
