import type { ICommand } from '@nestjs/cqrs';
import type { CreateUserDto } from '../../dtos/create-user.dto';

export class CreateUserCommand implements ICommand {
  constructor(public readonly createUserDto: CreateUserDto) {}
}
