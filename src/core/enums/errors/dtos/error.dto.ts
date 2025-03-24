import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';

export class ErrorResponseDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'error message',
    example: 'error message',
  })
  message: string;

  @ApiParamDecorator({
    type: Number,
    required: true,
    description: 'error message',
    example: 200,
  })
  statusCode: number;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'error message',
    example: 200,
  })
  statusMessage: string;
}
