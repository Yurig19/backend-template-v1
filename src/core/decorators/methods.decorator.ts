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
import {
  BadRequestErrorDto,
  ErrorResponseDto,
  ForbiddenErrorDto,
  InternalServerErrorDto,
  NotFoundErrorDto,
  UnauthorizedErrorDto,
} from '../enums/errors/dtos/error.dto';
import { HttpStatusCodeEnum } from '../enums/errors/statusCodeErrors.enum';
import { RoleEnum } from '../enums/role.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from './roles.decorator';

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
  roles?: RoleEnum[];
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
    roles,
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
      description: 'Bad Request',
      type: BadRequestErrorDto,
    })
  );

  decorators.push(
    ApiNotFoundResponse({
      description: 'Not Found',
      type: NotFoundErrorDto,
    })
  );

  decorators.push(
    ApiInternalServerErrorResponse({
      description: 'Internal Server Error',
      type: InternalServerErrorDto,
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
    if (roles && roles.length > 0) {
      decorators.push(UseGuards(JwtAuthGuard, RolesGuard));
      decorators.push(Roles(...opts.roles));
      decorators.push(
        ApiForbiddenResponse({
          description: 'Forbidden - User lacks required role',
          type: ForbiddenErrorDto,
        })
      );
    } else {
      decorators.push(UseGuards(JwtAuthGuard));
    }

    decorators.push(ApiBearerAuth());
    decorators.push(
      ApiUnauthorizedResponse({
        description: 'Unauthorized',
        type: UnauthorizedErrorDto,
      })
    );
  }

  decorators.push(HttpCode(successStatus));

  decorators.unshift(methodDecorator);

  return applyDecorators(...decorators);
}
