import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { AppError } from '@/core/errors/app.error';
import { checkPassword } from '@/core/utils/generatePassword';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Users } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { VerifyTokenDto } from '../dtos/verify-token.dto';

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
      throw new AppError({
        message: 'unauthorized',
        statusCode: HttpStatusCodeEnum.UNAUTHORIZED,
        statusText: HttpStatusTextEnum.UNAUTHORIZED,
      });
    }
  }

  checkToken(token: string): VerifyTokenDto {
    try {
      return this.jwtService.verify(token, {
        issuer: this.audience,
        audience: this.issuer,
      });
    } catch (error) {
      throw new AppError({
        message: 'unauthorized',
        statusCode: HttpStatusCodeEnum.UNAUTHORIZED,
        statusText: HttpStatusTextEnum.UNAUTHORIZED,
      });
    }
  }

  isValidToken(token: string): boolean {
    try {
      this.checkToken(token);
      return true;
    } catch {
      return false;
    }
  }

  async login(email: string, password: string): Promise<string> {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError({
        message: 'unauthorized',
        statusCode: HttpStatusCodeEnum.UNAUTHORIZED,
        statusText: HttpStatusTextEnum.UNAUTHORIZED,
      });
    }

    const isValidPassword = await checkPassword(password, user.password);

    if (!isValidPassword) {
      throw new AppError({
        message: 'unauthorized',
        statusCode: HttpStatusCodeEnum.UNAUTHORIZED,
        statusText: HttpStatusTextEnum.UNAUTHORIZED,
      });
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
