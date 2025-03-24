import { Body, Controller } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

// DTOs
import { AuthLoginDto } from './dtos/auth-logins.dto';
import { AuthLoginResponseDto } from './dtos/auth-login-response.dto';
import { AuthRegisterDto } from './dtos/auth-register.dto';
import { ReadUserDto } from '../users/dtos/read/read-user.dto';

// Commands & Queries
import { CreateUserCommand } from './use-cases/commands/auth-login.command';
import { AuthRegisterCommand } from './use-cases/commands/auth-register.command';

// Decorators
import { ApiEndpoint } from 'src/core/decorators/methods.decorator';
import { GetUser } from 'src/core/decorators/user-decorator';

@ApiTags('Auth')
@Controller({ path: 'auth', version: process.env.API_VERSION })
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
    successDescription: 'Token is valid',
    errorDescription: 'Token is invalid',
    isAuth: true,
  })
  async verifyToken(@GetUser() user: ReadUserDto): Promise<ReadUserDto> {
    return user;
  }
}
