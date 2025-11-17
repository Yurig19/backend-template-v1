import {
  BadRequestException,
  HttpCode,
  Patch,
  UseGuards,
  applyDecorators,
} from '@nestjs/common';
import { Delete, Get, Post, Put } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  BadRequestErrorDto,
  ConflictErrorDto,
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
import { AnyFileUpload, AudioUpload, VideoUpload } from './upload.decorator';

interface QueryOption {
  name: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  type: any;
  required?: boolean;
  description?: string;
}

interface ApiEndpointOptions {
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  path: string;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  responseType: any;
  summary: string;
  description: string;
  operationId: string;
  successDescription?: string;
  isAuth?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  bodyType?: any;
  isFile?: boolean | 'audio' | 'video' | 'any';
  roles?: RoleEnum[];
  queries?: QueryOption[];
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
    isAuth,
    isFile,
    successDescription,
    roles,
    queries,
  } = opts;

  const successStatus =
    method === 'POST' ? HttpStatusCodeEnum.CREATED : HttpStatusCodeEnum.OK;
  const successDesc = successDescription ?? 'Operation completed successfully';

  decorators.push(
    ApiOperation({
      summary,
      operationId,
      description,
      ...(isAuth && {
        security: [{ 'access-token': [] }],
      }),
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

  if (['POST', 'PUT', 'PATCH'].includes(method)) {
    decorators.push(
      ApiConflictResponse({
        description:
          'Conflict - Resource already exists or violates unique constraint',
        type: ConflictErrorDto,
      })
    );
  }

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
    switch (isFile) {
      case 'audio':
        decorators.push(AudioUpload());
        break;
      case 'video':
        decorators.push(VideoUpload());
        break;
      default:
        decorators.push(AnyFileUpload());
        break;
    }
  }

  if (queries && queries.length > 0) {
    for (const q of opts.queries) {
      decorators.push(
        ApiQuery({
          name: q.name,
          type: q.type,
          required: q.required ?? false,
          description: q.description,
        })
      );
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
      console.log(roles);
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
