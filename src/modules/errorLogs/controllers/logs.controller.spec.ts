import { RoleEnum } from '@/core/enums/role.enum';
import { generateHashPassword } from '@/core/utils/generatePassword';
import { AuthModule } from '@/modules/_auth/auth.module';
import { RolesModule } from '@/modules/roles/roles.module';
import { UserModule } from '@/modules/users/users.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import * as request from 'supertest';
import { LogsModule } from '../logs.module';

describe('LogsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let accessToken: string;

  const plainPassword = process.env.ADMIN_PASSWORD;
  const hashedPassword = generateHashPassword(plainPassword);

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, UserModule, RolesModule, AuthModule, LogsModule],
      providers: [PrismaService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);

    await prisma.logs.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();

    const role = await prisma.roles.create({
      data: { name: 'employee', type: RoleEnum.employee },
    });

    const user = await prisma.users.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: hashedPassword,
        roleUuid: role.uuid,
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: plainPassword })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    await prisma.logs.createMany({
      data: [
        {
          error: 'Failed to create user',
          statusCode: 500,
          statusText: 'INTERNAL_SERVER_ERROR',
          method: 'POST',
          path: '/users',
          ip: '127.0.0.1',
          userAgent: 'jest-test',
        },
        {
          error: 'Unauthorized access',
          statusCode: 401,
          statusText: 'UNAUTHORIZED',
          method: 'GET',
          path: '/orders',
          ip: '127.0.0.1',
          userAgent: 'jest-test',
        },
      ],
    });
  });

  afterAll(async () => {
    await prisma.logs.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  it('should list logs with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/logs/list')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1, dataPerPage: 10 })
      .expect(200);

    expect(response.body).toBeDefined();
    expect(response.body.data).toHaveLength(2);

    expect(response.body.data[0]).toHaveProperty('error');
    expect(response.body.data[0]).toHaveProperty('statusCode');
    expect(response.body.data[0]).toHaveProperty('method');
    expect(response.body.data[0]).toHaveProperty('path');
  });

  it('should filter logs by search term', async () => {
    const response = await request(app.getHttpServer())
      .get('/logs/list')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1, dataPerPage: 10, search: 'Unauthorized' })
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].statusCode).toBe(401);
    expect(response.body.data[0].error).toContain('Unauthorized');
  });
});
