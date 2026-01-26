import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';
import { createRole } from '@/test/e2e/factories/role';
import { createUser } from '@/test/e2e/factories/user';
import { loginAndGetToken } from '@/test/e2e/setup/auth';
import { resetDatabase } from '@/test/e2e/setup/database';
import { createE2EApp } from '@/test/e2e/setup/e2e.app';
import { setupTestEnv } from '@/test/e2e/setup/e2e.setup';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

describe('AuditsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let testUserUuid: string;

  beforeAll(async () => {
    setupTestEnv();
    app = await createE2EApp();

    await resetDatabase();
    await createRole(RoleEnum.employee);

    const user = await createUser(RoleEnum.employee, {
      email: 'audituser@test.com',
      password: 'Test@123456',
    });

    testUserUuid = user.uuid;

    accessToken = await loginAndGetToken(app, user.email, 'Test@123456');

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
    await resetDatabase();
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

    const audit = response.body.data[0];

    expect(audit).toHaveProperty('entity', 'User');
    expect(audit).toHaveProperty('method');
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
