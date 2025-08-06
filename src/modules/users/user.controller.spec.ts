import { DeleteDto } from '@/core/dtos/delete.dto';
import { RoleEnum } from '@/core/enums/role.enum';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dtos/create-user.dto';
import { ReadUserDto } from './dtos/read-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { CreateUserCommand } from './use-cases/commands/create-user.command';
import { DeleteUserCommand } from './use-cases/commands/delete-user.command';
import { UpdateUserCommand } from './use-cases/commands/update-user.command';
import { UserByUuidQuery } from './use-cases/queries/user-by-uuid.query';
import { UsersController } from './users.controller';

describe('UsersController', () => {
  let controller: UsersController;
  let commandBus: CommandBus;
  let queryBus: QueryBus;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
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

    controller = module.get<UsersController>(UsersController);
    commandBus = module.get<CommandBus>(CommandBus);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  const mockUser: ReadUserDto = {
    uuid: 'uuid-123',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
    role: RoleEnum.admin,
    roleUuid: 'role-uuid',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  it('should create a user', async () => {
    const dto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
      role: RoleEnum.admin,
    };

    jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(mockUser);

    const result = await controller.create(dto);

    expect(commandBus.execute).toHaveBeenCalledWith(new CreateUserCommand(dto));
    expect(result).toEqual(mockUser);
  });

  it('should get user by uuid', async () => {
    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(mockUser);

    const result = await controller.getByUuid(mockUser.uuid);

    expect(queryBus.execute).toHaveBeenCalledWith(
      new UserByUuidQuery(mockUser.uuid)
    );
    expect(result).toEqual(mockUser);
  });

  it('should update a user', async () => {
    const updateDto: UpdateUserDto = {
      role: RoleEnum.admin,
      name: 'Updated Name',
      email: 'updated@example.com',
      password: 'newpassword123',
    };

    const updatedUser: ReadUserDto = {
      ...mockUser,
      ...updateDto,
      updatedAt: new Date(),
    };

    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(updatedUser);

    const result = await controller.update(mockUser.uuid, updateDto);

    expect(queryBus.execute).toHaveBeenCalledWith(
      new UpdateUserCommand(mockUser.uuid, updateDto)
    );
    expect(result).toEqual(updatedUser);
  });

  it('should delete a user', async () => {
    const deleteDto: DeleteDto = {
      success: true,
      statusCode: 200,
      message: 'User deleted successfully',
    };

    jest.spyOn(queryBus, 'execute').mockResolvedValueOnce(deleteDto);

    const result = await controller.delete(mockUser.uuid);

    expect(queryBus.execute).toHaveBeenCalledWith(
      new DeleteUserCommand(mockUser.uuid)
    );
    expect(result).toEqual(deleteDto);
  });
});
