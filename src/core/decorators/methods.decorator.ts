import {
  Patch,
  UseGuards,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { Delete, Get, Post, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../enums/errors/dtos/error.dto';
import { HttpStatusCodeEnum } from '../enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '../enums/errors/statusTextError.enum';
import { AppError } from '../errors/app.error';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface ApiEndpointOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  responseType: any;
  summary: string;
  operationId: string;
  successDescription?: string;
  errorDescription?: string;
  isAuth?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  bodyType?: any;
  isFile?: boolean;
}

export function ApiEndpoint(options: ApiEndpointOptions) {
  let methodDecorator: MethodDecorator;
  const decorators: MethodDecorator[] = [];

  const successStatus = options.method === 'POST' ? 201 : 200;

  const successDesc =
    options.successDescription ?? 'Operation completed successfully';
  const errorDesc = options.errorDescription ?? 'An error occurred';

  decorators.push(
    ApiOperation({ summary: options.summary, operationId: options.operationId })
  );

  decorators.push(
    ApiResponse({
      status: 400,
      description: errorDesc,
      type: ErrorResponseDto,
    })
  );

  decorators.push(
    ApiResponse({
      status: successStatus,
      description: successDesc,
      type: options.responseType,
    })
  );

  if (options.bodyType && ['POST', 'PUT'].includes(options.method)) {
    decorators.push(ApiBody({ type: options.bodyType }));
  }

  if (options.isFile) {
    decorators.push(ApiConsumes('multipart/form-data'));
    decorators.push(UseInterceptors(FileInterceptor('file')));

    if (options.bodyType) {
      decorators.push(ApiBody({ type: options.bodyType }));
    }
  }

  switch (options.method) {
    case 'GET':
      methodDecorator = Get(options.path);
      break;
    case 'POST':
      methodDecorator = Post(options.path);
      break;
    case 'PATCH':
      methodDecorator = Patch(options.path);
      break;
    case 'PUT':
      methodDecorator = Put(options.path);
      break;
    case 'DELETE':
      methodDecorator = Delete(options.path);
      break;

    default:
      throw new AppError({
        message: 'Invalid method',
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
  }

  if (options.isAuth) {
    decorators.push(UseGuards(JwtAuthGuard));
    decorators.push(ApiBearerAuth());
  }

  decorators.unshift(methodDecorator);

  return applyDecorators(...decorators);
}
