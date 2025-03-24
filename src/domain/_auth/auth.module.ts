import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';

import { AuthService } from './service/auth.service';

import { AuthLoginHandler } from './use-cases/commands/auth-login.query';
import { AuthRegisterHandler } from './use-cases/commands/auth-register.handle';

import { UserModule } from '../users/users.module';
import { JwtStrategy } from 'src/core/strategies/jwt.strategy';

import { PrismaService } from 'prisma/prisma.service';

const handlers = [AuthLoginHandler, AuthRegisterHandler];

@Module({
  imports: [
    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1h' },
    }),
    ConfigModule.forRoot(),
    UserModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtStrategy, ...handlers],
  exports: [AuthService, JwtModule, JwtStrategy],
})
export class AuthModule {}
