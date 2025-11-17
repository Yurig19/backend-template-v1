import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';
import { IsBoolean, IsInt, MaxLength } from 'class-validator';

/**
 * Data transfer object for creating a file record.
 */
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
    description: 'Storage key used to identify the file (e.g., S3 key)',
    example: 'uploads/2025/11/document_abc123.pdf',
  })
  @MaxLength(255)
  key?: string;

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'Path where the file is stored locally or remotely',
    example: '/uploads/document.pdf',
  })
  path?: string;

  @ApiParamDecorator({
    type: Number,
    required: false,
    description: 'File size in bytes',
    example: 204800,
  })

  @IsInt()
  size?: number;

  @ApiParamDecorator({
    type: Boolean,
    required: false,
    description: 'Indicates whether the file is private (requires auth)',
    example: false,
  })
  isPrivate?: boolean;

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'Storage type (e.g., local, s3, gcs)',
    example: 'local',
  })
  @MaxLength(50)
  storage?: string;

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'UUID of the user who uploaded the file',
    example: 'a1b2c3d4-e5f6-7890-abcd-1234567890ef',
  })
  userUuid?: string;
}
