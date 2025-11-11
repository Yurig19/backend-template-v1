import { ApiParamDecorator } from '../decorators/api-param.decorator';

/**
 * Data transfer object for delete operation responses.
 */
export class DeleteDto {
  @ApiParamDecorator({
    description: 'Indicates if the operation was successful',
    required: true,
    type: Boolean,
  })
  success: boolean;

  @ApiParamDecorator({
    description: 'HTTP status code of the response',
    required: true,
    type: Number,
  })
  statusCode: number;

  @ApiParamDecorator({
    description: 'Detailed response message',
    required: true,
    type: String,
  })
  message: string;
}
