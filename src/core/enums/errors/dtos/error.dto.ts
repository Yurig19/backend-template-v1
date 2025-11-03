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
