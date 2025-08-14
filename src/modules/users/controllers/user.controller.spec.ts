import { RoleEnum } from '@/core/enums/role.enum';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CommandBus, CqrsModule, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import * as request from 'supertest';
import { UsersController } from '../controllers/users.controller';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

describe('UsersController (Integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let testUserUuid: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      controllers: [UsersController],
      providers: [PrismaService, CommandBus, QueryBus],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    prisma = module.get<PrismaService>(PrismaService);

    await prisma.users.deleteMany();

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
        password: 'testpassword',
        roleUuid: role.uuid,
      },
    });

    testUserUuid = user.uuid;
  });

  afterAll(async () => {
    await prisma.users.deleteMany();
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
      .post('/Users/create')
      .send(createUserDto)
      .expect(201);

    expect(response.body).toHaveProperty('uuid');
    expect(response.body.name).toBe(createUserDto.name);
    expect(response.body.email).toBe(createUserDto.email);
  });

  it('should get user by uuid', async () => {
    const response = await request(app.getHttpServer())
      .get('/Users/find-by-uuid')
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
      .put('/Users/update')
      .query({ uuid: testUserUuid })
      .send(updateUserDto)
      .expect(200);

    expect(response.body).toHaveProperty('uuid', testUserUuid);
    expect(response.body.name).toBe(updateUserDto.name);
    expect(response.body.email).toBe(updateUserDto.email);
  });

  it('should delete a user', async () => {
    const response = await request(app.getHttpServer())
      .delete('/Users/delete')
      .query({ uuid: testUserUuid })
      .expect(200);

    expect(response.body).toHaveProperty('deleted', true);

    const user = await prisma.users.findUnique({
      where: { uuid: testUserUuid },
    });
    expect(user).toBeNull();
  });
});
