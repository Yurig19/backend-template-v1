import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { AppError } from '@/core/errors/app.error';
import { AuthService } from '@/modules/_auth/service/auth.service';
import { ReadUserDto } from '@/modules/users/dtos/read-user.dto';
import { UserService } from '@/modules/users/services/user.service';
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
    roleUuid: 'uuid-test',
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

  it('should throw AppError if email is already registered', async () => {
    userService.checkEmail.mockResolvedValue(true);

    const command = new AuthRegisterCommand(mockDto);

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    await expect(handler.execute(command)).rejects.toMatchObject({
      statusCode: HttpStatusCodeEnum.BAD_REQUEST,
      statusText: HttpStatusTextEnum.BAD_REQUEST,
      message: 'Email already registered!',
    });

    expect(userService.checkEmail).toHaveBeenCalledWith(mockDto.email);
  });

  it('should throw AppError if user creation fails', async () => {
    userService.checkEmail.mockResolvedValue(false);
    userService.create.mockResolvedValue(null);

    const command = new AuthRegisterCommand(mockDto);

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    await expect(handler.execute(command)).toMatchObject({
      statusCode: HttpStatusCodeEnum.UNAUTHORIZED,
      statusText: HttpStatusTextEnum.UNAUTHORIZED,
      message: 'User not found!',
    });
  });

  it('should throw AppError if authService.register fails', async () => {
    userService.checkEmail.mockResolvedValue(false);
    userService.create.mockResolvedValue(mockUser);
    authService.register.mockResolvedValue(null);

    const command = new AuthRegisterCommand(mockDto);

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    await expect(handler.execute(command)).toMatchObject({
      statusCode: HttpStatusCodeEnum.UNAUTHORIZED,
      statusText: HttpStatusTextEnum.UNAUTHORIZED,
      message: 'Not authorized. Check your credentials!',
    });
  });
});
