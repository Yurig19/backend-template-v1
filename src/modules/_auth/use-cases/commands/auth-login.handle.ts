import { ReadUserDto } from '@/modules/users/dtos/read-user.dto';
import { UserService } from '@/modules/users/services/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthLoginResponseDto } from '../../dtos/auth-login-response.dto';
import { AuthService } from '../../service/auth.service';
import { CreateUserCommand } from './auth-login.command';

@Injectable()
@CommandHandler(CreateUserCommand)
export class AuthLoginHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  async execute(command: CreateUserCommand): Promise<AuthLoginResponseDto> {
    const { authLoginDto } = command;
    const { email, password } = authLoginDto;

    const login = await this.authService.login(email, password);

    if (!login) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return {
      accessToken: login,
      user: {
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.roles ? user.roles.name : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        deletedAt: user.deletedAt,
      } as ReadUserDto,
    } as AuthLoginResponseDto;
  }
}
