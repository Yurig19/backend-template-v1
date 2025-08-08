import { ApiController } from '@/core/decorators/api-controller.decorator';
import { ApiEndpoint } from '@/core/decorators/methods.decorator';
import { GetUser } from '@/core/decorators/user-decorator';
import { Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ReadUserDto } from '../../users/dtos/read-user.dto';
import { AuthLoginResponseDto } from '../dtos/auth-login-response.dto';
import { AuthLoginDto } from '../dtos/auth-login.dto';
import { AuthRegisterDto } from '../dtos/auth-register.dto';
import { CreateUserCommand } from '../use-cases/commands/auth-login.command';
import { AuthRegisterCommand } from '../use-cases/commands/auth-register.command';

@ApiController('auth')
export class AuthController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @ApiEndpoint({
    method: 'POST',
    bodyType: AuthLoginDto,
    responseType: AuthLoginResponseDto,
    path: '/login',
    summary: 'Login',
    operationId: 'login',
    successDescription: 'User logged in successfully',
    errorDescription: 'User not logged in',
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
    operationId: 'register',
    successDescription: 'User registered in successfully',
    errorDescription: 'User not registered in',
    isAuth: false,
  })
  async register(
    @Body() authRegisterDto: AuthRegisterDto
  ): Promise<AuthLoginResponseDto> {
    return await this.commandBus.execute(
      new AuthRegisterCommand(authRegisterDto)
    );
  }

  @ApiEndpoint({
    method: 'GET',
    responseType: ReadUserDto,
    path: '/verify-token',
    summary: 'Verify token',
    operationId: 'checkToken',
    successDescription: 'Token is valid',
    errorDescription: 'Token is invalid',
    isAuth: true,
  })
  async verifyToken(@GetUser() user: ReadUserDto): Promise<ReadUserDto> {
    return user;
  }
}
