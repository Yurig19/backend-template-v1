import { prisma } from '@/core/lib/prisma';
import {
  generateCode,
  hashCode,
  verifyCode,
} from '@/core/security/helpers/code.helper';
import {
  checkPassword,
  generateHashPassword,
} from '@/core/security/helpers/password.helper';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from 'generated/prisma/client';
import { VerifyTokenDto } from '../dtos/verify-token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private audience = 'users';
  private issuer = 'login';

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generates a JWT token for a user with role information.
   * @param user User object with role information
   * @returns JWT token string
   */
  private generateToken(user: User & { roles: Role }): string {
    try {
      return this.jwtService.sign(
        {
          userUuid: user.uuid,
          name: user.name,
          email: user.email,
          role: user.roles?.type,
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

  /**
   * Verifies and decodes a JWT token.
   * @param token JWT token string to verify
   * @returns Decoded token data
   */
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

  /**
   * Checks if a JWT token is valid without throwing an error.
   * @param token JWT token string to validate
   * @returns True if token is valid, false otherwise
   */
  isValidToken(token: string): boolean {
    try {
      this.checkToken(token);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Authenticates a user with email and password.
   * @param email User email address
   * @param password User password
   * @returns JWT token if authentication is successful
   */
  async login(email: string, password: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: true },
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

  /**
   * Generates a JWT token for a newly registered user.
   * @param user User object with role information
   * @returns JWT token string
   */
  async register(user: User & { roles: Role }) {
    return this.generateToken(user);
  }

  /**
   * Generates and stores a password recovery code for a user.
   * Returns the code and user data (to be used externally for sending email).
   */
  async forgotPassword(email: string): Promise<{
    code: string;
    name: string;
    email: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found with this email.');
    }

    const code = generateCode(6);
    const codeHash = hashCode(code);

    await prisma.passwordReset.create({
      data: {
        userUuid: user.uuid,
        codeHash,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return {
      code, // ⚠️ só vai por email
      name: user.name || 'User',
      email: user.email,
    };
  }

  /**
   * Resets a user's password using a valid reset code.
   */
  async resetPassword(
    code: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const resets = await prisma.passwordReset.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    const reset = resets.find((r) => verifyCode(code, r.codeHash));

    if (!reset) {
      throw new NotFoundException('Invalid or expired reset code.');
    }

    if (reset.attempts >= 5) {
      await prisma.passwordReset.update({
        where: { uuid: reset.uuid },
        data: {
          usedAt: new Date(),
        },
      });

      throw new UnauthorizedException(
        'Maximum attempts reached. Please request a new reset code.'
      );
    }

    const encryptedPassword = await generateHashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { uuid: reset.userUuid },
        data: {
          password: encryptedPassword,
        },
      }),
      prisma.passwordReset.update({
        where: { uuid: reset.uuid },
        data: {
          usedAt: new Date(),
        },
      }),
    ]);

    return { message: 'Password successfully reset.' };
  }
}
