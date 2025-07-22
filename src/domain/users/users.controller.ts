import { Body, Controller, ParseUUIDPipe, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiController } from 'src/core/decorators/api-controller.decorator';
import { ApiEndpoint } from '../../core/decorators/methods.decorator';
import { CreateUserDto } from './dtos/create/create-user.dto';
import { ReadUserDto } from './dtos/read/read-user.dto';
import { CreateUserCommand } from './use-cases/commands/create-user.command';
import { UserByUuidQuery } from './use-cases/queries/user-by-uuid.query';

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
    successDescription: 'User successfully created',
    errorDescription: 'Invalid data',
    isAuth: true,
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  @ApiEndpoint({
    method: 'GET',
    responseType: ReadUserDto,
    path: '/find-by-uuid',
    summary: 'Find a user by UUID',
    successDescription: 'User successfully found',
    errorDescription: 'User not found',
    isAuth: true,
  })
  @ApiQuery({ name: 'uuid', type: String, required: true })
  async getByUuid(@Query('uuid', ParseUUIDPipe) uuid: string) {
    return this.queryBus.execute<UserByUuidQuery, ReadUserDto>(
      new UserByUuidQuery(uuid)
    );
  }
}
