import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';

export class ErrorResponseDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Detailed description of the error',
    example: 'Invalid credentials provided',
  })
  message: string;

  @ApiParamDecorator({
    type: Number,
    required: true,
    description: 'HTTP status code of the error',
    example: 401,
  })
  statusCode: number;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'HTTP status message associated with the error',
    example: 'UNAUTHORIZED',
  })
  statusMessage: string;
}
