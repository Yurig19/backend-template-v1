import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';
import { UserService } from '@/modules/users/services/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../service/auth.service';
import { CreateUserCommand } from './auth-login.command';
import { AuthLoginHandler } from './auth-login.handle';

describe('AuthLoginHandler (integration)', () => {
  let handler: AuthLoginHandler;

  const password = 'password123';

  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    password,
    role: RoleEnum.admin,
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthLoginHandler, AuthService, UserService],
    }).compile();

    handler = module.get(AuthLoginHandler);

    await prisma.user.deleteMany();
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should login user and return accessToken and user data', async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: mockUser.name,
        email: mockUser.email,
        password: hashedPassword,
        roles: {
          create: {
            name: mockUser.role,
          },
        },
      },
      include: { roles: true },
    });

    const command = new CreateUserCommand({
      email: mockUser.email,
      password,
    });

    const result = await handler.execute(command);

    expect(result.accessToken).toBeDefined();
    expect(typeof result.accessToken).toBe('string');

    expect(result.user).toMatchObject({
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
    });

    expect(result.user.uuid).toBeDefined();
    expect(result.user.createdAt).toBeInstanceOf(Date);
  });

  it('should throw UnauthorizedException for invalid password', async () => {
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: mockUser.name,
        email: mockUser.email,
        password: hashedPassword,
      },
    });

    const command = new CreateUserCommand({
      email: mockUser.email,
      password: 'wrong-password',
    });

    await expect(handler.execute(command)).rejects.toThrow(
      UnauthorizedException
    );

    await expect(handler.execute(command)).rejects.toThrow(
      'Invalid email or password'
    );
  });

  it('should throw UnauthorizedException for non-existing email', async () => {
    const command = new CreateUserCommand({
      email: 'notfound@test.com',
      password,
    });

    await expect(handler.execute(command)).rejects.toThrow(
      UnauthorizedException
    );

    await expect(handler.execute(command)).rejects.toThrow(
      'Invalid email or password'
    );
  });
});
