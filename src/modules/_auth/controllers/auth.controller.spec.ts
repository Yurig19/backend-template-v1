import { AppModule } from '@/app.module';
import { PrismaService } from '@/core/database/prisma.service';
import { RoleEnum } from '@/core/enums/role.enum';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);

    await prisma.role.create({
      data: {
        name: 'admin',
        type: 'ADMIN',
      },
    });

    await app.init();
  });

  const userRegister = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: RoleEnum.admin,
  };

  let accessToken: string;

  it('/auth/register (POST) → should register user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(userRegister)
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(userRegister.email);

    accessToken = response.body.accessToken;
  });

  it('/auth/login (POST) → should login user', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: userRegister.email,
        password: userRegister.password,
      })
      .expect(201);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body.user.email).toBe(userRegister.email);

    accessToken = response.body.accessToken;
  });

  it('/auth/verify-token (GET) → should return current user', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/verify-token')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body.email).toBe(userRegister.email);
  });

  afterAll(async () => {
    await prisma.audit.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });
});
