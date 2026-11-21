import prisma from './src/config/database';

async function listBatches() {
  const batches = await prisma.batch.findMany({
    select: { id: true, title: true, status: true, submittedAt: true, _count: { select: { candidates: true } } },
  });
  console.log('BATCHES IN DB:', JSON.stringify(batches, null, 2));
}

listBatches()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
