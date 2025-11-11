import {
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../service/auth.service';
import { AuthResetPasswordCommand } from './auth-reset-password.command';

@CommandHandler(AuthResetPasswordCommand)
export class AuthResetPasswordHandle
  implements ICommandHandler<AuthResetPasswordCommand>
{
  private readonly logger = new Logger(AuthResetPasswordHandle.name);

  constructor(private readonly authService: AuthService) {}

  async execute(
    command: AuthResetPasswordCommand
  ): Promise<{ message: string }> {
    try {
      const { code, newPassword } = command.body;

      return await this.authService.resetPassword(code, newPassword);
    } catch (error) {
      this.logger.error(`Password reset failed: ${error.message}`, error.stack);

      if (error instanceof NotFoundException) {
        throw new NotFoundException('Invalid or expired reset code.');
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while resetting the password. Please try again later.'
      );
    }
  }
}
