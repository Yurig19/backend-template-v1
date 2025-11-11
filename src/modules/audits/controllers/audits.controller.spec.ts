import { PrismaService } from '@/core/database/prisma.service';
import { RoleEnum } from '@/core/enums/role.enum';
import { generateHashPassword } from '@/core/utils/generatePassword';
import { AuthModule } from '@/modules/_auth/auth.module';
import { RolesModule } from '@/modules/roles/roles.module';
import { UserModule } from '@/modules/users/users.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AuditsModule } from '../audits.module';

describe('AuditsController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserUuid: string;
  let accessToken: string;

  const userPassword = process.env.ADMIN_PASSWORD;
  const userPasswordHashed = generateHashPassword(userPassword);

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, UserModule, RolesModule, AuthModule, AuditsModule],
      providers: [PrismaService],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);

    await prisma.audit.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    const role = await prisma.role.create({
      data: {
        name: 'employee',
        type: RoleEnum.employee,
      },
    });

    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: userPasswordHashed,
        roleUuid: role.uuid,
      },
    });
    testUserUuid = user.uuid;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: userPassword })
      .expect(201);

    accessToken = loginResponse.body.accessToken;

    await prisma.audit.createMany({
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
    await prisma.audit.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  it('should list audits with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/audits/list')
      .set('Authorization', `Bearer ${accessToken}`)
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
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1, dataPerPage: 10, search: 'UPDATE' })
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].method).toBe('UPDATE');
  });
});
