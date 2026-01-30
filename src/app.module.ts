import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppConfigModule } from './core/config/env';
import { BaseExceptionFilter } from './core/filters/exception.filter';
import { AuditInterceptor } from './core/interceptors/audits.interceptor';
import { AuthModule } from './modules/_auth/auth.module';
import { InitModule } from './modules/_init/init.module';
import { AuditsModule } from './modules/audits/audits.module';
import { EmailTemplateModule } from './modules/emailTemplate/templateEmail.module';
import { LogsModule } from './modules/errorLogs/logs.module';
import { FileModule } from './modules/files/files.module';
import { UserModule } from './modules/users/users.module';

@Module({
  imports: [
    AppConfigModule,
    CqrsModule,

    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    InitModule,
    EmailTemplateModule,

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
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [CqrsModule],
})
export class AppModule {}
