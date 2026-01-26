import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';
import { createRole } from '@/test/e2e/factories/role';
import { resetDatabase } from '@/test/e2e/setup/database';
import { createE2EApp } from '@/test/e2e/setup/e2e.app';
import { setupTestEnv } from '@/test/e2e/setup/e2e.setup';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  const userRegister = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: RoleEnum.admin,
  };

  beforeAll(async () => {
    setupTestEnv();
    app = await createE2EApp();

    await resetDatabase();
    await createRole(RoleEnum.admin);
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
    await app.close();
  });

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
});
