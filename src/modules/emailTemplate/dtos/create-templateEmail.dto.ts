import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

/**
 * Data transfer object for creating an email template.
 */
export class CreateEmailTemplateDto {
  @ApiProperty({
    example: 'Welcome Email',
    description: 'Unique name of the email template (used as an identifier)',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Welcome to our platform!',
    description: 'Subject line of the email',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  subject: string;

  @ApiProperty({
    example: '<h1>Hello {{name}}</h1><p>Thanks for joining us!</p>',
    description: 'HTML body of the email template',
  })
  @IsString()
  @IsNotEmpty()
  bodyHtml: string;

  @ApiProperty({
    example: 'Hello {{name}}, thanks for joining us!',
    description: 'Plain text version of the email body (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  bodyText?: string;

  @ApiProperty({
    example: ['name', 'link'],
    description:
      'List of dynamic variables used in the template (e.g., placeholders in {{variable}} format)',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  variables: string[];

  @ApiProperty({
    example: 'User Engagement',
    description: 'Category or classification of the email template',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiProperty({
    example: 'Template sent to users upon registration',
    description: 'Detailed description of what this template is used for',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Defines whether this template is active or not',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    example: 1,
    description: 'Version number of the template (defaults to 1)',
    required: false,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  version?: number;
}
