import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { PrismaClient } from 'generated/prisma/client';

export const seedErrorLogs = async (prisma: PrismaClient) => {
  const logs = Array.from({ length: 15 }).map((_, i) => ({
    error: `Sample error ${i + 1}`,
    statusCode:
      i % 2 === 0
        ? HttpStatusCodeEnum.INTERNAL_SERVER_ERROR
        : HttpStatusCodeEnum.BAD_REQUEST,
    statusText:
      i % 2 === 0
        ? HttpStatusTextEnum.INTERNAL_SERVER_ERROR
        : HttpStatusTextEnum.BAD_REQUEST,
    method: 'GET',
    path: `/test/${i + 1}`,
    ip: '127.0.0.1',
    userAgent: 'PrismaSeeder',
  }));

  await prisma.errorLog.createMany({
    data: logs,
  });
};
