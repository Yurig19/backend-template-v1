import { RoleEnum } from '@/core/enums/role.enum';
import { UserService } from '@/modules/users/services/user.service';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../../service/auth.service';
import { CreateUserCommand } from './auth-login.command';
import { AuthLoginHandler } from './auth-login.handle';

describe('AuthLoginHandler', () => {
  let handler: AuthLoginHandler;
  let authService: jest.Mocked<AuthService>;
  let userService: jest.Mocked<UserService>;

  const mockDate = new Date();

  const mockUser = {
    uuid: 'uuid-123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
    createdAt: mockDate,
    updatedAt: mockDate,
    deletedAt: null,
    roles: {
      name: RoleEnum.admin,
    },
  };

  beforeEach(() => {
    authService = {
      login: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    userService = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    handler = new AuthLoginHandler(authService, userService);
  });

  it('should return accessToken and user on successful login', async () => {
    authService.login.mockResolvedValue('mock-token');
    userService.findByEmail.mockResolvedValue(mockUser);

    const command = new CreateUserCommand({
      email: mockUser.email,
      password: mockUser.password,
    });

    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: 'mock-token',
      user: {
        uuid: mockUser.uuid,
        name: mockUser.name,
        email: mockUser.email,
        password: mockUser.password,
        role: RoleEnum.admin,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
        deletedAt: null,
      },
    });

    expect(authService.login).toHaveBeenCalledWith(
      mockUser.email,
      mockUser.password
    );
    expect(userService.findByEmail).toHaveBeenCalledWith(mockUser.email);
  });

  it('should throw UnauthorizedException if login fails', async () => {
    authService.login.mockResolvedValue(null);

    const command = new CreateUserCommand({
      email: mockUser.email,
      password: mockUser.password,
    });

    await expect(handler.execute(command)).rejects.toThrow(
      UnauthorizedException
    );
    await expect(handler.execute(command)).rejects.toThrow(
      'Invalid email or password'
    );

    expect(authService.login).toHaveBeenCalledWith(
      mockUser.email,
      mockUser.password
    );
  });

  it('should throw UnauthorizedException if user is not found after login', async () => {
    authService.login.mockResolvedValue('mock-token');
    userService.findByEmail.mockResolvedValue(null);

    const command = new CreateUserCommand({
      email: mockUser.email,
      password: mockUser.password,
    });

    await expect(handler.execute(command)).rejects.toThrow(
      UnauthorizedException
    );
    await expect(handler.execute(command)).rejects.toThrow(
      'Invalid email or password'
    );

    expect(authService.login).toHaveBeenCalledWith(
      mockUser.email,
      mockUser.password
    );
    expect(userService.findByEmail).toHaveBeenCalledWith(mockUser.email);
  });
});
