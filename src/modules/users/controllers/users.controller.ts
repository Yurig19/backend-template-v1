import { ApiController } from '@/core/decorators/api-controller.decorator';
import { ApiEndpoint } from '@/core/decorators/methods.decorator';
import { DeleteDto } from '@/core/dtos/delete.dto';
import { Body, ParseUUIDPipe, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiQuery } from '@nestjs/swagger';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ReadUserDto } from '../dtos/read-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CreateUserCommand } from '../use-cases/commands/create-user.command';
import { DeleteUserCommand } from '../use-cases/commands/delete-user.command';
import { UpdateUserCommand } from '../use-cases/commands/update-user.command';
import { UserByUuidQuery } from '../use-cases/queries/user-by-uuid.query';

@ApiController('Users')
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
    errorDescription: 'Invalid data',
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
    errorDescription: 'User not found',
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
    method: 'PUT',
    path: '/update',
    summary: 'Update a user by UUID',
    description: 'Updates the user information for the specified UUID.',
    operationId: 'updateUser',
    bodyType: UpdateUserDto,
    responseType: ReadUserDto,
    successDescription: 'User successfully updated',
    errorDescription: 'User not found or invalid data',
    isAuth: true,
  })
  @ApiQuery({ name: 'uuid', type: String, required: true })
  async update(
    @Query('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<ReadUserDto> {
    return this.queryBus.execute(new UpdateUserCommand(uuid, updateUserDto));
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
    errorDescription: 'User not found or could not be deleted',
  })
  @ApiQuery({ name: 'uuid', type: String, required: true })
  async delete(@Query('uuid', ParseUUIDPipe) uuid: string): Promise<DeleteDto> {
    return await this.queryBus.execute(new DeleteUserCommand(uuid));
  }
}
