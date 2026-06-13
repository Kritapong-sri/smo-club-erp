import { prisma } from '@/lib/prisma';
import SmoHelperClient from './SmoHelperClient';

export const dynamic = 'force-dynamic';

export default async function SmoHelperPage() {
  const roomBookings = await prisma.roomBooking.findMany({
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    include: {
      bookedBy: true,
      department: true
    }
  });

  return <SmoHelperClient initialBookings={roomBookings} />;
}
