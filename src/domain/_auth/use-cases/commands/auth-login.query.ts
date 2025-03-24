import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { UserService } from 'src/domain/users/services/user.service';
import { AuthService } from '../../service/auth.service';

import { HttpStatusCodeEnum } from 'src/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from 'src/core/enums/errors/statusTextError.enum';
import { AppError } from 'src/core/errors/app.error';

import { ReadUserDto } from 'src/domain/users/dtos/read/read-user.dto';
import { AuthLoginResponseDto } from '../../dtos/auth-login-response.dto';

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
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'Não autorizado. Verifique suas credenciais!'
      );
    }

    const user = await this.userService.findUserByEmail(email);

    if (!user) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'Usuário não encontrado!'
      );
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
