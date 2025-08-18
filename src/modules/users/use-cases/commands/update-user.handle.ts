import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { AppError } from '@/core/exceptions/app.error';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReadUserDto } from '../../dtos/read-user.dto';
import { UserService } from '../../services/user.service';
import { UpdateUserCommand } from './update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: UpdateUserCommand): Promise<ReadUserDto> {
    const { uuid, updateUserDto } = command;

    const user = await this.userService.update(uuid, updateUserDto);

    if (!user) {
      throw new AppError({
        message: '',
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
    }

    return <ReadUserDto>{
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.roles ? (user.roles.type ? user.roles.type : null) : null,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
