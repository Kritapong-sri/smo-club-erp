import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const member = await prisma.member.findUnique({ where: { studentId: "6641005026" } });
console.log(member);
