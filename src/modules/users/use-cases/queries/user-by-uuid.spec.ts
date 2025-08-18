import { randomUUID } from 'node:crypto';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { AppError } from '@/core/exceptions/app.error';
import { RolesService } from '@/modules/roles/services/roles.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
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

  it('should throw AppError when user is not found', async () => {
    const nonExistentUuid = 'non-existent-uuid';

    await expect(
      handler.execute(new UserByUuidQuery(nonExistentUuid))
    ).rejects.toEqual(
      new AppError({
        message: 'User not found.',
        statusCode: HttpStatusCodeEnum.NOT_FOUND,
        statusText: HttpStatusTextEnum.NOT_FOUND,
      })
    );
  });
});
