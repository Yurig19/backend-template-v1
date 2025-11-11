import { ICommand } from '@nestjs/cqrs';
import { ResetPasswordDto } from '../../dtos/reset-password.dto';

export class AuthResetPasswordCommand implements ICommand {
  constructor(public readonly body: ResetPasswordDto) {}
}
