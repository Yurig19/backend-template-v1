import { RoleEnum } from '@/core/enums/role.enum';
import { AuthService } from '@/modules/_auth/service/auth.service';
import { ReadUserDto } from '@/modules/users/dtos/read-user.dto';
import { UserService } from '@/modules/users/services/user.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AuthRegisterDto } from '../../dtos/auth-register.dto';
import { AuthRegisterCommand } from './auth-register.command';
import { AuthRegisterHandler } from './auth-register.handle';

describe('AuthRegisterHandler', () => {
  let handler: AuthRegisterHandler;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;

  const mockDate = new Date();

  const mockDto: AuthRegisterDto = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password123',
    role: RoleEnum.employee,
  };

  const mockUser: ReadUserDto = {
    ...mockDto,
    uuid: 'uuid-456',
    roleUuid: 'role-uuid-test',
    createdAt: mockDate,
    updatedAt: mockDate,
    deletedAt: null,
  };

  beforeEach(() => {
    authService = {
      register: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    userService = {
      checkEmail: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    handler = new AuthRegisterHandler(authService, userService);
  });

  it('should register user and return accessToken and user data', async () => {
    userService.checkEmail.mockResolvedValue(false);
    userService.create.mockResolvedValue(mockUser);
    authService.register.mockResolvedValue('mock-token');

    const command = new AuthRegisterCommand(mockDto);
    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: 'mock-token',
      user: {
        uuid: mockUser.uuid,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      },
    });

    expect(userService.checkEmail).toHaveBeenCalledWith(mockDto.email);
    expect(userService.create).toHaveBeenCalledWith(mockDto);
    expect(authService.register).toHaveBeenCalledWith(mockUser);
  });

  it('should throw BadRequestException if email is already registered', async () => {
    userService.checkEmail.mockResolvedValue(true);

    const command = new AuthRegisterCommand(mockDto);

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(command)).rejects.toThrow(
      'Email already registered!'
    );
  });

  it('should throw UnauthorizedException if user creation fails', async () => {
    userService.checkEmail.mockResolvedValue(false);
    userService.create.mockResolvedValue(null);

    const command = new AuthRegisterCommand(mockDto);

    await expect(handler.execute(command)).rejects.toThrow(
      UnauthorizedException
    );
    await expect(handler.execute(command)).rejects.toThrow('User not found!');
  });

  it('should throw UnauthorizedException if authService.register fails', async () => {
    userService.checkEmail.mockResolvedValue(false);
    userService.create.mockResolvedValue(mockUser);
    authService.register.mockResolvedValue(null);

    const command = new AuthRegisterCommand(mockDto);

    await expect(handler.execute(command)).rejects.toThrow(
      UnauthorizedException
    );
    await expect(handler.execute(command)).rejects.toThrow(
      'Not authorized. Check your credentials!'
    );
  });
});
