import { ApiParamDecorator } from '../decorators/api-param.decorator';

/**
 * Data transfer object for simple message responses.
 */
export class MessageDto {
  @ApiParamDecorator({
    description: 'Detailed response message',
    required: true,
    type: String,
    example: 'Operation completed successfully',
  })
  message: string;
}
