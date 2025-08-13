import { randomUUID } from 'node:crypto';
import { RoleEnum } from '@/core/enums/role.enum';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import { ReadUserDto } from '../../users/dtos/read-user.dto';
import { AuthLoginResponseDto } from '../dtos/auth-login-response.dto';
import { AuthLoginDto } from '../dtos/auth-login.dto';
import { AuthRegisterDto } from '../dtos/auth-register.dto';
import { CreateUserCommand } from '../use-cases/commands/auth-login.command';
import { AuthRegisterCommand } from '../use-cases/commands/auth-register.command';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  let controller: AuthController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        PrismaService,
        {
          provide: CommandBus,
          useValue: { execute: jest.fn() },
        },
        {
          provide: QueryBus,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  const user: ReadUserDto = {
    uuid: randomUUID(),
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'hashed-password',
    role: RoleEnum.admin,
    roleUuid: randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockResponse: AuthLoginResponseDto = {
    accessToken: 'fake-jwt-token',
    user: user,
  };

  it('should login user', async () => {
    const dto: AuthLoginDto = {
      email: 'jane@example.com',
      password: 'password123',
    };

    jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(mockResponse);

    const result = await controller.login(dto);

    expect(commandBus.execute).toHaveBeenCalledWith(new CreateUserCommand(dto));
    expect(result).toEqual(mockResponse);
  });

  it('should register user', async () => {
    const dto: AuthRegisterDto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'password123',
      role: RoleEnum.admin,
    };

    jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(mockResponse);

    const result = await controller.register(dto);

    expect(commandBus.execute).toHaveBeenCalledWith(
      new AuthRegisterCommand(dto)
    );
    expect(result).toEqual(mockResponse);
  });

  it('should return current user on verifyToken', async () => {
    const result = await controller.verifyToken(user);

    expect(result).toEqual(user);
  });

  afterAll(async () => {
    await prisma.audits.deleteMany();
    await prisma.users.deleteMany();
    await prisma.$disconnect();
  });
});
