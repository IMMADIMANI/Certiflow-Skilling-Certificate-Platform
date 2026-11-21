import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding CertiFlow database...\n');

  // Create districts
  const northDistrict = await prisma.district.upsert({
    where: { code: 'NORTH' },
    update: {},
    create: { name: 'North District', code: 'NORTH' },
  });
  const southDistrict = await prisma.district.upsert({
    where: { code: 'SOUTH' },
    update: {},
    create: { name: 'South District', code: 'SOUTH' },
  });
  const eastDistrict = await prisma.district.upsert({
    where: { code: 'EAST' },
    update: {},
    create: { name: 'East District', code: 'EAST' },
  });

  const password = await bcrypt.hash('password123', 10);

  // Create users
  const anika = await prisma.user.upsert({
    where: { email: 'anika@certiflow.in' },
    update: {},
    create: {
      email: 'anika@certiflow.in', password, name: 'Anika Singh',
      role: 'TRAINING_CENTRE', districtId: northDistrict.id,
    },
  });
  await prisma.user.upsert({
    where: { email: 'dev@certiflow.in' },
    update: {},
    create: {
      email: 'dev@certiflow.in', password, name: 'Dev Sharma',
      role: 'DISTRICT_OFFICER', districtId: northDistrict.id,
    },
  });
  await prisma.user.upsert({
    where: { email: 'meera@certiflow.in' },
    update: {},
    create: {
      email: 'meera@certiflow.in', password, name: 'Meera Patel',
      role: 'DISTRICT_OFFICER', districtId: southDistrict.id,
    },
  });
  await prisma.user.upsert({
    where: { email: 'kabir@certiflow.in' },
    update: {},
    create: {
      email: 'kabir@certiflow.in', password, name: 'Kabir Khan',
      role: 'DISTRICT_OFFICER', districtId: eastDistrict.id,
    },
  });
  await prisma.user.upsert({
    where: { email: 'neha@certiflow.in' },
    update: {},
    create: { email: 'neha@certiflow.in', password, name: 'Neha Gupta', role: 'QUALITY_TEAM' },
  });
  await prisma.user.upsert({
    where: { email: 'farah@certiflow.in' },
    update: {},
    create: { email: 'farah@certiflow.in', password, name: 'Farah Irani', role: 'STATE_OFFICE' },
  });

  // Create training centre for Anika
  const tc = await prisma.trainingCentre.upsert({
    where: { userId: anika.id },
    update: {},
    create: {
      userId: anika.id,
      name: 'Sunrise Skill Development Centre',
      code: 'SSDC001',
      districtId: northDistrict.id,
      address: '123 Main Street, North District',
    },
  });

  // Create a sample DRAFT batch
  await prisma.batch.create({
    data: {
      trainingCentreId: tc.id,
      title: 'Web Development Batch – Nov 2024',
      description: 'Introductory web development course (HTML, CSS, JS)',
      courseType: 'Web Development',
      courseDuration: '3 months',
      status: 'DRAFT',
    },
  });

  // Create a sample SUBMITTED batch with candidates
  const submittedBatch = await prisma.batch.create({
    data: {
      trainingCentreId: tc.id,
      title: 'Digital Marketing Batch – Oct 2024',
      courseType: 'Digital Marketing',
      courseDuration: '2 months',
      status: 'SUBMITTED',
      submittedAt: new Date(),
    },
  });

  const candidates = Array.from({ length: 8 }, (_, i) => ({
    batchId: submittedBatch.id,
    name: ['Rahul Kumar', 'Priya Sharma', 'Amit Singh', 'Sunita Devi', 'Ravi Patel', 'Anjali Verma', 'Sanjay Yadav', 'Pooja Gupta'][i],
    fatherName: ['Suresh Kumar', 'Mohan Sharma', 'Ramesh Singh', 'Dharam Devi', 'Kiran Patel', 'Vijay Verma', 'Ramesh Yadav', 'Ashok Gupta'][i],
    dob: new Date(1998 + (i % 4), i % 12, 10 + i),
    phone: `987654${String(3210 + i).padStart(4, '0')}`,
    courseCompleted: 'Digital Marketing',
    completionDate: new Date(2024, 9, 15),
    marks: 70 + i * 2,
    grade: ['A', 'A', 'B', 'B', 'A', 'B', 'A', 'A'][i],
    status: 'PENDING' as const,
  }));
  await prisma.candidate.createMany({ data: candidates, skipDuplicates: true });

  console.log('✅ Database seeded successfully!\n');
  console.log('Demo Accounts:');
  console.log('  📧 anika@certiflow.in     / password123  → Training Centre');
  console.log('  📧 dev@certiflow.in       / password123  → District Officer');
  console.log('  📧 meera@certiflow.in     / password123  → District Officer');
  console.log('  📧 kabir@certiflow.in     / password123  → District Officer');
  console.log('  📧 neha@certiflow.in      / password123  → Quality Team');
  console.log('  📧 farah@certiflow.in     / password123  → State Office\n');
}

main()
  .catch((err) => { console.error('Seed error:', err); process.exit(1); })
  .finally(() => prisma.$disconnect());
