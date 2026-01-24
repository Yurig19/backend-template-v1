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

  /**
   * Handles the authentication register command by creating a new user and generating a token.
   * @param command Auth register command containing user registration data
   * @returns Authentication response with access token and user data
   */
  async execute(command: AuthRegisterCommand): Promise<AuthLoginResponseDto> {
    const { authRegisterDto } = command;

    const emailAlreadyExists = await this.userService.checkEmail(
      authRegisterDto.email
    );

    if (emailAlreadyExists) {
      throw new BadRequestException('Email already in use');
    }

    const userData = await this.userService.create(authRegisterDto);

    if (!userData) {
      throw new BadRequestException('Failed to create user');
    }

    const accessToken = await this.authService.register(userData);

    if (!accessToken) {
      throw new UnauthorizedException('Failed to generate access token');
    }

    return {
      accessToken,
      user: {
        uuid: userData.uuid,
        name: userData.name,
        email: userData.email,
        role: userData.roles ? userData.roles.type : null,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      } as ReadUserDto,
    };
  }
}
