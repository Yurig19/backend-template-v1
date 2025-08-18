import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { AppError } from '@/core/exceptions/app.error';
import { RolesModule } from '@/modules/roles/roles.module';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { UserService } from '../../services/user.service';
import { UserModule } from '../../users.module';
import { CreateUserCommand } from './create-user.command';
import { CreateUserHandle } from './create-user.handle';

describe('CreateUserHandle (integration)', () => {
  let handler: CreateUserHandle;
  let userService: UserService;
  let prisma: PrismaService;

  const mockDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
    role: RoleEnum.admin,
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule, RolesModule],
      providers: [CreateUserHandle, UserService, PrismaService],
    }).compile();

    handler = module.get<CreateUserHandle>(CreateUserHandle);
    userService = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();

    await prisma.roles.create({
      data: {
        type: RoleEnum.admin,
        name: 'admin',
      },
    });
  });

  afterAll(async () => {
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    await prisma.$disconnect();
  });

  it('should create user and return ReadUserDto', async () => {
    const command = new CreateUserCommand(mockDto);

    const result = await handler.execute(command);

    expect(result).toMatchObject({
      uuid: expect.any(String),
      name: mockDto.name,
      email: mockDto.email,
      roleUuid: expect.any(String),
      password: expect.any(String),
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
      deletedAt: null,
    });

    const userInDb = await prisma.users.findUnique({
      where: { email: mockDto.email },
    });
    expect(userInDb).toBeTruthy();
  });

  it('should throw AppError if user creation fails', async () => {
    const command = new CreateUserCommand(mockDto);
    try {
      await handler.execute(command);
      fail('Expected AppError but nothing was thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect(error.statusCode).toBe(HttpStatusCodeEnum.BAD_REQUEST);
      expect(error.statusText).toBe(HttpStatusTextEnum.BAD_REQUEST);
      expect(error.message).toBe('User already exists with this email.');
    }
  });
});
