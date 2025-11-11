import { ICommand } from '@nestjs/cqrs';

export class AuthForgotPasswordCommand implements ICommand {
  constructor(public readonly email: string) {}
}
