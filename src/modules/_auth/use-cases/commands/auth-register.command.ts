import { ICommand } from '@nestjs/cqrs';
import { AuthRegisterDto } from '../../dtos/auth-register.dto';

export class AuthRegisterCommand implements ICommand {
  constructor(public readonly authRegisterDto: AuthRegisterDto) {}
}
