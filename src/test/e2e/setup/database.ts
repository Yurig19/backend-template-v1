import { prisma } from '@/core/lib/prisma';

export const resetDatabase = async () => {
  await prisma.$transaction([
    prisma.audit.deleteMany(),
    prisma.user.deleteMany(),
    prisma.role.deleteMany(),
  ]);
};
