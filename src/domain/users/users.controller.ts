import { Body, Controller, ParseUUIDPipe, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

// DTOs
import { CreateUserDto } from './dtos/create/create-user.dto';
import { ReadUserDto } from './dtos/read/read-user.dto';

// Commands & Queries
import { CreateUserCommand } from './use-cases/commands/create-user.command';
import { UserByUuidQuery } from './use-cases/queries/user-by-uuid.query';

// Decorators
import { ApiEndpoint } from '../../core/decorators/methods.decorator';

@ApiTags('Users')
@Controller({ path: 'users', version: process.env.API_VERSION })
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
    summary: 'Criar um novo usuário',
    successDescription: 'Usuário criado com sucesso',
    errorDescription: 'Dados inválidos',
    isAuth: true,
  })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(new CreateUserCommand(createUserDto));
  }

  @ApiEndpoint({
    method: 'GET',
    responseType: ReadUserDto,
    path: '/find-by-uuid',
    summary: 'Busca um novo usuário',
    successDescription: 'Usuário encontrado',
    errorDescription: 'Usuário não encontrado',
    isAuth: true,
  })
  @ApiQuery({ name: 'uuid', type: String, required: true })
  async getByUuid(@Query('uuid', ParseUUIDPipe) uuid: string) {
    return this.queryBus.execute<UserByUuidQuery, ReadUserDto>(
      new UserByUuidQuery(uuid)
    );
  }
}
