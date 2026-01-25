import { PrismaClient } from 'generated/prisma/client';

export const seedErrorLogs = async (prisma: PrismaClient) => {
  const logs = Array.from({ length: 15 }).map((_, i) => ({
    error: `Sample error ${i + 1}`,
    statusCode: i % 2 === 0 ? 500 : 400,
    statusText: i % 2 === 0 ? 'Internal Server Error' : 'Bad Request',
    method: 'GET',
    path: `/test/${i + 1}`,
    ip: '127.0.0.1',
    userAgent: 'PrismaSeeder',
  }));

  await prisma.errorLog.createMany({
    data: logs,
  });
};
