import { EnvironmentEnum } from '@/core/enums/environment.enum';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class EnvSchema {
  // ======================
  // ENV
  // ======================
  @IsEnum(EnvironmentEnum, {
    message:
      'NODE_ENV must be one of: development, production, test, homologation.',
  })
  @IsNotEmpty({ message: 'NODE_ENV is required.' })
  NODE_ENV: EnvironmentEnum;

  // ======================
  // APP
  // ======================
  @IsOptional()
  @IsString({ message: 'PORT must be a string.' })
  PORT?: string;

  @IsOptional()
  @IsString({ message: 'API_VERSION must be a string.' })
  API_VERSION?: string;

  @IsOptional()
  @IsString({ message: 'FRONTEND_URL must be a string.' })
  FRONTEND_URL?: string;

  // ======================
  // DATABASE
  // ======================
  @IsString({ message: 'DB_HOST must be a string.' })
  @IsNotEmpty({ message: 'DB_HOST is required.' })
  DB_HOST: string;

  @IsString({ message: 'DB_PORT must be a string.' })
  @IsNotEmpty({ message: 'DB_PORT is required.' })
  DB_PORT: string;

  @IsString({ message: 'DB_USER must be a string.' })
  @IsNotEmpty({ message: 'DB_USER is required.' })
  DB_USER: string;

  @IsString({ message: 'DB_PASSWORD must be a string.' })
  @IsNotEmpty({ message: 'DB_PASSWORD is required.' })
  DB_PASSWORD: string;

  @IsString({ message: 'DB_NAME must be a string.' })
  @IsNotEmpty({ message: 'DB_NAME is required.' })
  DB_NAME: string;

  @IsString({ message: 'DATABASE_URL must be a string.' })
  @IsNotEmpty({ message: 'DATABASE_URL is required.' })
  DATABASE_URL: string;

  // ======================
  // SECURITY
  // ======================
  @IsString({ message: 'JWT_SECRET must be a string.' })
  @IsNotEmpty({ message: 'JWT_SECRET is required.' })
  JWT_SECRET: string;

  @IsString({ message: 'CODE_SECRET must be a string.' })
  @IsNotEmpty({ message: 'CODE_SECRET is required.' })
  CODE_SECRET: string;

  // ======================
  // FLAGS
  // ======================
  @IsOptional()
  @IsBoolean({ message: 'ENABLE_HTTPS must be a boolean.' })
  ENABLE_HTTPS?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'ENABLE_NGROK must be a boolean.' })
  ENABLE_NGROK?: boolean;
}
