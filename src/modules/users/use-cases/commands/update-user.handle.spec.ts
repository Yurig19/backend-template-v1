import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { AppError } from '@/core/errors/app.error';
import { ReadUserDto } from '../../dtos/read-user.dto';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { UserService } from '../../services/user.service';
import { UpdateUserCommand } from './update-user.command';
import { UpdateUserHandler } from './update-user.handle';

describe('UpdateUserHandler', () => {
  let handler: UpdateUserHandler;
  let userService: jest.Mocked<UserService>;

  const uuid = 'user-uuid';
  const updateUserDto: UpdateUserDto = {
    name: 'Updated Name',
    email: 'updated@email.com',
    password: 'newpassword123',
    role: RoleEnum.admin,
  };

  const userMock = {
    uuid,
    name: updateUserDto.name,
    email: updateUserDto.email,
    password: updateUserDto.password,
    roleUuid: updateUserDto.role,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-08-01'),
    deletedAt: null,
  };

  beforeEach(() => {
    userService = {
      update: jest.fn(),
      checkUuid: jest.fn(),
      delete: jest.fn(),
      initAdmin: jest.fn(),
      checkEmail: jest.fn(),
      create: jest.fn(),
      findByUuid: jest.fn(),
      findAuthByUuid: jest.fn(),
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserService>;

    handler = new UpdateUserHandler(userService);
  });

  it('should update user successfully and return ReadUserDto', async () => {
    userService.update.mockResolvedValue(userMock);

    const result = await handler.execute(
      new UpdateUserCommand(uuid, updateUserDto)
    );

    expect(userService.update).toHaveBeenCalledWith(uuid, updateUserDto);
    expect(result).toEqual({
      uuid: userMock.uuid,
      name: userMock.name,
      email: userMock.email,
      role: userMock.roleUuid,
      password: userMock.password,
      createdAt: userMock.createdAt,
      updatedAt: userMock.updatedAt,
      deletedAt: userMock.deletedAt,
    } as ReadUserDto);
  });

  it('should throw AppError (400) if update returns null', async () => {
    userService.update.mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateUserCommand(uuid, updateUserDto))
    ).rejects.toEqual(
      new AppError({
        message: '',
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      })
    );

    expect(userService.update).toHaveBeenCalledWith(uuid, updateUserDto);
  });
});
