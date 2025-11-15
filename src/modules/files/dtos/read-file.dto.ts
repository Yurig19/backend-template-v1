import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';

/**
 * Data transfer object for reading file information.
 */
export class ReadFileDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Unique identifier of the file',
    example: 'c57b8c8f-1e84-4b92-8b0f-96ad76361e89',
  })
  uuid: string;

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
    description: 'Storage key used in buckets or external providers',
    example: 'uploads/2025/01/15/document.pdf',
  })
  key?: string;

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

  @ApiParamDecorator({
    type: Boolean,
    required: false,
    description: 'Indicates whether the file is private',
    example: false,
  })
  isPrivate?: boolean;

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'Storage provider (e.g., local, s3, gcs)',
    example: 'local',
  })
  storage?: string;

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'UUID of the user who owns the file',
    example: 'b123ea1c-3e11-4b8d-aa72-889a8cc9c102',
  })
  userUuid?: string;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Date and time when the file was created',
    example: '2025-07-22T10:15:30Z',
  })
  createdAt: Date;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Date and time when the file was last updated',
    example: '2025-07-22T10:15:30Z',
  })
  updatedAt: Date;

  @ApiParamDecorator({
    type: Date,
    required: false,
    description: 'Date and time when the file was deleted (if applicable)',
    example: '2025-07-23T14:20:00Z',
  })
  deletedAt?: Date;
}
