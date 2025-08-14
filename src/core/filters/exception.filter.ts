import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import { ErrorResponseDto } from '../enums/errors/dtos/error.dto';
import { AppError } from '../exceptions/app.error';

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
      statusMessage: 'Internal Server Error',
    };

    if (exception instanceof AppError) {
      console.log('AppError');
      errorResponse = {
        message: exception.message,
        statusCode: exception.statusCode,
        statusMessage: exception.statusText,
      };
    } else if (exception instanceof HttpException) {
      errorResponse = {
        message: exception.message,
        statusCode: exception.getStatus(),
        statusMessage: 'Http Exception',
      };
    } else if (exception instanceof Error) {
      errorResponse.message = exception.message;
    }

    const log = await this.prisma.logs.create({
      data: {
        error: errorResponse.message,
        statusCode: errorResponse.statusCode,
        statusText: errorResponse.statusMessage,
        method: request.method,
        path: request.url,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      },
    });

    if (!log) {
      console.log('error');
    }

    console.log(log);

    response.status(errorResponse.statusCode).json(errorResponse);
  }
}
