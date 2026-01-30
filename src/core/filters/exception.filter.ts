import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from 'generated/prisma/client';
import { ErrorResponseDto } from '../enums/errors/dtos/error.dto';
import { HttpStatusCodeEnum } from '../enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '../enums/errors/statusTextError.enum';
import { prisma } from '../lib/prisma';

@Injectable()
@Catch()
export class BaseExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BaseExceptionFilter.name);

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorResponse: ErrorResponseDto = {
      message: 'An unexpected error occurred',
      statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
      error: HttpStatusTextEnum.INTERNAL_SERVER_ERROR,
    };

    let isHandled = true;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      errorResponse = this.handlePrismaError(exception);
    } else if (exception instanceof BadRequestException) {
      errorResponse = this.formatHttpException(
        exception,
        HttpStatusTextEnum.BAD_REQUEST
      );
    } else if (exception instanceof UnauthorizedException) {
      errorResponse = this.formatHttpException(
        exception,
        HttpStatusTextEnum.UNAUTHORIZED
      );
    } else if (exception instanceof ForbiddenException) {
      errorResponse = this.formatHttpException(
        exception,
        HttpStatusTextEnum.FORBIDDEN
      );
    } else if (exception instanceof NotFoundException) {
      errorResponse = this.formatHttpException(
        exception,
        HttpStatusTextEnum.NOT_FOUND
      );
    } else if (exception instanceof ConflictException) {
      errorResponse = this.formatHttpException(
        exception,
        HttpStatusTextEnum.CONFLICT
      );
    } else if (exception instanceof InternalServerErrorException) {
      errorResponse = this.formatHttpException(
        exception,
        HttpStatusTextEnum.INTERNAL_SERVER_ERROR
      );
    } else if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const errorText = this.getErrorTextFromStatusCode(statusCode);
      errorResponse = this.formatHttpException(exception, errorText);
    } else if (exception instanceof Error) {
      isHandled = false;
      errorResponse = {
        message: exception.message,
        statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
        error: HttpStatusTextEnum.INTERNAL_SERVER_ERROR,
      };

      this.logUnhandledError(exception, request);
    } else {
      isHandled = false;
      this.logUnknownError(exception, request);
    }

    try {
      await prisma.errorLog.create({
        data: {
          error: errorResponse.message,
          statusCode: errorResponse.statusCode,
          statusText: errorResponse.error,
          method: request.method,
          path: request.url,
          ip: request.ip,
          userAgent: request.headers['user-agent'],
        },
      });
    } catch (logError) {
      this.logger.error('Failed to persist error log', logError as Error);
    }

    if (!isHandled) {
      this.logger.error(
        `Unhandled error occurred at ${request.method} ${request.url}`
      );
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private logUnhandledError(error: Error, request: Request): void {
    this.logger.error('=====================================');
    this.logger.error('🔴 UNHANDLED ERROR DETECTED 🔴');
    this.logger.error('=====================================');
    this.logger.error(`Error Type: ${error.constructor.name}`);
    this.logger.error(`Message: ${error.message}`);
    this.logger.error(`Request: ${request.method} ${request.url}`);
    this.logger.error(`IP: ${request.ip}`);
    this.logger.error(`User-Agent: ${request.headers['user-agent']}`);

    if (request.body && Object.keys(request.body).length > 0) {
      this.logger.error(
        `Request Body: ${JSON.stringify(request.body, null, 2)}`
      );
    }

    if (request.params && Object.keys(request.params).length > 0) {
      this.logger.error(
        `Request Params: ${JSON.stringify(request.params, null, 2)}`
      );
    }

    if (request.query && Object.keys(request.query).length > 0) {
      this.logger.error(
        `Request Query: ${JSON.stringify(request.query, null, 2)}`
      );
    }

    this.logger.error('Stack Trace:');
    this.logger.error(error.stack || 'No stack trace available');

    this.logger.error('Full Error Object:');
    this.logger.error(
      JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
    );

    this.logger.error('=====================================');
  }

  private logUnknownError(exception: unknown, request: Request): void {
    this.logger.error('=====================================');
    this.logger.error('🔴 UNKNOWN ERROR TYPE DETECTED 🔴');
    this.logger.error('=====================================');
    this.logger.error(`Request: ${request.method} ${request.url}`);
    this.logger.error(`Exception Type: ${typeof exception}`);
    this.logger.error('Exception Details:');

    try {
      this.logger.error(JSON.stringify(exception, null, 2));
    } catch {
      this.logger.error(String(exception));
    }

    this.logger.error('=====================================');
  }

  private handlePrismaError(
    error: Prisma.PrismaClientKnownRequestError
  ): ErrorResponseDto {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const meta = error.meta as Record<string, any> | undefined;

    switch (error.code) {
      case 'P2000':
        return {
          statusCode: HttpStatusCodeEnum.BAD_REQUEST,
          error: HttpStatusTextEnum.BAD_REQUEST,
          message: `The value provided for the field "${
            meta?.column_name ?? 'unknown'
          }" is too long.`,
        };

      case 'P2001':
        return {
          statusCode: HttpStatusCodeEnum.NOT_FOUND,
          error: HttpStatusTextEnum.NOT_FOUND,
          message: 'The requested record could not be found.',
        };

      case 'P2002':
        return {
          statusCode: HttpStatusCodeEnum.CONFLICT,
          error: HttpStatusTextEnum.CONFLICT,
          message: `A record with the same ${
            meta?.target?.join(', ') ?? 'unique field'
          } already exists.`,
        };

      case 'P2003':
        return {
          statusCode: HttpStatusCodeEnum.BAD_REQUEST,
          error: HttpStatusTextEnum.BAD_REQUEST,
          message: `Invalid reference for field "${
            meta?.field_name ?? 'unknown'
          }".`,
        };

      case 'P2011':
        return {
          statusCode: HttpStatusCodeEnum.BAD_REQUEST,
          error: HttpStatusTextEnum.BAD_REQUEST,
          message: `A required field is missing: ${
            meta?.constraint ?? 'unknown'
          }.`,
        };

      case 'P2012':
        return {
          statusCode: HttpStatusCodeEnum.BAD_REQUEST,
          error: HttpStatusTextEnum.BAD_REQUEST,
          message: `A required value was not provided for "${
            meta?.path ?? 'unknown'
          }".`,
        };

      case 'P2020':
        return {
          statusCode: HttpStatusCodeEnum.BAD_REQUEST,
          error: HttpStatusTextEnum.BAD_REQUEST,
          message: `The provided value is out of range. ${meta?.details ?? ''}`,
        };

      case 'P2025':
        return {
          statusCode: HttpStatusCodeEnum.NOT_FOUND,
          error: HttpStatusTextEnum.NOT_FOUND,
          message:
            'The operation failed because one or more required records were not found.',
        };

      default:
        this.logger.error('=====================================');
        this.logger.error('🔴 UNHANDLED PRISMA ERROR CODE 🔴');
        this.logger.error('=====================================');
        this.logger.error(`Prisma Error Code: ${error.code}`);
        this.logger.error(`Message: ${error.message}`);
        this.logger.error(`Meta: ${JSON.stringify(meta, null, 2)}`);
        this.logger.error(`Client Version: ${error.clientVersion}`);
        this.logger.error('=====================================');

        return {
          statusCode: HttpStatusCodeEnum.INTERNAL_SERVER_ERROR,
          error: HttpStatusTextEnum.INTERNAL_SERVER_ERROR,
          message: 'A database error occurred. Please try again later.',
        };
    }
  }

  private formatHttpException(
    exception: HttpException,
    errorType: HttpStatusTextEnum
  ): ErrorResponseDto {
    const status = exception.getStatus();
    const res = exception.getResponse();

    let message: string;

    if (typeof res === 'string') {
      message = res;
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } else if (typeof res === 'object' && (res as any).message) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      message = Array.isArray((res as any).message)
        ? // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (res as any).message.join(', ')
        : // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          (res as any).message;
    } else {
      message = exception.message;
    }

    return {
      message,
      statusCode: status,
      error: errorType,
    };
  }

  private getErrorTextFromStatusCode(statusCode: number): HttpStatusTextEnum {
    const mapping: Record<number, HttpStatusTextEnum> = {
      [HttpStatusCodeEnum.OK]: HttpStatusTextEnum.OK,
      [HttpStatusCodeEnum.CREATED]: HttpStatusTextEnum.CREATED,
      [HttpStatusCodeEnum.ACCEPTED]: HttpStatusTextEnum.ACCEPTED,
      [HttpStatusCodeEnum.NO_CONTENT]: HttpStatusTextEnum.NO_CONTENT,
      [HttpStatusCodeEnum.MOVED_PERMANENTLY]:
        HttpStatusTextEnum.MOVED_PERMANENTLY,
      [HttpStatusCodeEnum.FOUND]: HttpStatusTextEnum.FOUND,
      [HttpStatusCodeEnum.SEE_OTHER]: HttpStatusTextEnum.SEE_OTHER,
      [HttpStatusCodeEnum.NOT_MODIFIED]: HttpStatusTextEnum.NOT_MODIFIED,
      [HttpStatusCodeEnum.TEMPORARY_REDIRECT]:
        HttpStatusTextEnum.TEMPORARY_REDIRECT,
      [HttpStatusCodeEnum.PERMANENT_REDIRECT]:
        HttpStatusTextEnum.PERMANENT_REDIRECT,
      [HttpStatusCodeEnum.BAD_REQUEST]: HttpStatusTextEnum.BAD_REQUEST,
      [HttpStatusCodeEnum.UNAUTHORIZED]: HttpStatusTextEnum.UNAUTHORIZED,
      [HttpStatusCodeEnum.FORBIDDEN]: HttpStatusTextEnum.FORBIDDEN,
      [HttpStatusCodeEnum.NOT_FOUND]: HttpStatusTextEnum.NOT_FOUND,
      [HttpStatusCodeEnum.METHOD_NOT_ALLOWED]:
        HttpStatusTextEnum.METHOD_NOT_ALLOWED,
      [HttpStatusCodeEnum.REQUEST_TIMEOUT]: HttpStatusTextEnum.REQUEST_TIMEOUT,
      [HttpStatusCodeEnum.CONFLICT]: HttpStatusTextEnum.CONFLICT,
      [HttpStatusCodeEnum.PAYLOAD_TOO_LARGE]:
        HttpStatusTextEnum.PAYLOAD_TOO_LARGE,
      [HttpStatusCodeEnum.UNSUPPORTED_MEDIA_TYPE]:
        HttpStatusTextEnum.UNSUPPORTED_MEDIA_TYPE,
      [HttpStatusCodeEnum.UNPROCESSABLE_ENTITY]:
        HttpStatusTextEnum.UNPROCESSABLE_ENTITY,
      [HttpStatusCodeEnum.TOO_MANY_REQUESTS]:
        HttpStatusTextEnum.TOO_MANY_REQUESTS,
      [HttpStatusCodeEnum.INTERNAL_SERVER_ERROR]:
        HttpStatusTextEnum.INTERNAL_SERVER_ERROR,
      [HttpStatusCodeEnum.NOT_IMPLEMENTED]: HttpStatusTextEnum.NOT_IMPLEMENTED,
      [HttpStatusCodeEnum.BAD_GATEWAY]: HttpStatusTextEnum.BAD_GATEWAY,
      [HttpStatusCodeEnum.SERVICE_UNAVAILABLE]:
        HttpStatusTextEnum.SERVICE_UNAVAILABLE,
      [HttpStatusCodeEnum.GATEWAY_TIMEOUT]: HttpStatusTextEnum.GATEWAY_TIMEOUT,
    };

    return mapping[statusCode] || HttpStatusTextEnum.INTERNAL_SERVER_ERROR;
  }
}
