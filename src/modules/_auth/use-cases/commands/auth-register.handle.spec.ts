import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';
import { AuthService } from '@/modules/_auth/service/auth.service';
import { UserService } from '@/modules/users/services/user.service';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthRegisterCommand } from './auth-register.command';
import { AuthRegisterHandler } from './auth-register.handle';

describe('AuthRegisterHandler (integration)', () => {
  let handler: AuthRegisterHandler;

  const mockDto = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: RoleEnum.employee,
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthRegisterHandler, AuthService, UserService],
    }).compile();

    handler = module.get(AuthRegisterHandler);

    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should register user and return accessToken and user data', async () => {
    const command = new AuthRegisterCommand(mockDto);

    const result = await handler.execute(command);

    expect(result.accessToken).toBeDefined();
    expect(typeof result.accessToken).toBe('string');

    expect(result.user).toMatchObject({
      name: mockDto.name,
      email: mockDto.email,
    });

    expect(result.user.uuid).toBeDefined();
    expect(result.user.createdAt).toBeInstanceOf(Date);

    const userInDb = await prisma.user.findUnique({
      where: { email: mockDto.email },
    });

    expect(userInDb).not.toBeNull();
  });

  it('should throw BadRequestException if email already exists', async () => {
    await prisma.user.create({
      data: {
        name: mockDto.name,
        email: mockDto.email,
        password: 'hashed-password',
      },
    });

    const command = new AuthRegisterCommand(mockDto);

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);

    await expect(handler.execute(command)).rejects.toThrow(
      'Email already in use'
    );
  });
});
