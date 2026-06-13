import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: ดึงรายการจองทั้งหมด
export async function GET() {
  try {
    const bookings = await prisma.roomBooking.findMany({
      orderBy: [
        { date: 'asc' },
        { startTime: 'asc' }
      ],
      include: {
        bookedBy: true,
        department: true,
      }
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Failed to fetch room bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch room bookings' }, { status: 500 });
  }
}

// POST: สร้างการจองใหม่ + เช็คเวลาทับซ้อน
export async function POST(request) {
  try {
    const data = await request.json();

    // STEP 1: Validation
    if (!data.roomName || !data.date || !data.startTime || !data.endTime || !data.purpose) {
      return NextResponse.json(
        { error: 'กรุณากรอกข้อมูลให้ครบทุกช่อง' },
        { status: 400 }
      );
    }

    // STEP 2: เช็คเวลาทับซ้อน
    const existingBookings = await prisma.roomBooking.findMany({
      where: {
        AND: [
          { roomName: data.roomName },
          { date: data.date },
          { startTime: { lt: data.endTime } },
          { endTime: { gt: data.startTime } },
        ]
      }
    });

    if (existingBookings.length > 0) {
      const c = existingBookings[0];
      return NextResponse.json(
        { error: 'ห้อง ' + data.roomName + ' วันที่ ' + data.date + ' ถูกจองไปแล้ว ช่วง ' + c.startTime + '-' + c.endTime + ' (' + c.purpose + ')' },
        { status: 409 }
      );
    }

    // STEP 3: บันทึกลง Database
    const booking = await prisma.roomBooking.create({
      data: {
        roomName: data.roomName,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        purpose: data.purpose,
        bookerName: data.bookerName || null,
        bookerDept: data.bookerDept || null,
        status: 'pending',
      }
    });

    return NextResponse.json(booking, { status: 201 });

  } catch (error) {
    console.error('Room booking error:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในระบบ: ' + error.message },
      { status: 500 }
    );
  }
}
