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
import { CreateUserDto } from '../dtos/create-user.dto';
import { ReadUserListDto } from '../dtos/list-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;
  let testUserUuid: string;

  beforeAll(async () => {
    setupTestEnv();
    app = await createE2EApp();

    await resetDatabase();
    await createRole(RoleEnum.employee);

    const user = await createUser(RoleEnum.employee, {
      email: 'testuser@example.com',
      password: 'Test@123456',
    });

    testUserUuid = user.uuid;
    accessToken = await loginAndGetToken(app, user.email, 'Test@123456');
  });

  afterAll(async () => {
    await resetDatabase();
    await prisma.$disconnect();
    await app.close();
  });

  it('should create a new user', async () => {
    const dto: CreateUserDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'new@Password123',
      role: RoleEnum.employee,
    };

    const response = await request(app.getHttpServer())
      .post('/users/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(dto)
      .expect(201);

    expect(response.body).toMatchObject({
      name: dto.name,
      email: dto.email,
    });

    expect(response.body).toHaveProperty('uuid');
  });

  it('should get user by uuid', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/find-by-uuid')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ uuid: testUserUuid })
      .expect(200);

    expect(response.body).toMatchObject({
      uuid: testUserUuid,
      name: 'Test User',
    });
  });

  it('should list users with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/list')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1, dataPerPage: 10 })
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('actualPage');
    expect(response.body).toHaveProperty('totalPages');

    expect(
      response.body.data.some(
        (user: ReadUserListDto) => user.uuid === testUserUuid
      )
    ).toBe(true);
  });

  it('should list users with search', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/list')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({
        page: 1,
        dataPerPage: 10,
        search: 'Test User',
      })
      .expect(200);

    expect(
      response.body.data.some(
        (user: ReadUserListDto) => user.name === 'Test User'
      )
    ).toBe(true);
  });

  it('should update a user', async () => {
    const dto: UpdateUserDto = {
      name: 'Updated User',
      email: 'updateduser@example.com',
      password: 'updated@Password123',
      role: RoleEnum.employee,
    };

    const response = await request(app.getHttpServer())
      .put('/users/update')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ uuid: testUserUuid })
      .send(dto)
      .expect(200);

    expect(response.body).toMatchObject({
      uuid: testUserUuid,
      name: dto.name,
      email: dto.email,
    });
  });

  it('should delete a user', async () => {
    const response = await request(app.getHttpServer())
      .delete('/users/delete')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ uuid: testUserUuid })
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      statusCode: 200,
      message: 'User deleted successfully!',
    });

    const user = await prisma.user.findUnique({
      where: { uuid: testUserUuid },
    });

    expect(user).toBeNull();
  });
});
