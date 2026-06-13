import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import ActivitiesClient from './ActivitiesClient';

export const dynamic = 'force-dynamic';

export default async function ActivitiesPage() {
  const session = await getSession();

  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: 'desc' },
    include: { department: true }
  });
  
  const departments = await prisma.department.findMany();

  return <ActivitiesClient initialActivities={activities} departments={departments} session={session} />;
}
