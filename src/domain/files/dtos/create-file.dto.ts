import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';

export class CreateFileDto {
  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'Original name of the uploaded file',
    example: 'document.pdf',
  })
  filename?: string;

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  mimetype?: string;

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'Path where the file is stored',
    example: '/uploads/document.pdf',
  })
  path?: string;

  @ApiParamDecorator({
    type: Number,
    required: false,
    description: 'Size of the file in bytes',
    example: 204800,
  })
  size?: number;
}
