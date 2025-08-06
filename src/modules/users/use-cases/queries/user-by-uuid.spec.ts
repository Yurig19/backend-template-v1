import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { AppError } from '@/core/errors/app.error';
import { UserService } from '../../services/user.service';
import { UserByUuidHandle } from './user-by-uuid.handle';
import { UserByUuidQuery } from './user-by-uuid.query';

describe('UserByUuidHandle', () => {
  let handler: UserByUuidHandle;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    userService = {
      findByUuid: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    handler = new UserByUuidHandle(userService);
  });

  const mockUser = {
    uuid: 'user-uuid',
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'hashedpassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    roles: {
      name: RoleEnum.manager,
    },
  };

  it('should return user data as ReadUserDto', async () => {
    userService.findByUuid.mockResolvedValue(mockUser);

    const query = new UserByUuidQuery(mockUser.uuid);
    const result = await handler.execute(query);

    expect(result).toEqual({
      uuid: mockUser.uuid,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.roles.name,
      password: mockUser.password,
      createdAt: mockUser.createdAt,
      updatedAt: mockUser.updatedAt,
      deletedAt: mockUser.deletedAt,
    });
    expect(userService.findByUuid).toHaveBeenCalledWith(mockUser.uuid);
  });

  it('should throw AppError when user is not found', async () => {
    userService.findByUuid.mockResolvedValue(null);

    const query = new UserByUuidQuery('nonexistent-uuid');

    await expect(handler.execute(query)).rejects.toThrow(AppError);
    await expect(handler.execute(query)).rejects.toMatchObject({
      statusCode: HttpStatusCodeEnum.NOT_FOUND,
      statusText: HttpStatusTextEnum.NOT_FOUND,
      message: 'User not found.',
    });

    expect(userService.findByUuid).toHaveBeenCalledWith('nonexistent-uuid');
  });
});
