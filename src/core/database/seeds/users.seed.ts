import { generateHashPassword } from '@/core/security/helpers/password.helper';
import { PrismaClient } from 'generated/prisma/client';

export const seedUsers = async (prisma: PrismaClient) => {
  const roles = await prisma.role.findMany({
    where: {
      NOT: {
        OR: [
          { type: 'ADMIN' },
          { name: { contains: 'admin', mode: 'insensitive' } },
        ],
      },
    },
  });

  if (roles.length === 0) {
    throw new Error('No non-admin roles found. Please seed roles first.');
  }

  const users = [];

  for (let i = 1; i <= 15; i++) {
    const role = roles[i % roles.length];

    users.push({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      password: await generateHashPassword('SuperSecretPassword@123'),
      roleUuid: role.uuid,
    });
  }

  await prisma.user.createMany({
    data: users,
    skipDuplicates: true,
  });
};
