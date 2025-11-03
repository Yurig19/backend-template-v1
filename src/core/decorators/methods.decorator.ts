import {
  BadRequestException,
  HttpCode,
  Patch,
  UseGuards,
  UseInterceptors,
  applyDecorators,
} from '@nestjs/common';
import { Delete, Get, Post, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../enums/errors/dtos/error.dto';
import { HttpStatusCodeEnum } from '../enums/errors/statusCodeErrors.enum';
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

  const successStatus =
    method === 'POST' ? HttpStatusCodeEnum.CREATED : HttpStatusCodeEnum.OK;
  const successDesc = successDescription ?? 'Operation completed successfully';
  const errorDesc = errorDescription ?? 'An error occurred';

  decorators.push(
    ApiOperation({
      summary,
      operationId,
      description,
    })
  );

  if (method === 'POST') {
    decorators.push(
      ApiCreatedResponse({
        description: successDesc,
        type: responseType,
      })
    );
  } else {
    decorators.push(
      ApiOkResponse({
        description: successDesc,
        type: responseType,
      })
    );
  }

  decorators.push(
    ApiBadRequestResponse({
      description: errorDesc,
      type: ErrorResponseDto,
      schema: {
        example: {
          message: 'Invalid input data',
          statusCode: 400,
          error: 'BAD_REQUEST',
        },
      },
    })
  );

  decorators.push(
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: ErrorResponseDto,
      schema: {
        example: {
          message: 'Missing or invalid token',
          statusCode: 401,
          error: 'UNAUTHORIZED',
        },
      },
    })
  );

  decorators.push(
    ApiForbiddenResponse({
      description: 'Forbidden',
      type: ErrorResponseDto,
      schema: {
        example: {
          message: 'You do not have permission to access this resource',
          statusCode: 403,
          error: 'FORBIDDEN',
        },
      },
    })
  );

  decorators.push(
    ApiNotFoundResponse({
      description: 'Resource not found',
      type: ErrorResponseDto,
      schema: {
        example: {
          message: 'The requested resource was not found',
          statusCode: 404,
          error: 'NOT_FOUND',
        },
      },
    })
  );

  decorators.push(
    ApiInternalServerErrorResponse({
      description: 'Internal server error',
      type: ErrorResponseDto,
      schema: {
        example: {
          message: 'An unexpected error occurred',
          statusCode: 500,
          error: 'INTERNAL_SERVER_ERROR',
        },
      },
    })
  );

  if (bodyType && ['POST', 'PUT', 'PATCH'].includes(method)) {
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
      throw new BadRequestException('Invalid method');
  }

  if (isAuth) {
    decorators.push(UseGuards(JwtAuthGuard));
    decorators.push(ApiBearerAuth());
    decorators.push(
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
        type: ErrorResponseDto,
        schema: {
          example: {
            message: 'Missing or invalid token',
            statusCode: 401,
            error: 'UNAUTHORIZED',
          },
        },
      })
    );
  }

  decorators.push(HttpCode(successStatus));

  decorators.unshift(methodDecorator);

  return applyDecorators(...decorators);
}
