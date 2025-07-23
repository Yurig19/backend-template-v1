import { ICommand } from '@nestjs/cqrs';
import { UpdateUserDto } from '../../dtos/update-user.dto';

export class UpdateUserCommand implements ICommand {
  constructor(
    public readonly uuid: string,
    public readonly updateUserDto: UpdateUserDto
  ) {}
}
