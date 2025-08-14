import { RoleEnum } from '@/core/enums/role.enum';
import { UserService } from '@/modules/users/services/user.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import * as request from 'supertest';
import { AuditsController } from '../controllers/audits.controller';
import { ListAuditsQuery } from '../use-cases/queries/list-audits-query';

describe('AuditsController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let queryBus: QueryBus;
  let testUserUuid: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [AuditsController],
      providers: [PrismaService, UserService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);
    queryBus = module.get<QueryBus>(QueryBus);

    await prisma.audits.deleteMany();
    const user = await prisma.users.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'testpassword',
        roleUuid: RoleEnum.employee,
      },
    });
    testUserUuid = user.uuid;

    await prisma.audits.createMany({
      data: [
        {
          entity: 'User',
          method: 'CREATE',
          userUuid: testUserUuid,
          oldData: null,
          newData: { name: 'Test User' },
          url: '/users',
          ip: '127.0.0.1',
          userAgent: 'jest-test',
        },
        {
          entity: 'User',
          method: 'UPDATE',
          userUuid: testUserUuid,
          oldData: { name: 'Test User' },
          newData: { name: 'Updated User' },
          url: '/users',
          ip: '127.0.0.1',
          userAgent: 'jest-test',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.audits.deleteMany();
    await prisma.users.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  it('should list audits with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/audits/list')
      .query({ page: 1, dataPerPage: 10 })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty('entity', 'User');
    expect(response.body.data[0]).toHaveProperty('method');
  });

  it('should filter audits by search term', async () => {
    const response = await request(app.getHttpServer())
      .get('/audits/list')
      .query({ page: 1, dataPerPage: 10, search: 'UPDATE' })
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].method).toBe('UPDATE');
  });
});
