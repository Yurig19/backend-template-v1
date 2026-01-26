import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';

export const createRole = async (type: RoleEnum) => {
  return prisma.role.create({
    data: {
      name: type,
      type,
    },
  });
};
