import { ApiController } from '@/core/decorators/api-controller.decorator';
import { ApiEndpoint } from '@/core/decorators/methods.decorator';
import { DeleteDto } from '@/core/dtos/delete.dto';
import { Body, ParseUUIDPipe, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiQuery } from '@nestjs/swagger';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ListUserDto } from '../dtos/list-user.dto';
import { ReadUserDto } from '../dtos/read-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CreateUserCommand } from '../use-cases/commands/create-user.command';
import { DeleteUserCommand } from '../use-cases/commands/delete-user.command';
import { UpdateUserCommand } from '../use-cases/commands/update-user.command';
import { ListUsersQuery } from '../use-cases/queries/list-user.query';
import { UserByUuidQuery } from '../use-cases/queries/user-by-uuid.query';

@ApiController('users')
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiEndpoint({
    method: 'POST',
    bodyType: CreateUserDto,
    responseType: ReadUserDto,
    path: '/create',
    summary: 'Create a new user',
    description:
      'Accepts user data and creates a new user record in the system.',
    operationId: 'createUser',
    successDescription: 'User successfully created',
    isAuth: true,
  })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  @ApiEndpoint({
    method: 'GET',
    responseType: ReadUserDto,
    path: '/find-by-uuid',
    summary: 'Find a user by UUID',
    description: 'Retrieves a user based on the provided UUID parameter.',
    operationId: 'getByUserUuid',
    successDescription: 'User successfully found',
    isAuth: true,
  })
  @ApiQuery({ name: 'uuid', type: String, required: true })
  async getByUuid(
    @Query('uuid', ParseUUIDPipe) uuid: string
  ): Promise<ReadUserDto> {
    return this.queryBus.execute<UserByUuidQuery, ReadUserDto>(
      new UserByUuidQuery(uuid)
    );
  }

  @ApiEndpoint({
    method: 'GET',
    path: '/list',
    summary: 'List users with pagination and search',
    description:
      'Returns a paginated list of users. Supports optional search by name.',
    operationId: 'listUsers',
    responseType: ListUserDto,
    isAuth: true,
    successDescription: 'Users successfully listed',
  })
  @ApiQuery({ name: 'page', type: Number, required: true })
  @ApiQuery({ name: 'dataPerPage', type: Number, required: true })
  @ApiQuery({ name: 'search', type: String, required: false })
  async list(
    @Query('page') page: number,
    @Query('dataPerPage') dataPerPage: number,
    @Query('search') search?: string
  ) {
    return this.queryBus.execute<ListUsersQuery, ListUserDto>(
      new ListUsersQuery(page, dataPerPage, search)
    );
  }

  @ApiEndpoint({
    method: 'PUT',
    path: '/update',
    summary: 'Update a user by UUID',
    description: 'Updates the user information for the specified UUID.',
    operationId: 'updateUser',
    bodyType: UpdateUserDto,
    responseType: ReadUserDto,
    successDescription: 'User successfully updated',
    isAuth: true,
  })
  @ApiQuery({ name: 'uuid', type: String, required: true })
  async update(
    @Query('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<ReadUserDto> {
    return this.commandBus.execute(new UpdateUserCommand(uuid, updateUserDto));
  }

  @ApiEndpoint({
    method: 'DELETE',
    path: '/delete',
    summary: 'Delete a user by UUID',
    description:
      'Deletes the user associated with the given UUID from the system.',
    operationId: 'deleteUser',
    responseType: DeleteDto,
    isAuth: true,
    successDescription: 'User successfully deleted',
  })
  @ApiQuery({ name: 'uuid', type: String, required: true })
  async delete(@Query('uuid', ParseUUIDPipe) uuid: string): Promise<DeleteDto> {
    return await this.commandBus.execute(new DeleteUserCommand(uuid));
  }
}
