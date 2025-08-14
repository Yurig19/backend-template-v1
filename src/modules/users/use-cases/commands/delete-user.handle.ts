import { DeleteDto } from '@/core/dtos/delete.dto';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { AppError } from '@/core/exceptions/app.error';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserService } from '../../services/user.service';
import { DeleteUserCommand } from './delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: DeleteUserCommand): Promise<DeleteDto> {
    const { uuid } = command;

    try {
      if (!(await this.userService.checkUuid(uuid))) {
        throw new AppError({
          message: 'User not found',
          statusCode: HttpStatusCodeEnum.NOT_FOUND,
          statusText: HttpStatusTextEnum.NOT_FOUND,
        });
      }
      await this.userService.delete(uuid);

      return {
        success: true,
        statusCode: HttpStatusCodeEnum.OK,
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new AppError({
        message: `${error.message}`,
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
    }
  }
}
