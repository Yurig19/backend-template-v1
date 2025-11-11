import { BadRequestException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReadUserDto } from '../../dtos/read-user.dto';
import { UserService } from '../../services/user.service';
import { UpdateUserCommand } from './update-user.command';

@CommandHandler(UpdateUserCommand)
export class UpdateUserHandler implements ICommandHandler<UpdateUserCommand> {
  constructor(private readonly userService: UserService) {}

  /**
   * Handles the update user command by updating user information.
   * @param command Update user command containing user UUID and update data
   * @returns Updated user data
   */
  async execute(command: UpdateUserCommand): Promise<ReadUserDto> {
    const { uuid, updateUserDto } = command;

    const user = await this.userService.update(uuid, updateUserDto);

    if (!user) {
      throw new BadRequestException(
        'Failed to update user. User not found or update failed.'
      );
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
