import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from '../database/prisma.service';
import { ErrorResponseDto } from '../enums/errors/dtos/error.dto';

@Injectable()
@Catch()
export class BaseExceptionFilter implements ExceptionFilter {
  constructor(private readonly prisma: PrismaService) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let errorResponse: ErrorResponseDto = {
      message: 'An unexpected error occurred',
      statusCode: 500,
      error: 'INTERNAL_SERVER_ERROR',
    };

    if (exception instanceof BadRequestException) {
      errorResponse = this.formatHttpException(exception, 'BAD_REQUEST');
    } else if (exception instanceof UnauthorizedException) {
      errorResponse = this.formatHttpException(exception, 'UNAUTHORIZED');
    } else if (exception instanceof ForbiddenException) {
      errorResponse = this.formatHttpException(exception, 'FORBIDDEN');
    } else if (exception instanceof NotFoundException) {
      errorResponse = this.formatHttpException(exception, 'NOT_FOUND');
    } else if (exception instanceof InternalServerErrorException) {
      errorResponse = this.formatHttpException(
        exception,
        'INTERNAL_SERVER_ERROR'
      );
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : Array.isArray((res as any)?.message)
            ? (res as any).message.join(', ')
            : (res as any)?.message || exception.message;

      errorResponse = {
        message,
        statusCode: status,
        error: exception.name.replace('Exception', '').toUpperCase(),
      };
    } else if (exception instanceof Error) {
      errorResponse = {
        message: exception.message,
        statusCode: 500,
        error: 'UNHANDLED_ERROR',
      };
    }

    try {
      await this.prisma.errorLog.create({
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
      console.error('Failed to log error:', logError);
    }

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  /**
   * Helper para formatar exceções HTTP padrão do NestJS
   */
  private formatHttpException(
    exception: HttpException,
    errorType: string
  ): ErrorResponseDto {
    const status = exception.getStatus();
    const res = exception.getResponse();

    let message: string;
    if (typeof res === 'string') {
      message = res;
    } else if (typeof res === 'object' && (res as any).message) {
      message = Array.isArray((res as any).message)
        ? (res as any).message.join(', ')
        : (res as any).message;
    } else {
      message = exception.message;
    }

    return {
      message,
      statusCode: status,
      error: errorType,
    };
  }
}
