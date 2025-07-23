import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { AppError } from '@/core/errors/app.error';
import { AuthService } from '@/domain/_auth/service/auth.service';
import { ReadUserDto } from '@/domain/users/dtos/read-user.dto';
import { UserService } from '@/domain/users/services/user.service';
import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthLoginResponseDto } from '../../dtos/auth-login-response.dto';
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
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: 'Email já cadastrado!',
      });
    }

    const userData = await this.userService.createUser(authRegisterDto);

    if (!userData) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.UNAUTHORIZED,
        statusText: HttpStatusTextEnum.UNAUTHORIZED,
        message: 'Usuário não encontrado!',
      });
    }

    const newRegister = await this.authService.register(userData);

    if (!newRegister) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.UNAUTHORIZED,
        statusText: HttpStatusTextEnum.UNAUTHORIZED,
        message: 'Não autorizado. Verifique suas credenciais!',
      });
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
