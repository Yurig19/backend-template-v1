import { SendEmailService } from '@/modules/emailTemplate/services/send-email.service';
import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../service/auth.service';
import { AuthForgotPasswordCommand } from './auth-forgot-password.command';

@CommandHandler(AuthForgotPasswordCommand)
export class AuthForgotPasswordHandle
  implements ICommandHandler<AuthForgotPasswordCommand>
{
  private readonly logger = new Logger(AuthForgotPasswordHandle.name);

  constructor(
    private readonly authService: AuthService,
    private readonly sendEmailService: SendEmailService,
    private readonly configService: ConfigService
  ) {}

  async execute(
    command: AuthForgotPasswordCommand
  ): Promise<{ message: string }> {
    try {
      const { email } = command;
      const { code, name } = await this.authService.forgotPassword(email);

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');

      await this.sendEmailService.sendTemplateEmail(email, 'ForgotPassword', {
        name,
        code,
        resetLink: `${frontendUrl}/reset-password?code=${code}`,
      });

      return { message: 'Password recovery email sent successfully.' };
    } catch (error) {
      this.logger.error('Failed to send password recovery email', error.stack);
      throw new InternalServerErrorException(
        'Failed to send password recovery email.'
      );
    }
  }
}
