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
  description: string;
  operationId: string;
  successDescription?: string;
  errorDescription?: string;
  isAuth?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  bodyType?: any;
  isFile?: boolean;
}

export function ApiEndpoint(opts: ApiEndpointOptions) {
  let methodDecorator: MethodDecorator;
  const decorators: MethodDecorator[] = [];

  const {
    description,
    method,
    operationId,
    path,
    responseType,
    summary,
    bodyType,
    errorDescription,
    isAuth,
    isFile,
    successDescription,
  } = opts;

  const successStatus = method === 'POST' ? 201 : 200;

  const successDesc = successDescription ?? 'Operation completed successfully';
  const errorDesc = errorDescription ?? 'An error occurred';

  decorators.push(
    ApiOperation({
      summary: summary,
      operationId: operationId,
      description: description,
    })
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
      type: responseType,
    })
  );

  if (bodyType && ['POST', 'PUT'].includes(method)) {
    decorators.push(ApiBody({ type: bodyType }));
  }

  if (isFile) {
    decorators.push(ApiConsumes('multipart/form-data'));
    decorators.push(UseInterceptors(FileInterceptor('file')));

    if (bodyType) {
      decorators.push(ApiBody({ type: bodyType }));
    }
  }

  switch (method) {
    case 'GET':
      methodDecorator = Get(path);
      break;
    case 'POST':
      methodDecorator = Post(path);
      break;
    case 'PATCH':
      methodDecorator = Patch(path);
      break;
    case 'PUT':
      methodDecorator = Put(path);
      break;
    case 'DELETE':
      methodDecorator = Delete(path);
      break;

    default:
      throw new AppError({
        message: 'Invalid method',
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
  }

  if (isAuth) {
    decorators.push(UseGuards(JwtAuthGuard));
    decorators.push(ApiBearerAuth());

    decorators.push(
      ApiResponse({
        status: 401,
        description: 'Unauthorized',
        type: ErrorResponseDto,
      })
    );
  }

  decorators.unshift(methodDecorator);

  return applyDecorators(...decorators);
}
