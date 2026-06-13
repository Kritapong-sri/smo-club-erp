import { PrismaClient } from '@prisma/client';
import { 
  departments, 
  members, 
  activities, 
  activityDocuments, 
  budgetReviews, 
  announcements, 
  roomBookings 
} from '../src/data/mockData.js';

const prisma = new PrismaClient({});

async function main() {
  console.log('Start seeding...');

  // 1. Departments
  for (const dept of departments) {
    await prisma.department.upsert({
      where: { slug: dept.slug },
      update: {},
      create: {
        id: dept.id,
        name: dept.name,
        slug: dept.slug,
        description: dept.description,
        color: dept.color,
        icon: dept.icon,
      },
    });
  }
  console.log('Seeded departments.');

  // 2. Members
  for (const member of members) {
    await prisma.member.upsert({
      where: { id: member.id },
      update: {},
      create: {
        id: member.id,
        fullName: member.full_name,
        nickname: member.nickname,
        studentId: member.student_id,
        phone: member.phone,
        birthday: member.birthday ? new Date(member.birthday) : null,
        avatarUrl: member.avatar_url,
        role: member.role,
        positionTitle: member.position_title,
        year: member.year,
        departmentId: member.department_id,
      },
    });
  }
  console.log('Seeded members.');

  // 3. Activities
  for (const activity of activities) {
    await prisma.activity.upsert({
      where: { id: activity.id },
      update: {},
      create: {
        id: activity.id,
        title: activity.title,
        description: activity.description,
        startDate: activity.start_date ? new Date(activity.start_date) : null,
        endDate: activity.end_date ? new Date(activity.end_date) : null,
        budgetRequested: activity.budget_requested,
        budgetApproved: activity.budget_approved,
        status: activity.status,
        planFileUrl: activity.plan_file_url,
        createdAt: new Date(activity.created_at),
        departmentId: activity.department_id,
        createdById: activity.created_by,
      },
    });
  }
  console.log('Seeded activities.');

  // 4. ActivityDocuments
  for (const doc of activityDocuments) {
    await prisma.activityDocument.upsert({
      where: { id: doc.id },
      update: {},
      create: {
        id: doc.id,
        fileName: doc.file_name,
        fileUrl: doc.file_url,
        fileType: doc.file_type,
        uploadedAt: new Date(doc.uploaded_at),
        activityId: doc.activity_id,
        uploadedById: doc.uploaded_by,
      },
    });
  }
  console.log('Seeded activity documents.');

  // 5. BudgetReviews
  for (const review of budgetReviews) {
    await prisma.budgetReview.upsert({
      where: { id: review.id },
      update: {},
      create: {
        id: review.id,
        status: review.status,
        feedback: review.feedback,
        reviewedAt: new Date(review.reviewed_at),
        activityId: review.activity_id,
        reviewerId: review.reviewer_id,
      },
    });
  }
  console.log('Seeded budget reviews.');

  // 6. Announcements
  for (const ann of announcements) {
    await prisma.announcement.upsert({
      where: { id: ann.id },
      update: {},
      create: {
        id: ann.id,
        title: ann.title,
        content: ann.content,
        pinned: ann.pinned,
        createdAt: new Date(ann.created_at),
        authorId: ann.author_id,
      },
    });
  }
  console.log('Seeded announcements.');

  // 7. RoomBookings
  for (const booking of roomBookings) {
    await prisma.roomBooking.upsert({
      where: { id: booking.id },
      update: {},
      create: {
        id: booking.id,
        roomName: booking.room_name,
        date: booking.date,
        startTime: booking.start_time,
        endTime: booking.end_time,
        purpose: booking.purpose,
        status: booking.status,
        bookedById: booking.booked_by,
        departmentId: booking.department_id,
      },
    });
  }
  console.log('Seeded room bookings.');

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
