import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TemplateEmailController } from './controllers/tempalteEmail.controller';
import { SendEmailService } from './services/send-email.service';
import { EmailTemplateService } from './services/templateEmail.service';

@Module({
  imports: [CqrsModule],
  controllers: [TemplateEmailController],
  providers: [
    SendEmailService,
    EmailTemplateService,
    //
  ],
  exports: [SendEmailService, EmailTemplateService],
})
export class EmailTemplateModule {}
