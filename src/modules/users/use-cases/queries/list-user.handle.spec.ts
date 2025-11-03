import { randomUUID } from 'node:crypto';
import { RoleEnum } from '@/core/enums/role.enum';
import { RolesService } from '@/modules/roles/services/roles.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import { ListUserDto } from '../../dtos/list-user.dto';
import { UserService } from '../../services/user.service';
import { ListUserHandle } from './list-user.handle';
import { ListUsersQuery } from './list-user.query';

describe('ListUserHandle (integration)', () => {
  let handler: ListUserHandle;
  let prisma: PrismaService;

  const mockUser = {
    uuid: randomUUID(),
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed-pass',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [ListUserHandle, UserService, RolesService, PrismaService],
    }).compile();

    handler = module.get<ListUserHandle>(ListUserHandle);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();

    const role = await prisma.roles.create({
      data: { uuid: randomUUID(), name: 'Employee', type: RoleEnum.employee },
    });

    await prisma.users.create({
      data: {
        ...mockUser,
        roleUuid: role.uuid,
      },
    });
  });

  afterEach(async () => {
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return paginated users list', async () => {
    const role = await prisma.roles.create({
      data: { uuid: randomUUID(), name: 'Admin', type: RoleEnum.admin },
    });

    const user = await prisma.users.create({
      data: {
        uuid: randomUUID(),
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'secure-pass',
        roleUuid: role.uuid,
        createdAt: new Date(),
      },
    });

    const query = new ListUsersQuery(1, 10, 'jane');

    const result = await handler.execute(query);

    expect(result).toEqual<ListUserDto>({
      data: [
        {
          uuid: user.uuid,
          name: user.name,
          email: user.email,
          password: user.password,
          role: role.name,
          roleUuid: role.uuid,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: user.deletedAt,
        },
      ],
      actualPage: 1,
      totalPages: 1,
      total: 1,
    });
  });

  it('should return empty data when no users found', async () => {
    await prisma.users.deleteMany();

    const query = new ListUsersQuery(1, 10);

    const result = await handler.execute(query);

    expect(result).toEqual<ListUserDto>({
      data: [],
      actualPage: 1,
      totalPages: 1,
      total: 0,
    });
  });
});
