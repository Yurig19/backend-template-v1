import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  validateSync,
} from 'class-validator';
import { config } from 'dotenv';
import { EnvironmentEnum } from '../enums/environment.enum';

config();

class EnvVariables {
  //
  @IsEnum(EnvironmentEnum, {
    message: 'NODE_ENV must be one of: development, production, test.',
  })
  @IsNotEmpty({ message: 'NODE_ENV is required.' })
  NODE_ENV: EnvironmentEnum;

  @IsString({ message: 'PORT must be a string.' })
  @IsOptional()
  PORT?: string;

  //
  @IsString({ message: 'DB_HOST must be a string.' })
  @IsNotEmpty({ message: 'DB_HOST is required.' })
  DB_HOST: string;

  @IsString({ message: 'DB_PORT must be a string.' })
  @IsOptional()
  DB_PORT?: string;

  @IsString({ message: 'DB_USER must be a string.' })
  @IsNotEmpty({ message: 'DB_USER is required.' })
  DB_USER: string;

  @IsString({ message: 'DB_PASSWORD must be a string.' })
  @IsOptional()
  DB_PASSWORD?: string;

  @IsString({ message: 'DB_NAME must be a string.' })
  @IsNotEmpty({ message: 'DB_NAME is required.' })
  DB_NAME: string;

  @IsString({ message: 'DATABASE_URL must be a string.' })
  @IsNotEmpty({ message: 'DATABASE_URL is required.' })
  DATABASE_URL: string;

  //
  @IsString({ message: 'JWT_SECRET must be a string.' })
  @IsNotEmpty({ message: 'JWT_SECRET is required.' })
  JWT_SECRET: string;

  @IsString({ message: 'CRYPTO_SECRET_KEY must be a string.' })
  @IsNotEmpty({ message: 'CRYPTO_SECRET_KEY is required.' })
  CRYPTO_SECRET_KEY: string;

  //
  @IsString({ message: 'ADMIN_NAME must be a string.' })
  @IsNotEmpty({ message: 'ADMIN_NAME is required.' })
  ADMIN_NAME: string;

  @IsString({ message: 'ADMIN_EMAIL must be a string.' })
  @IsNotEmpty({ message: 'ADMIN_EMAIL is required.' })
  ADMIN_EMAIL: string;

  @IsString({ message: 'ADMIN_PASSWORD must be a string.' })
  @IsNotEmpty({ message: 'ADMIN_PASSWORD is required.' })
  ADMIN_PASSWORD: string;
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export function validateEnv(config: Record<string, any>) {
  const validatedConfig = plainToInstance(EnvVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    console.error('❌ Error validating .env:', errors);
    throw new Error('Invalid configuration!');
  }

  return validatedConfig;
}
