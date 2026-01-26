import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';
import { generateHashPassword } from '@/core/security/helpers/password.helper';

export const createUser = async (
  role: RoleEnum,
  overrides: Partial<{
    name: string;
    email: string;
    password: string;
  }> = {}
) => {
  const password = overrides.password ?? 'Test@123456';

  return prisma.user.create({
    data: {
      name: overrides.name ?? 'Test User',
      email: overrides.email ?? `user_${Date.now()}@test.com`,
      password: await generateHashPassword(password),
      roles: {
        create: {
          name: role,
          type: role,
        },
      },
    },
  });
};
