import { RolesModule } from '@/modules/roles/roles.module';
import { UsersController } from '@/modules/users/controllers/users.controller';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SendEmailService } from '../services/send-email.service';

@Module({
  imports: [CqrsModule, RolesModule],
  controllers: [UsersController],
  providers: [
    SendEmailService,
    //
  ],
  exports: [SendEmailService],
})
export class TemplateEmailModule {}
