import type { ICommand } from '@nestjs/cqrs';
import type { AuthLoginDto } from '../../dtos/auth-logins.dto';

export class CreateUserCommand implements ICommand {
  constructor(public readonly authLoginDto: AuthLoginDto) {}
}
