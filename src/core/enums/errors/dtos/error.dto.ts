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
      PayloadTooLarge: {
        summary: 'Payload Too Large',
        value: 'File size exceeds the allowed limit',
      },
      UnsupportedMediaType: {
        summary: 'Unsupported Media Type',
        value: 'Invalid or unsupported file format',
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
      PayloadTooLarge: { summary: '413', value: 413 },
      UnsupportedMediaType: { summary: '415', value: 415 },
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
      PayloadTooLarge: {
        summary: 'PAYLOAD_TOO_LARGE',
        value: 'PAYLOAD_TOO_LARGE',
      },
      UnsupportedMediaType: {
        summary: 'UNSUPPORTED_MEDIA_TYPE',
        value: 'UNSUPPORTED_MEDIA_TYPE',
      },
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
  message = 'Invalid input data';

  @ApiProperty({ example: 400 })
  statusCode = 400;

  @ApiProperty({ example: 'BAD_REQUEST' })
  error = 'BAD_REQUEST';
}

export class UnauthorizedErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 'Missing or invalid token' })
  message = 'Missing or invalid token';

  @ApiProperty({ example: 401 })
  statusCode = 401;

  @ApiProperty({ example: 'UNAUTHORIZED' })
  error = 'UNAUTHORIZED';
}

export class ForbiddenErrorDto extends ErrorResponseDto {
  @ApiProperty({
    example: 'You do not have permission to access this resource',
  })
  message = 'You do not have permission to access this resource';

  @ApiProperty({ example: 403 })
  statusCode = 403;

  @ApiProperty({ example: 'FORBIDDEN' })
  error = 'FORBIDDEN';
}

export class NotFoundErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 'The requested resource was not found' })
  message = 'The requested resource was not found';

  @ApiProperty({ example: 404 })
  statusCode = 404;

  @ApiProperty({ example: 'NOT_FOUND' })
  error = 'NOT_FOUND';
}

export class PayloadTooLargeErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 'File size exceeds the allowed limit' })
  message = 'File size exceeds the allowed limit';

  @ApiProperty({ example: 413 })
  statusCode = 413;

  @ApiProperty({ example: 'PAYLOAD_TOO_LARGE' })
  error = 'PAYLOAD_TOO_LARGE';
}

export class UnsupportedMediaTypeErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 'Invalid or unsupported file format' })
  message = 'Invalid or unsupported file format';

  @ApiProperty({ example: 415 })
  statusCode = 415;

  @ApiProperty({ example: 'UNSUPPORTED_MEDIA_TYPE' })
  error = 'UNSUPPORTED_MEDIA_TYPE';
}

export class InternalServerErrorDto extends ErrorResponseDto {
  @ApiProperty({ example: 'An unexpected error occurred' })
  message = 'An unexpected error occurred';

  @ApiProperty({ example: 500 })
  statusCode = 500;

  @ApiProperty({ example: 'INTERNAL_SERVER_ERROR' })
  error = 'INTERNAL_SERVER_ERROR';
}
