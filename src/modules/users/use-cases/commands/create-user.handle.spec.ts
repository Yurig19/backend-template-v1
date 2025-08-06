import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { AppError } from '@/core/errors/app.error';
import { CreateUserDto } from '../../dtos/create-user.dto';
import { ReadUserDto } from '../../dtos/read-user.dto';
import { UserService } from '../../services/user.service';
import { CreateUserCommand } from './create-user.command';
import { CreateUserHandle } from './create-user.handle';

describe('CreateUserHandle', () => {
  let handler: CreateUserHandle;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    userService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    handler = new CreateUserHandle(userService);
  });

  const mockDto: CreateUserDto = {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
    role: RoleEnum.admin,
  };

  const mockUser = {
    ...mockDto,
    uuid: 'uuid-123',
    roleUuid: 'role-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  it('should create user and return ReadUserDto', async () => {
    userService.create.mockResolvedValue(mockUser);

    const command = new CreateUserCommand(mockDto);

    const result = await handler.execute(command);

    const expected: ReadUserDto = {
      uuid: mockUser.uuid,
      name: mockUser.name,
      email: mockUser.email,
      roleUuid: mockUser.roleUuid,
      password: mockUser.password,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
      deletedAt: mockUser.deletedAt,
    };

    expect(userService.create).toHaveBeenCalledWith(mockDto);
    expect(result).toEqual(expected);
  });

  it('should throw AppError if user creation fails', async () => {
    userService.create.mockResolvedValue(null);

    const command = new CreateUserCommand(mockDto);

    await expect(handler.execute(command)).rejects.toThrow(AppError);
    await expect(handler.execute(command)).rejects.toMatchObject({
      statusCode: HttpStatusCodeEnum.BAD_REQUEST,
      statusText: HttpStatusTextEnum.BAD_REQUEST,
      message: 'User could not be created. Please verify the provided data.',
    });

    expect(userService.create).toHaveBeenCalledWith(mockDto);
  });
});
