import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';
import { RolesModule } from '@/modules/roles/roles.module';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { UserService } from '../../services/user.service';
import { UserModule } from '../../users.module';
import { CreateUserCommand } from './create-user.command';
import { CreateUserHandle } from './create-user.handle';

describe('CreateUserHandle (integration)', () => {
  let handler: CreateUserHandle;
  let userService: UserService;

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
      providers: [CreateUserHandle, UserService],
    }).compile();

    handler = module.get<CreateUserHandle>(CreateUserHandle);
    userService = module.get<UserService>(UserService);

    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    await prisma.role.create({
      data: {
        type: RoleEnum.admin,
        name: 'admin',
      },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
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

    const userInDb = await prisma.user.findUnique({
      where: { email: mockDto.email },
    });
    expect(userInDb).toBeTruthy();
  });

  it('should throw BadRequestException if user creation fails', async () => {
    const command = new CreateUserCommand(mockDto);
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(command)).rejects.toThrow(
      'User already exists with this email.'
    );
  });
});
