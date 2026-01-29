import { handlePrismaError } from '@/core/errors/helpers/prisma-error.helper';
import { prisma } from '@/core/lib/prisma';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SendEmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(SendEmailService.name);

  constructor(
    private readonly configService: ConfigService
    // private readonly prisma: PrismaService
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    this.transporter
      .verify()
      .then(() => this.logger.log('✅ Connected to SMTP server'))
      .catch((err) => {
        this.logger.error('❌ Failed to connect to SMTP server', err);
      });
  }

  /**
   * Sends an email with the specified content.
   * @param to Recipient email address
   * @param subject Email subject line
   * @param html HTML content of the email
   * @param text Plain text version of the email (optional)
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"No Reply" <${this.configService.get<string>('MAIL_FROM')}>`,
        to,
        subject,
        html,
        text,
      });

      this.logger.log(`✅ Email successfully sent to: ${to}`);
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${to}:`, error);
      throw new BadRequestException(`Failed to send email to ${to}.`);
    }
  }

  /**
   * Sends an email based on a stored template, replacing variables dynamically.
   * @param to Recipient email address
   * @param templateName Template name (as saved in DB)
   * @param variables Key-value pairs to replace placeholders in the template
   */
  async sendTemplateEmail(
    to: string,
    templateName: string,
    variables: Record<string, string>
  ): Promise<void> {
    try {
      const template = await prisma.emailTemplate.findUnique({
        where: { name: templateName },
      });

      if (!template) {
        throw new NotFoundException(
          `Email template "${templateName}" not found.`
        );
      }

      let htmlContent = template.bodyHtml;
      let textContent = template.bodyText || '';

      for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        htmlContent = htmlContent.replace(regex, value);
        textContent = textContent.replace(regex, value);
      }

      await this.sendEmail(to, template.subject, htmlContent, textContent);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      handlePrismaError(error);
    }
  }
}
