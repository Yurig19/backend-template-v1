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
  @IsEnum(EnvironmentEnum)
  @IsNotEmpty()
  NODE_ENV: EnvironmentEnum;

  @IsString()
  @IsOptional()
  PORT?: string;

  //
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsString()
  @IsOptional()
  DB_PORT?: string;

  @IsString()
  @IsNotEmpty()
  DB_USER: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  //
  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsNotEmpty()
  CRYPTO_SECRET_KEY: string;

  //
  @IsString()
  @IsNotEmpty()
  ADMIN_NAME: string;

  @IsString()
  @IsNotEmpty()
  ADMIN_EMAIL: string;

  @IsString()
  @IsNotEmpty()
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
    console.error('❌ Erro na validação do .env:', errors);
    throw new Error('Configuração inválida!');
  }

  return validatedConfig;
}
