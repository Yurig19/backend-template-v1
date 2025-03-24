import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, BaseExceptionFilter } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';

// Módulos da aplicação
import { UserModule } from './domain/users/users.module';
import { AuthModule } from './domain/_auth/auth.module';
import { InitModule } from './domain/_init/init.module';

// Validações
import { validateEnv } from './core/validations/env.validation';
import { AuditInterceptor } from './core/interceptors/audits.interceptor';
import { PrismaService } from 'prisma/prisma.service';
import { AuditsModule } from './domain/audits/audits.module';
import { LogsModule } from './domain/errorLogs/logs.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => validateEnv(process.env)],
    }),
    CqrsModule,
    InitModule,

    //
    AuthModule,

    //
    UserModule,

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
    PrismaService,
  ],
  exports: [CqrsModule],
})
export class AppModule {}
