import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppError } from 'src/core/errors/app.error';
import { HttpStatusCodeEnum } from 'src/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from 'src/core/enums/errors/statusTextError.enum';
import { Users } from '@prisma/client';
import { VerifyTokenDto } from '../dtos/verify-token.dto';

import { PrismaService } from 'prisma/prisma.service';
import { checkPassword } from 'src/core/utils/generatePassword';

@Injectable()
export class AuthService {
  private audience = 'users';
  private issuer = 'login';

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  private generateToken(user: Users): string {
    try {
      return this.jwtService.sign(
        {
          userUuid: user.uuid,
          name: user.name,
          email: user.email,
        },
        {
          subject: user.uuid,
          expiresIn: '3 days',
          issuer: this.audience,
          audience: this.issuer,
        }
      );
    } catch (error) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        `${error}`
      );
    }
  }

  checkToken(token: string): VerifyTokenDto {
    try {
      return this.jwtService.verify(token, {
        issuer: this.audience,
        audience: this.issuer,
      });
    } catch (error) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        `${error}`
      );
    }
  }

  isValidToken(token: string): boolean {
    try {
      this.checkToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'Usuário não encontrado'
      );
    }

    const isValidPassword = await checkPassword(password, user.password);

    if (!isValidPassword) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'Senha inválida'
      );
    }

    return this.generateToken(user);
  }

  async register(user: Users) {
    return this.generateToken(user);
  }

  async forgotPassword(email: string) {
    console.log(email);
    return true;
  }

  async resetPassword(token: string): Promise<void> {
    console.log(token);
  }
}
