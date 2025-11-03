import { BadRequestException } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';
import type { ReadUserDto } from '../../dtos/read-user.dto';
import { UserService } from '../../services/user.service';
import { CreateUserCommand } from './create-user.command';

@CommandHandler(CreateUserCommand)
export class CreateUserHandle implements ICommandHandler<CreateUserCommand> {
  constructor(private readonly userService: UserService) {}

  async execute(command: CreateUserCommand): Promise<ReadUserDto> {
    const { createUserDto } = command;

    if (await this.userService.checkEmail(createUserDto.email)) {
      throw new BadRequestException('User already exists with this email.');
    }

    const user = await this.userService.create(createUserDto);

    if (!user) {
      throw new BadRequestException(
        'User could not be created. Please verify the provided data.'
      );
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
