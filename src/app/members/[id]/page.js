import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { notFound } from 'next/navigation';
import MemberProfileClient from './MemberProfileClient';

export const dynamic = 'force-dynamic';

export default async function MemberProfilePage({ params }) {
  const session = await getSession();
  
  if (!session) {
    // If not logged in, redirect to login (or you can show access denied)
    // For now, we'll let the client handle it or just render
  }

  const { id } = await params;

  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      department: true,
      activitiesCreated: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!member) {
    notFound();
  }

  return <MemberProfileClient member={member} session={session} />;
}
