import { prisma } from '@/core/lib/prisma';
import { Logger } from '@nestjs/common';
import { seedAudits } from './audits.seed';
import { seedErrorLogs } from './errorLogs.seed';
import { seedUsers } from './users.seed';

const logger = new Logger('PrismaSeed');

type SeedTask = {
  name: string;
  run: () => Promise<void>;
};

const runSeed = async ({ name, run }: SeedTask) => {
  logger.log(`▶️ Starting seed: ${name}`);
  const start = Date.now();

  try {
    await run();
    const duration = Date.now() - start;
    logger.log(`✅ Seed completed: ${name} (${duration}ms)`);
  } catch (error) {
    const duration = Date.now() - start;

    logger.error(
      `❌ Seed failed: ${name} (${duration}ms)`,
      error instanceof Error ? error.stack : undefined
    );

    throw error;
  }
};

const main = async () => {
  logger.log('🌱 Database seeding started');

  const seeds: SeedTask[] = [
    {
      name: 'Users',
      run: () => seedUsers(prisma),
    },
    {
      name: 'Audits',
      run: () => seedAudits(prisma),
    },
    {
      name: 'ErrorLogs',
      run: () => seedErrorLogs(prisma),
    },
  ];

  for (const seed of seeds) {
    await runSeed(seed);
  }

  logger.log('🎉 Database seeding finished successfully');
};

main()
  .catch(() => {
    logger.error('🚨 Seeding process aborted');
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    logger.log('🔌 Prisma disconnected');
  });
