import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import MembersClient from './MembersClient';

export const dynamic = 'force-dynamic';

export default async function MembersPage() {
  const session = await getSession();

  const membersWithPasswords = await prisma.member.findMany({
    orderBy: { firstNameTh: 'asc' },
    include: { department: true }
  });
  const members = membersWithPasswords.map(({ password: _password, ...member }) => member);
  
  const departments = await prisma.department.findMany();

  return <MembersClient initialMembers={members} departments={departments} session={session} />;
}
