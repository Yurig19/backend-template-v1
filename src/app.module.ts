import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, BaseExceptionFilter } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from './core/database/prisma.module';
import { AuditInterceptor } from './core/interceptors/audits.interceptor';
import { validateEnv } from './core/validations/env.validation';
import { AuthModule } from './modules/_auth/auth.module';
import { InitModule } from './modules/_init/init.module';
import { AuditsModule } from './modules/audits/audits.module';
import { EmailTemplateModule } from './modules/emailTemplate/templateEmail.module';
import { LogsModule } from './modules/errorLogs/logs.module';
import { FileModule } from './modules/files/files.module';
import { UserModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => validateEnv(process.env)],
    }),
    CqrsModule,
    PrismaModule,
    InitModule,

    //
    UserModule,
    AuthModule,

    //
    FileModule,
    EmailTemplateModule,

    //
    AuditsModule,
    LogsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: BaseExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
  exports: [CqrsModule],
})
export class AppModule {}
