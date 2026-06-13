import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import ActivityDetailClient from './ActivityDetailClient';

export const dynamic = 'force-dynamic';

export default async function ActivityDetailPage({ params }) {
  const { id } = await params;
  
  const session = await getSession();
  
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: {
      department: true,
      createdBy: true,
      documents: {
        include: { uploadedBy: true },
        orderBy: { uploadedAt: 'desc' }
      },
      budgetReviews: {
        include: { reviewer: true },
        orderBy: { reviewedAt: 'desc' }
      }
    }
  });
  
  if (!activity) {
    return <div className="page-container"><div className="empty-state">ไม่พบกิจกรรม</div></div>;
  }
  
  return (
    <ActivityDetailClient 
      initialActivity={activity} 
      session={session} 
    />
  );
}
