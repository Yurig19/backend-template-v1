import { ApiController } from '@/core/decorators/api-controller.decorator';
import { ApiEndpoint } from '@/core/decorators/methods.decorator';
import { GetUser } from '@/core/decorators/user-decorator';
import { RoleEnum } from '@/core/enums/role.enum';
import { Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ReadUserDto } from '../../users/dtos/read-user.dto';
import { AuthLoginResponseDto } from '../dtos/auth-login-response.dto';
import { AuthLoginDto } from '../dtos/auth-login.dto';
import { AuthRegisterDto } from '../dtos/auth-register.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { AuthForgotPasswordCommand } from '../use-cases/commands/auth-forgot-password.command';
import { CreateUserCommand } from '../use-cases/commands/auth-login.command';
import { AuthRegisterCommand } from '../use-cases/commands/auth-register.command';
import { AuthResetPasswordCommand } from '../use-cases/commands/auth-reset-password.command';

@ApiController('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiEndpoint({
    method: 'POST',
    bodyType: AuthLoginDto,
    responseType: AuthLoginResponseDto,
    path: '/login',
    summary: 'Login',
    description:
      'Authenticates a user and returns an access token if credentials are valid.',
    operationId: 'login',
    successDescription: 'User logged in successfully',
    isAuth: false,
  })
  async login(
    @Body() authLoginDto: AuthLoginDto
  ): Promise<AuthLoginResponseDto> {
    return await this.commandBus.execute(new CreateUserCommand(authLoginDto));
  }

  @ApiEndpoint({
    method: 'POST',
    bodyType: AuthRegisterDto,
    responseType: AuthLoginResponseDto,
    path: '/register',
    summary: 'Register',
    description:
      'Registers a new user and returns an access token upon successful registration.',
    operationId: 'register',
    successDescription: 'User registered in successfully',
    isAuth: true,
    roles: [RoleEnum.admin],
  })
  async register(
    @Body() authRegisterDto: AuthRegisterDto
  ): Promise<AuthLoginResponseDto> {
    return await this.commandBus.execute(
      new AuthRegisterCommand(authRegisterDto)
    );
  }

  @ApiEndpoint({
    method: 'POST',
    bodyType: ForgotPasswordDto,
    responseType: Object,
    path: '/forgot-password',
    summary: 'Forgot password',
    description: 'Sends a password recovery code to the user email.',
    operationId: 'forgotPassword',
    successDescription: 'Recovery email sent successfully',
  })
  async forgotPassword(
    @Body() body: ForgotPasswordDto
  ): Promise<{ message: string }> {
    return await this.commandBus.execute(
      new AuthForgotPasswordCommand(body.email)
    );
  }

  @ApiEndpoint({
    method: 'POST',
    bodyType: ResetPasswordDto,
    responseType: Object,
    path: '/reset-password',
    summary: 'Reset password',
    description: 'Resets user password using a recovery code.',
    operationId: 'resetPassword',
    successDescription: 'Password reset successfully',
  })
  async resetPassword(
    @Body() body: ResetPasswordDto
  ): Promise<{ message: string }> {
    return await this.commandBus.execute(new AuthResetPasswordCommand(body));
  }

  @ApiEndpoint({
    method: 'GET',
    responseType: ReadUserDto,
    path: '/verify-token',
    summary: 'Verify token',
    description:
      'Checks if the provided authentication token is valid and returns user data.',
    operationId: 'checkToken',
    successDescription: 'Token is valid',
    isAuth: true,
  })
  async verifyToken(@GetUser() user: ReadUserDto): Promise<ReadUserDto> {
    return user;
  }
}
