import Link from 'next/link';
import ActivityCarousel from '@/components/ActivityCarousel';
import CalendarWidget from '@/components/CalendarWidget';
import AnnouncementBoard from '@/components/AnnouncementBoard';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { FileText, ArrowRight, ClipboardPenLine, Hourglass, BadgeCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
    include: { department: true }
  });

  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { author: true }
  });

  const recentActivities = activities.slice(0, 4);

  const calendarEvents = activities.map(a => ({
    id: a.id,
    date: a.startDate ? new Date(a.startDate).toISOString().split('T')[0] : '',
    title: a.title,
    subtitle: `สถานะ: ${a.status === 'approved' || a.status === 'completed' ? 'อนุมัติแล้ว' : 'รอตรวจสอบ'}`,
    color: a.status === 'approved' || a.status === 'completed' ? 'var(--color-success)' : 'var(--color-warning)'
  }));

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header mb-lg">
        <h1>Dashboard</h1>
        <p>ภาพรวมสโมสรประจำปีการศึกษา 2569</p>
      </div>

      <div className="overview-grid mb-lg stagger-children">
        <div className="overview-card warning">
          <div className="overview-icon"><ClipboardPenLine size={20} strokeWidth={1.8} /></div>
          <div>
            <div className="stat-label">กำลังดำเนินการ</div>
            <div className="stat-value">{activities.filter(a => a.status === 'draft' || a.status === 'revision').length}</div>
            <div className="stat-helper">ฉบับร่างและรายการที่ต้องแก้ไข</div>
          </div>
        </div>

        <div className="overview-card info">
          <div className="overview-icon"><Hourglass size={20} strokeWidth={1.8} /></div>
          <div>
            <div className="stat-label">รอตรวจ</div>
            <div className="stat-value">{activities.filter(a => a.status === 'pending_review').length}</div>
            <div className="stat-helper">รายการที่อยู่ระหว่างการพิจารณา</div>
          </div>
        </div>

        <div className="overview-card success">
          <div className="overview-icon"><BadgeCheck size={20} strokeWidth={1.8} /></div>
          <div>
            <div className="stat-label">อนุมัติแล้ว</div>
            <div className="stat-value">{activities.filter(a => a.status === 'approved' || a.status === 'completed').length}</div>
            <div className="stat-helper">กิจกรรมที่อนุมัติหรือเสร็จสิ้นแล้ว</div>
          </div>
        </div>
      </div>

      <section className="card section-card mb-lg">
        <div className="section-header mb-md">
          <div className="flex items-center gap-sm">
            <FileText size={20} style={{ color: 'var(--blue-600)' }} strokeWidth={1.8} />
            <h3 style={{ margin: 0, fontSize: '18px' }}>กิจกรรมล่าสุด</h3>
          </div>
          <Link href="/activities" className="btn btn-ghost btn-sm flex items-center gap-xs" style={{ color: 'var(--blue-600)' }}>
            ดูทั้งหมด <ArrowRight size={14} strokeWidth={1.8} />
          </Link>
        </div>

        <ActivityCarousel activities={recentActivities} />
      </section>

      <div className="grid-2">
        <AnnouncementBoard initialAnnouncements={announcements} session={session} />

        <div className="card section-card">
          <h3 className="mb-md">ปฏิทินกิจกรรม</h3>
          <CalendarWidget events={calendarEvents} />
        </div>
      </div>
    </div>
  );
}
