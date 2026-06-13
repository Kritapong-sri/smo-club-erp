import StatCard from '@/components/StatCard';
import ActivityCarousel from '@/components/ActivityCarousel';
import CalendarWidget from '@/components/CalendarWidget';
import AnnouncementBoard from '@/components/AnnouncementBoard';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = await getSession();
  const userRole = session ? session.positionTitle : null;

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
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>ภาพรวมสโมสรประจำปีการศึกษา 2569</p>
      </div>

      <div className="grid-3 mb-lg stagger-children">
        <div className="card">
          <div className="stat-label text-sm font-semibold text-tertiary mb-xs">กำลังดำเนินการ</div>
          <div className="stat-value" style={{ color: 'var(--color-warning)' }}>
            {activities.filter(a => a.status === 'draft' || a.status === 'revision').length}
          </div>
        </div>

        <div className="card">
          <div className="stat-label text-sm font-semibold text-tertiary mb-xs">รอตรวจ</div>
          <div className="stat-value" style={{ color: 'var(--color-info)' }}>
            {activities.filter(a => a.status === 'pending_review').length}
          </div>
        </div>

        <div className="card">
          <div className="stat-label text-sm font-semibold text-tertiary mb-xs">อนุมัติแล้ว</div>
          <div className="stat-value" style={{ color: 'var(--color-success)' }}>
            {activities.filter(a => a.status === 'approved' || a.status === 'completed').length}
          </div>
        </div>
      </div>

      <div className="card mb-lg" style={{ padding: '24px' }}>
        <div className="flex items-center justify-between mb-md">
          <div className="flex items-center gap-sm">
            <span style={{ color: 'var(--blue-600)', fontSize: '20px' }}>📄</span>
            <h3 style={{ margin: 0, fontSize: '18px' }}>กิจกรรมล่าสุด</h3>
          </div>
          <a href="/activities" className="btn btn-ghost btn-sm" style={{ color: 'var(--blue-600)' }}>ดูทั้งหมด →</a>
        </div>

        <ActivityCarousel activities={activities.slice(0, 8)} />
      </div>

      <div className="grid-2">
        {/* ใช้ Component AnnouncementBoard แทนโค้ดเดิม */}
        <AnnouncementBoard initialAnnouncements={announcements} session={session} />

        <div className="card">
          <h3 className="mb-md">ปฏิทินกิจกรรม</h3>
          <CalendarWidget events={calendarEvents} />
        </div>
      </div>
    </div>
  );
}
