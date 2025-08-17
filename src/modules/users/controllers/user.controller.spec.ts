import { RoleEnum } from '@/core/enums/role.enum';
import { generateHashPassword } from '@/core/utils/generatePassword';
import { AuthModule } from '@/modules/_auth/auth.module';
import { RolesModule } from '@/modules/roles/roles.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import * as request from 'supertest';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ReadUserListDto } from '../dtos/list-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserModule } from '../users.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserUuid: string;
  let accessToken: string;

  const userPassword: string = process.env.ADMIN_PASSWORD;
  const hashedPassword = generateHashPassword(process.env.ADMIN_PASSWORD);

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule, UserModule, RolesModule, AuthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    await prisma.$connect();

    await prisma.audits.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();

    const role = await prisma.roles.create({
      data: {
        name: 'employee',
        type: RoleEnum.employee,
      },
    });

    const user = await prisma.users.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: hashedPassword,
        roleUuid: role.uuid,
      },
    });

    testUserUuid = user.uuid;

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: user.email, password: userPassword });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await prisma.audits.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    await prisma.$disconnect();
    await app.close();
  });

  it('should create a new user', async () => {
    const createUserDto: CreateUserDto = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'newpassword',
      role: RoleEnum.employee,
    };

    const response = await request(app.getHttpServer())
      .post('/users/create')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(createUserDto)
      .expect(201);

    expect(response.body).toHaveProperty('uuid');
    expect(response.body.name).toBe(createUserDto.name);
    expect(response.body.email).toBe(createUserDto.email);
  });

  it('should get user by uuid', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/find-by-uuid')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ uuid: testUserUuid })
      .expect(200);

    expect(response.body).toHaveProperty('uuid', testUserUuid);
    expect(response.body).toHaveProperty('name', 'Test User');
  });

  it('should update a user', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated User',
      email: 'updateduser@example.com',
      password: 'updatedpassword',
      role: RoleEnum.employee,
    };

    const response = await request(app.getHttpServer())
      .put('/users/update')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ uuid: testUserUuid })
      .send(updateUserDto)
      .expect(200);

    expect(response.body).toHaveProperty('uuid', testUserUuid);
    expect(response.body.name).toBe(updateUserDto.name);
    expect(response.body.email).toBe(updateUserDto.email);
  });

  it('should list users with pagination', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/list')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ page: 1, dataPerPage: 10 })
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
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
      .query({ page: 1, dataPerPage: 10, search: 'Test User' })
      .expect(200);

    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(
      response.body.data.some(
        (user: ReadUserListDto) => user.name === 'Test User'
      )
    ).toBe(true);
  });

  it('should delete a user', async () => {
    const response = await request(app.getHttpServer())
      .delete('/users/delete')
      .set('Authorization', `Bearer ${accessToken}`)
      .query({ uuid: testUserUuid })
      .expect(200);

    expect(response.body).toHaveProperty('deleted', true);

    const user = await prisma.users.findUnique({
      where: { uuid: testUserUuid },
    });
    expect(user).toBeNull();
  });
});
