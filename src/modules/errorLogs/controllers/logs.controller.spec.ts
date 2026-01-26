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

describe('LogsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    setupTestEnv();
    app = await createE2EApp();

    await resetDatabase();
    await createRole(RoleEnum.employee);

    const user = await createUser(RoleEnum.employee, {
      email: 'loguser@test.com',
      password: 'Test@123456',
    });

    accessToken = await loginAndGetToken(app, user.email, 'Test@123456');

    await prisma.errorLog.createMany({
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
    await resetDatabase();
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

    const log = response.body.data[0];

    expect(log).toHaveProperty('error');
    expect(log).toHaveProperty('statusCode');
    expect(log).toHaveProperty('method');
    expect(log).toHaveProperty('path');
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
