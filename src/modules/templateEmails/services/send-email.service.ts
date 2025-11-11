import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import * as nodemailer from 'nodemailer';

@Injectable()
export class SendEmailService {
  private transporter: nodemailer.Transporter;

  private readonly logger = new Logger(SendEmailService.name);

  private smtpHost = this.configService.get<string>('SMTP_HOST');
  private smtpPort = this.configService.get<number>('SMTP_PORT');
  private smtpSecure = this.configService.get<string>('SMTP_SECURE') === 'true';

  private smtpUser = this.configService.get<string>('SMTP_USER');
  private smtpPass = this.configService.get<string>('SMTP_PASS');

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.smtpHost,
      port: this.smtpPort,
      secure: this.smtpSecure,
      auth: {
        user: this.smtpUser,
        pass: this.smtpPass,
      },
    });

    this.transporter
      .verify()
      .then(() => this.logger.log('Conectado ao servidor SMTP ✅'))
      .catch((err) => {
        this.logger.error(
          `Erro ao conectar ao servidor SMTP (${this.smtpHost}:${this.smtpPort}) ❌`
        );
        this.logger.error(err);
      });
  }

  async confirmEmail(to: string, code: string): Promise<void> {
    const HTML = `
<!DOCTYPE html>
<html>

<head>
  <title>Bem vindo!</title>
</head>

<body>
  <h1>Olá, seja bem vindo! 👋</h1>
  <p>Você deu início ao cadastro em nossa plataforma, para prosseguir digite o código abaixo:</p>
  <p><strong>Código:</strong> ${code}</p>
  <br/>
  <p>.</p>
</body>

</html>
    `;

    await this.transporter.sendMail({
      from: `"No Reply" <${this.configService.get<string>('MAIL_FROM')}>`,
      to,
      subject: 'Boas vindas ao nosso APP!',
      html: HTML,
    });
  }

  async forgotPassword(email: string, code: string): Promise<void> {
    const HTML = `
<!DOCTYPE html>
<html>

<head>
  <title>Bem vindo!</title>
</head>

<body>
  <h3>Olá!</h3>
  <p>Você solicitou recuperação de senha, estamos enviando o código necessário para refefini-la.</p>
  <p><strong>Código:</strong> ${code}</p>
  <p>O código tem validade de 4 horas, após esse periodo, será necessário gerar um novo.</p>
</body>

</html>
    `;

    await this.transporter.sendMail({
      from: `"No Reply" <${this.configService.get<string>('MAIL_FROM')}>`,
      to: email,
      subject: 'Recuperação de senha.',
      html: HTML,
    });
  }
}
