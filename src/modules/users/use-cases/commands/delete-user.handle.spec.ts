import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { AppError } from '@/core/errors/app.error';
import { UserService } from '../../services/user.service';
import { DeleteUserCommand } from './delete-user.command';
import { DeleteUserHandler } from './delete-user.handle';

describe('DeleteUserHandler', () => {
  let handler: DeleteUserHandler;
  let userService: jest.Mocked<UserService>;

  beforeEach(() => {
    userService = {
      checkUuid: jest.fn(),
      delete: jest.fn(),
      initAdmin: jest.fn(),
      checkEmail: jest.fn(),
      create: jest.fn(),
      findByUuid: jest.fn(),
      findAuthByUuid: jest.fn(),
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    handler = new DeleteUserHandler(userService);
  });

  const uuid = 'uuid-123';

  it('should delete user successfully when uuid exists', async () => {
    userService.checkUuid.mockResolvedValue(true);
    userService.delete.mockResolvedValue(undefined);

    const result = await handler.execute(new DeleteUserCommand(uuid));

    expect(userService.checkUuid).toHaveBeenCalledWith(uuid);
    expect(userService.delete).toHaveBeenCalledWith(uuid);
    expect(result).toEqual({
      success: true,
      statusCode: HttpStatusCodeEnum.OK,
      message: 'User deleted successfully',
    });
  });

  it('should throw AppError (404) if user does not exist', async () => {
    userService.checkUuid.mockResolvedValue(false);

    await expect(handler.execute(new DeleteUserCommand(uuid))).rejects.toEqual(
      new AppError({
        message: 'User not found',
        statusCode: HttpStatusCodeEnum.NOT_FOUND,
        statusText: HttpStatusTextEnum.NOT_FOUND,
      })
    );

    expect(userService.checkUuid).toHaveBeenCalledWith(uuid);
    expect(userService.delete).not.toHaveBeenCalled();
  });

  it('should throw AppError (400) if delete fails internally', async () => {
    userService.checkUuid.mockResolvedValue(true);
    userService.delete.mockRejectedValue(new Error('Database error'));

    await expect(handler.execute(new DeleteUserCommand(uuid))).rejects.toEqual(
      new AppError({
        message: 'Database error',
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      })
    );

    expect(userService.checkUuid).toHaveBeenCalledWith(uuid);
    expect(userService.delete).toHaveBeenCalledWith(uuid);
  });
});
