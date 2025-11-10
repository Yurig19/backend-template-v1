import { AuthService } from '@/modules/_auth/service/auth.service';
import { ReadUserDto } from '@/modules/users/dtos/read-user.dto';
import { UserService } from '@/modules/users/services/user.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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

    const checkEmail = await this.userService.checkEmail(authRegisterDto.email);

    if (checkEmail) {
      throw new BadRequestException('Email already registered!');
    }

    const userData = await this.userService.create(authRegisterDto);

    if (!userData) {
      throw new UnauthorizedException('User not found!');
    }

    const newRegister = await this.authService.register(userData);

    if (!newRegister) {
      throw new UnauthorizedException(
        'Not authorized. Check your credentials!'
      );
    }

    return {
      accessToken: newRegister,
      user: {
        uuid: userData.uuid,
        name: userData.name,
        email: userData.email,
        role: userData.roles ? userData.roles.type : null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      } as ReadUserDto,
    } as AuthLoginResponseDto;
  }
}
