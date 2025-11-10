import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    type: String,
    description: 'Detailed description of the error',
    examples: {
      BadRequest: {
        summary: 'Bad Request',
        value: 'Invalid input data',
      },
      Unauthorized: {
        summary: 'Unauthorized',
        value: 'Missing or invalid token',
      },
      Forbidden: {
        summary: 'Forbidden',
        value: 'You do not have permission to access this resource',
      },
      NotFound: {
        summary: 'Not Found',
        value: 'The requested resource was not found',
      },
      InternalServerError: {
        summary: 'Internal Server Error',
        value: 'An unexpected error occurred',
      },
    },
  })
  message: string;

  @ApiProperty({
    type: Number,
    description: 'HTTP status code of the error',
    examples: {
      BadRequest: { summary: '400', value: 400 },
      Unauthorized: { summary: '401', value: 401 },
      Forbidden: { summary: '403', value: 403 },
      NotFound: { summary: '404', value: 404 },
      InternalServerError: { summary: '500', value: 500 },
    },
  })
  statusCode: number;

  @ApiProperty({
    type: String,
    description: 'HTTP status message associated with the error',
    examples: {
      BadRequest: { summary: 'BAD_REQUEST', value: 'BAD_REQUEST' },
      Unauthorized: { summary: 'UNAUTHORIZED', value: 'UNAUTHORIZED' },
      Forbidden: { summary: 'FORBIDDEN', value: 'FORBIDDEN' },
      NotFound: { summary: 'NOT_FOUND', value: 'NOT_FOUND' },
      InternalServerError: {
        summary: 'INTERNAL_SERVER_ERROR',
        value: 'INTERNAL_SERVER_ERROR',
      },
    },
  })
  error: string;
}

export class BadRequestErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 'Invalid input data' })
  message: string = 'Invalid input data';

  @ApiProperty({ example: 400 })
  statusCode: number = 400;

  @ApiProperty({ example: 'BAD_REQUEST' })
  error: string = 'BAD_REQUEST';
}

export class UnauthorizedErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 'Missing or invalid token' })
  message: string = 'Missing or invalid token';

  @ApiProperty({ example: 401 })
  statusCode: number = 401;

  @ApiProperty({ example: 'UNAUTHORIZED' })
  error: string = 'UNAUTHORIZED';
}

export class ForbiddenErrorDto extends ErrorResponseDto {
  @ApiProperty({
    example: 'You do not have permission to access this resource',
  })
  message: string = 'You do not have permission to access this resource';

  @ApiProperty({ example: 403 })
  statusCode: number = 403;

  @ApiProperty({ example: 'FORBIDDEN' })
  error: string = 'FORBIDDEN';
}

export class NotFoundErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 'The requested resource was not found' })
  message: string = 'The requested resource was not found';

  @ApiProperty({ example: 404 })
  statusCode: number = 404;

  @ApiProperty({ example: 'NOT_FOUND' })
  error: string = 'NOT_FOUND';
}

export class InternalServerErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 'An unexpected error occurred' })
  message: string = 'An unexpected error occurred';

  @ApiProperty({ example: 500 })
  statusCode: number = 500;

  @ApiProperty({ example: 'INTERNAL_SERVER_ERROR' })
  error: string = 'INTERNAL_SERVER_ERROR';
}
