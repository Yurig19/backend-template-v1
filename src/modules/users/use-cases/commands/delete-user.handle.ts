import { DeleteDto } from '@/core/dtos/delete.dto';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { BadRequestException, Logger, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserService } from '../../services/user.service';
import { DeleteUserCommand } from './delete-user.command';

@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  private readonly logger = new Logger(DeleteUserHandler.name);

  constructor(private readonly userService: UserService) {}

  /**
   * Handles the delete user command by permanently deleting a user.
   * @param command Delete user command containing user UUID
   * @returns Delete operation response with status and message
   */
  async execute(command: DeleteUserCommand): Promise<DeleteDto> {
    const { uuid } = command;

    try {
      if (!(await this.userService.checkUuid(uuid))) {
        throw new NotFoundException('User not found');
      }
      await this.userService.delete(uuid);

      return {
        success: true,
        statusCode: HttpStatusCodeEnum.OK,
        message: 'User deleted successfully!',
      };
    } catch (error) {
      this.logger.error(`Failed to delete user: ${uuid}`, error);
      throw new BadRequestException('Failed to delete user.');
    }
  }
}
