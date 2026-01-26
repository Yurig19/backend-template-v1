import * as path from 'path';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';
import { createRole } from '@/test/e2e/factories/role';
import { createUser } from '@/test/e2e/factories/user';
import { loginAndGetToken } from '@/test/e2e/setup/auth';
import { resetDatabase } from '@/test/e2e/setup/database';
import { createE2EApp } from '@/test/e2e/setup/e2e.app';
import { setupTestEnv } from '@/test/e2e/setup/e2e.setup';

describe('FilesController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    setupTestEnv();
    app = await createE2EApp();

    await resetDatabase();
    await createRole(RoleEnum.employee);

    const user = await createUser(RoleEnum.employee, {
      email: 'fileuser@test.com',
      password: 'Test@123456',
    });

    accessToken = await loginAndGetToken(app, user.email, 'Test@123456');
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
    await app.close();
  });

  it('POST /files/create → should create a file', async () => {
    const filePath = path.join(__dirname, 'mock.txt');

    const res = await request(app.getHttpServer())
      .post('/files/create?isPrivate=false')
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('file', filePath)
      .expect(201);

    expect(res.body).toHaveProperty('uuid');
    expect(res.body.filename).toBe('mock.txt');

    const dbFile = await prisma.file.findUnique({
      where: { uuid: res.body.uuid },
    });

    expect(dbFile).not.toBeNull();
    expect(dbFile?.filename).toBe('mock.txt');
    expect(dbFile?.path).toBeDefined();
  });

  it('POST /files/create → should return error if file is missing', async () => {
    await request(app.getHttpServer())
      .post('/files/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });
});
