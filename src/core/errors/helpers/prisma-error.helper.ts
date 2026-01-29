import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Prisma } from 'generated/prisma/client';

const logger = new Logger('PrismaErrorHelper');

export function handlePrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const meta = error.meta as Record<string, any>;

    switch (error.code) {
      case 'P2000':
        throw new BadRequestException(
          `The value provided for the field "${meta?.column_name ?? 'unknown'}" is too long.`
        );

      case 'P2001':
        throw new BadRequestException(
          'The requested record could not be found.'
        );

      case 'P2002':
        throw new ConflictException(
          `A record with the same ${meta?.target?.join(', ') ?? 'unique field'} already exists.`
        );

      case 'P2003':
        throw new BadRequestException(
          `Invalid reference for field "${meta?.field_name ?? 'unknown'}".`
        );

      case 'P2011':
        throw new BadRequestException(
          `A required field is missing: ${meta?.constraint ?? 'unknown'}.`
        );

      case 'P2012':
        throw new BadRequestException(
          `A required value was not provided for "${meta?.path ?? 'unknown'}".`
        );

      case 'P2020':
        throw new BadRequestException(
          `The provided value is out of range. ${meta?.details ?? ''}`
        );

      case 'P2025':
        throw new BadRequestException(
          'The operation failed because one or more required records were not found.'
        );

      default:
        logger.error(
          `Unhandled Prisma error code: ${error.code}`,
          JSON.stringify(meta)
        );

        throw new InternalServerErrorException(
          'A database error occurred. Please try again later.'
        );
    }
  }

  logger.error('Unexpected error', error);
  throw new InternalServerErrorException(
    'An unexpected server error occurred.'
  );
}
