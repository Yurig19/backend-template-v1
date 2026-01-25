import { Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ValidationError, validateSync } from 'class-validator';
import { EnvSchema } from './env.schema';

const logger = new Logger('EnvValidation');

const formatErrors = (errors: ValidationError[]) => {
  return errors.flatMap((error) => {
    if (!error.constraints) return [];

    return Object.values(error.constraints).map(
      (message) => `• ${error.property}: ${message}`
    );
  });
};

export const validateEnv = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvSchema, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const messages = formatErrors(errors);

    logger.error(
      `❌ Invalid environment configuration:\n${messages.join('\n')}`
    );

    throw new Error('Environment validation failed');
  }

  logger.log('✅ Environment variables successfully validated');

  return validatedConfig;
};
