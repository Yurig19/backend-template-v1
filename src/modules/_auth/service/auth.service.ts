import { PrismaService } from '@/core/database/prisma.service';
import { checkPassword } from '@/core/utils/generatePassword';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Users } from 'generated/prisma/client';
import { VerifyTokenDto } from '../dtos/verify-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
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
      this.logger.error('Failed to generate token', error);
      throw new UnauthorizedException(
        'Failed to generate authentication token.'
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
      this.logger.error('Failed to verify token', error);
      throw new UnauthorizedException('Invalid or expired token.');
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
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isValidPassword = await checkPassword(password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedException('Invalid email or password.');
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
