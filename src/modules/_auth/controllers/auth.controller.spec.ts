import { RoleEnum } from '@/core/enums/role.enum';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
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

  const mockResponse: AuthLoginResponseDto = {
    accessToken: 'fake-jwt-token',
    user: {
      uuid: 'uuid-123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashed-password',
      role: RoleEnum.admin,
      roleUuid: 'role-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
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
    const user: ReadUserDto = {
      uuid: 'uuid-123',
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'hashed-password',
      role: RoleEnum.admin,
      roleUuid: 'role-uuid',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const result = await controller.verifyToken(user);

    expect(result).toEqual(user);
  });
});
