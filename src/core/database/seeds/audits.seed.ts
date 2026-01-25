import { PrismaClient } from 'generated/prisma/client';

export const seedAudits = async (prisma: PrismaClient) => {
  const users = await prisma.user.findMany({ take: 15 });

  const audits = users.map((user, index) => ({
    entity: 'User',
    method: index % 2 === 0 ? 'UPDATE' : 'CREATE',
    userUuid: user.uuid,
    oldData: { name: `Old User ${index}` },
    newData: { name: `New User ${index}` },
    url: `/users/${user.uuid}`,
    ip: '127.0.0.1',
    userAgent: 'PrismaSeeder',
  }));

  await prisma.audit.createMany({
    data: audits,
  });
};
