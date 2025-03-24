import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

import { CreateUserCommand } from './create-user.command';
import { UserService } from '../../services/user.service';
import { AppError } from 'src/core/errors/app.error';
import type { ReadUserDto } from '../../dtos/read/read-user.dto';

import { HttpStatusCodeEnum } from 'src/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from 'src/core/enums/errors/statusTextError.enum';

@CommandHandler(CreateUserCommand)
export class CreateUserHandle implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: CreateUserCommand): Promise<ReadUserDto> {
    const { createUserDto } = command;

    const user = await this.userService.createUser(createUserDto);

    if (!user) {
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        'Usuário não criado. Verifique os dados informados.'
      );
    }

    return {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    } as ReadUserDto;
  }
}
