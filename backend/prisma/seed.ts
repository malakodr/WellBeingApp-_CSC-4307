import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...\n');

  // Create users
  console.log('Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const student = await prisma.user.upsert({
    where: { email: 'student@aui.ma' },
    update: {},
    create: {
      email: 'student@aui.ma',
      password: hashedPassword,
      name: 'Mohamed Tantaoui',
      displayName: 'Mohamed',
      role: 'student',
      ageBracket: 'ADULT',
      consentMinorOk: true,
    },
  });

  const counselor = await prisma.user.upsert({
    where: { email: 'counselor@aui.ma' },
    update: {},
    create: {
      email: 'counselor@aui.ma',
      password: hashedPassword,
      name: 'Dr. Sarah Johnson',
      displayName: 'Dr. Sarah',
      role: 'counselor',
      ageBracket: 'ADULT',
      consentMinorOk: true,
    },
  });

  const moderator = await prisma.user.upsert({
    where: { email: 'moderator@aui.ma' },
    update: {},
    create: {
      email: 'moderator@aui.ma',
      password: hashedPassword,
      name: 'Alex Martinez',
      displayName: 'Alex',
      role: 'moderator',
      ageBracket: 'ADULT',
      consentMinorOk: true,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aui.ma' },
    update: {},
    create: {
      email: 'admin@aui.ma',
      password: hashedPassword,
      name: 'Admin User',
      displayName: 'System Admin',
      role: 'admin',
      ageBracket: 'ADULT',
      consentMinorOk: true,
    },
  });

  console.log('✅ Users created\n');

  // Create peer rooms
  console.log('Creating peer rooms...');
  const anxietyRoom = await prisma.peerRoom.create({
    data: {
      slug: 'anxiety-support',
      title: 'Anxiety Support',
      topic: 'Anxiety & Stress Management',
      isMinorSafe: true,
    },
  });

  const studyRoom = await prisma.peerRoom.create({
    data: {
      slug: 'academic-stress',
      title: 'Academic Stress',
      topic: 'Study & Exam Pressure',
      isMinorSafe: true,
    },
  });

  const socialRoom = await prisma.peerRoom.create({
    data: {
      slug: 'freshman-chat',
      title: 'Freshman Chat',
      topic: 'New Student Connection',
      isMinorSafe: true,
    },
  });

  const generalRoom = await prisma.peerRoom.create({
    data: {
      slug: 'general-wellness',
      title: 'General Wellness',
      topic: 'Mental Health & Wellbeing',
      isMinorSafe: false,
    },
  });

  console.log('✅ Peer rooms created\n');

  // Create sample triage forms
  console.log('Creating sample triage forms...');
  await prisma.triageForm.createMany({
    data: [
      {
        userId: student.id,
        topic: 'Anxiety',
        moodScore: 6,
        urgency: 'medium',
        message: 'Feeling anxious about upcoming exams',
        riskFlag: false,
        route: 'PEER',
      },
      {
        userId: student.id,
        topic: 'Stress',
        moodScore: 4,
        urgency: 'high',
        message: 'Struggling to manage coursework and personal life',
        riskFlag: false,
        route: 'BOOK',
      },
    ],
  });

  console.log('✅ Triage forms created\n');

  // Create sample booking
  console.log('Creating sample booking...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);
  
  const bookingEnd = new Date(tomorrow);
  bookingEnd.setHours(15, 0, 0, 0);

  await prisma.booking.create({
    data: {
      studentId: student.id,
      counselorId: counselor.id,
      startAt: tomorrow,
      endAt: bookingEnd,
      status: 'CONFIRMED',
      notes: 'Initial consultation',
    },
  });

  console.log('✅ Booking created\n');

  // Create sample peer messages
  console.log('Creating sample peer messages...');
  await prisma.peerMessage.createMany({
    data: [
      {
        roomId: anxietyRoom.id,
        authorId: student.id,
        body: 'Hey everyone! Anyone else dealing with test anxiety?',
        flagged: false,
      },
      {
        roomId: studyRoom.id,
        authorId: student.id,
        body: 'Tips for staying focused while studying?',
        flagged: false,
      },
    ],
  });

  console.log('✅ Peer messages created\n');

  console.log('✨ Seeding completed!\n');
  console.log('📧 Test accounts:');
  console.log('   Student: student@aui.ma / password123');
  console.log('   Counselor: counselor@aui.ma / password123');
  console.log('   Moderator: moderator@aui.ma / password123');
  console.log('   Admin: admin@aui.ma / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
