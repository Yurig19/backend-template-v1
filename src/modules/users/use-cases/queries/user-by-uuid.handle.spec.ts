import { randomUUID } from 'node:crypto';
import { PrismaService } from '@/core/database/prisma.service';
import { RoleEnum } from '@/core/enums/role.enum';
import { RolesService } from '@/modules/roles/services/roles.service';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../services/user.service';
import { UserByUuidHandle } from './user-by-uuid.handle';
import { UserByUuidQuery } from './user-by-uuid.query';

describe('UserByUuidHandle (integration)', () => {
  let handler: UserByUuidHandle;
  let prisma: PrismaService;
  let roleUuid: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, UserService, RolesService, UserByUuidHandle],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    handler = module.get<UserByUuidHandle>(UserByUuidHandle);

    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();

    roleUuid = randomUUID();
    await prisma.roles.create({
      data: {
        uuid: roleUuid,
        type: RoleEnum.manager,
        name: 'manager',
        createdAt: new Date(),
      },
    });
  });

  afterAll(async () => {
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    await prisma.$disconnect();
  });

  it('should return user data when found', async () => {
    const createdUser = await prisma.users.create({
      data: {
        uuid: randomUUID(),
        name: 'Jane Doe',
        email: `jane-${Date.now()}@example.com`,
        password: 'hashedpassword',
        roleUuid,
        createdAt: new Date(),
      },
    });

    const query = new UserByUuidQuery(createdUser.uuid);
    const result = await handler.execute(query);

    expect(result).toMatchObject({
      uuid: createdUser.uuid,
      name: createdUser.name,
      email: createdUser.email,
      role: 'manager',
      password: createdUser.password,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
      deletedAt: createdUser.deletedAt,
    });
  });

  it('should throw NotFoundException when user is not found', async () => {
    const nonExistentUuid = 'non-existent-uuid';

    await expect(
      handler.execute(new UserByUuidQuery(nonExistentUuid))
    ).rejects.toThrow(NotFoundException);

    await expect(
      handler.execute(new UserByUuidQuery(nonExistentUuid))
    ).rejects.toThrow('User not found.');
  });
});
