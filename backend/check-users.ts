import prisma from './src/config/database';
import bcrypt from 'bcryptjs';

async function check() {
  const users = await prisma.user.findMany();
  console.log('TOTAL USERS IN DATABASE:', users.length);
  for (const u of users) {
    const isMatch = await bcrypt.compare('password123', u.password);
    console.log(`- ${u.email} | ${u.role} | password123 valid? ${isMatch}`);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
