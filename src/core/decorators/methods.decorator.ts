import { UseGuards, applyDecorators } from '@nestjs/common';
import { Delete, Get, Post, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../enums/errors/dtos/error.dto';
import { HttpStatusCodeEnum } from '../enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '../enums/errors/statusTextError.enum';
import { AppError } from '../errors/app.error';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface ApiEndpointOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  responseType: any;
  summary: string;
  successDescription: string;
  errorDescription: string;
  isAuth?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  bodyType?: any;
}

export function ApiEndpoint(options: ApiEndpointOptions) {
  let methodDecorator: MethodDecorator;
  const decorators: MethodDecorator[] = [
    ApiOperation({ summary: options.summary }),
    ApiResponse({
      status: 400,
      description: options.errorDescription,
      type: ErrorResponseDto,
    }),
  ];

  if (options.method === 'POST') {
    decorators.push(
      ApiResponse({
        status: 201,
        description: options.successDescription,
        type: options.responseType,
      })
    );
  } else {
    decorators.push(
      ApiResponse({
        status: 200,
        description: options.successDescription,
        type: options.responseType,
      })
    );
  }

  if (
    options.bodyType &&
    (options.method === 'POST' || options.method === 'PUT')
  ) {
    decorators.push(ApiBody({ type: options.bodyType }));
  }

  switch (options.method) {
    case 'GET':
      methodDecorator = Get(options.path);
      break;
    case 'POST':
      methodDecorator = Post(options.path);
      break;
    case 'PUT':
      methodDecorator = Put(options.path);
      break;
    case 'DELETE':
      methodDecorator = Delete(options.path);
      break;
    default:
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        'Método HTTP inválido'
      );
  }

  if (options.isAuth) {
    decorators.push(UseGuards(JwtAuthGuard));
    decorators.push(ApiBearerAuth());
  }

  decorators.unshift(methodDecorator);

  return applyDecorators(...decorators);
}
