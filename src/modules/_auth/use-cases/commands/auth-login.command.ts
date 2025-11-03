import type { ICommand } from '@nestjs/cqrs';
import type { AuthLoginDto } from '../../dtos/auth-login.dto';

export class CreateUserCommand implements ICommand {
  constructor(public readonly authLoginDto: AuthLoginDto) {}
}
