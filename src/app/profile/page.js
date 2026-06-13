import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch full user data from database
  const userProfile = await prisma.member.findUnique({
    where: { id: session.userId },
    include: { department: true }
  });

  if (!userProfile) {
    // Session is invalid
    redirect('/login');
  }

  return <ProfileClient user={userProfile} />;
}
