import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpStatusCodeEnum } from 'src/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from 'src/core/enums/errors/statusTextError.enum';
import { AppError } from 'src/core/errors/app.error';
import { ReadUserDto } from 'src/domain/users/dtos/read/read-user.dto';
import { UserService } from 'src/domain/users/services/user.service';
import { AuthLoginResponseDto } from '../../dtos/auth-login-response.dto';
import { AuthService } from '../../service/auth.service';
import { AuthRegisterCommand } from './auth-register.command';

@Injectable()
@CommandHandler(AuthRegisterCommand)
export class AuthRegisterHandler
  implements ICommandHandler<AuthRegisterCommand>
{
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {}

  async execute(command: AuthRegisterCommand): Promise<AuthLoginResponseDto> {
    const { authRegisterDto } = command;

    const checkEmail = await this.userService.checkEmailUser(
      authRegisterDto.email
    );

    if (checkEmail) {
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        'Email já cadastrado!'
      );
    }

    const userData = await this.userService.createUser(authRegisterDto);

    if (!userData) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'Usuário não encontrado!'
      );
    }

    const newRegister = await this.authService.register(userData);

    if (!newRegister) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'Não autorizado. Verifique suas credenciais!'
      );
    }

    return {
      accessToken: newRegister,
      user: {
        uuid: userData.uuid,
        name: userData.name,
        email: userData.email,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      } as ReadUserDto,
    } as AuthLoginResponseDto;
  }
}
