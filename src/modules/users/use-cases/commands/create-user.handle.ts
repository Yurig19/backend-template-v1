import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { AppError } from '@/core/exceptions/app.error';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { ReadUserDto } from '../../dtos/read-user.dto';
import { UserService } from '../../services/user.service';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandle implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: CreateUserCommand): Promise<ReadUserDto> {
    const { createUserDto } = command;

    const user = await this.userService.create(createUserDto);

    if (!user) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: 'User could not be created. Please verify the provided data.',
      });
    }

    return <ReadUserDto>{
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      roleUuid: user.roleUuid,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
