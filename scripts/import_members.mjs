import fs from 'fs';
import { parse } from 'csv-parse/sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function parseDate(dateStr) {
  if (!dateStr || dateStr === '-') return null;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  }
  return null;
}

function cleanString(str) {
  if (!str) return null;
  const trimmed = str.trim();
  if (trimmed === '-' || trimmed === '') return null;
  return trimmed;
}

// Helper to assign a default icon/color to new departments
function getDeptStyle(name) {
  if (name.includes('นายก') || name.includes('อุปนายก')) return { icon: '👑', color: '#8B5CF6' };
  if (name.includes('เลขานุการ')) return { icon: '📝', color: '#10B981' };
  if (name.includes('เหรัญญิก')) return { icon: '💰', color: '#F59E0B' };
  if (name.includes('นิสิตสัมพันธ์')) return { icon: '🤝', color: '#3B82F6' };
  if (name.includes('เชียร์')) return { icon: '📣', color: '#EC4899' };
  if (name.includes('วิชาการ')) return { icon: '📚', color: '#6366F1' };
  if (name.includes('ศิลปะ')) return { icon: '🎨', color: '#14B8A6' };
  if (name.includes('กีฬา')) return { icon: '⚽', color: '#EF4444' };
  if (name.includes('สวัสดิการ')) return { icon: '🏥', color: '#F43F5E' };
  return { icon: '📌', color: '#64748B' };
}

async function main() {
  console.log('Starting member and department import...');
  
  const fileContent = fs.readFileSync('smo_data.csv', 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
  
  console.log(`Found ${records.length} records in CSV.`);

  console.log('Clearing old data...');
  await prisma.activityDocument.deleteMany({});
  await prisma.budgetReview.deleteMany({});
  await prisma.roomBooking.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.activity.deleteMany({});
  await prisma.member.deleteMany({});
  await prisma.department.deleteMany({});

  console.log('Inserting new departments and members...');
  let count = 0;
  
  let currentDeptName = null;
  let currentDeptId = null;
  const deptMap = {}; // name -> id

  for (const record of records) {
    const keys = Object.keys(record);
    const getVal = (search) => {
      const key = keys.find(k => k.includes(search));
      return key ? cleanString(record[key]) : null;
    };

    const studentId = getVal('รหัสนิสิต');
    if (!studentId) continue; // Skip invalid rows

    // Determine department from ตำแหน่ง
    let position = getVal('ตำแหน่ง');
    
    // Fix names based on user request
    if (position === 'อุปนายกฝ่ายกิจการภายนอก') position = 'อุปนายกฝ่ายนอก';
    if (position === 'อุปนายกฝ่ายกิจการภายใน') position = 'อุปนายกฝ่ายใน';

    // If there is a position listed, it becomes the new current department
    if (position) {
      // Check if it's OD which might be split with newline in CSV
      if (position.includes('ผู้ช่วยนายก')) {
         position = 'ผู้ช่วยนายกสโมสรนิสิต';
      }
      currentDeptName = position;
    }

    if (currentDeptName) {
      if (!deptMap[currentDeptName]) {
        // Create new department in DB
        const style = getDeptStyle(currentDeptName);
        const deptCount = Object.keys(deptMap).length + 1;
        const newDept = await prisma.department.create({
          data: {
            name: currentDeptName,
            slug: `dept-${deptCount}`,
            color: style.color,
            icon: style.icon,
          }
        });
        deptMap[currentDeptName] = newDept.id;
      }
      currentDeptId = deptMap[currentDeptName];
    }

    const yearStr = getVal('ชั้นปี');
    const year = yearStr ? parseInt(yearStr, 10) : null;

    try {
      await prisma.member.create({
        data: {
          positionTitle: position || currentDeptName, // Assign the explicit position or fallback to the department name as position
          departmentId: currentDeptId,
          nickname: getVal('ชื่อเล่น'),
          studentId: studentId,
          prefix: getVal('คำนำหน้าชื่อ'),
          firstNameTh: getVal('ชื่อจริง'),
          lastNameTh: getVal('นามสกุล'),
          firstNameEn: getVal('Firstname'),
          lastNameEn: getVal('Surname'),
          phone: getVal('เบอร์โทรศัพท์'),
          year: isNaN(year) ? null : year,
          major: getVal('หลักสูตร'),
          group: getVal('กรุ๊ป') && !getVal('กรุ๊ป').includes('เลือด') ? getVal('กรุ๊ป') : null,
          nationalId: getVal('เลขประจำตัวประชาชน'),
          bloodGroup: getVal('กรุ๊ปเลือด'),
          allergies: getVal('สิ่งที่แพ้'),
          medicalCondition: getVal('โรคประจำตัว'),
          religion: getVal('ศาสนา'),
          birthday: parseDate(getVal('วันเกิด')),
          address: getVal('ที่อยู่ปัจจุบัน'),
          email: getVal('อีเมล'),
          lineId: getVal('Line ID'),
          instagram: getVal('Instagram'),
          shirtSize: getVal('รอบอกเสื้อ'),
          mbti: getVal('MBTI'),
          eColor: getVal('E-Color'),
          password: studentId, // รหัสผ่านเริ่มต้น = รหัสนิสิต
          role: 'member',
        }
      });
      count++;
    } catch (err) {
      console.error(`Failed to insert student ${studentId}:`, err.message);
    }
  }

  console.log(`Successfully inserted ${count} members across ${Object.keys(deptMap).length} departments.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
