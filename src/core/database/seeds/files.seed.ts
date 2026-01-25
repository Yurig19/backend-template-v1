import { PrismaClient } from 'generated/prisma/client';

export const seedFiles = async (prisma: PrismaClient) => {
  const users = await prisma.user.findMany({ take: 15 });

  const files = users.map((user, index) => ({
    filename: `file_${index + 1}.png`,
    mimetype: 'image/png',
    size: 1024 * (index + 1),
    storage: 'local',
    isPrivate: index % 2 === 0,
    userUuid: user.uuid,
  }));

  await prisma.file.createMany({
    data: files,
  });
};
