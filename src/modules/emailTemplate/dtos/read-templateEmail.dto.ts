import { ApiProperty } from '@nestjs/swagger';

/**
 * Data transfer object for reading an email template.
 */
export class ReadEmailTemplateDto {
  @ApiProperty({
    example: 'b4b4a770-45a3-4e2e-9fcb-1a2e78d8a8b1',
    description: 'Unique identifier of the email template (UUID)',
  })
  id: string;

  @ApiProperty({
    example: 'Welcome Email',
    description: 'Unique name of the email template (used as an identifier)',
  })
  name: string;

  @ApiProperty({
    example: 'Welcome to our platform!',
    description: 'Subject line of the email',
  })
  subject: string;

  @ApiProperty({
    example: '<h1>Hello {{name}}</h1><p>Thanks for joining us!</p>',
    description: 'HTML body of the email template',
  })
  bodyHtml: string;

  @ApiProperty({
    example: 'Hello {{name}}, thanks for joining us!',
    description: 'Plain text version of the email body (optional)',
    required: false,
  })
  bodyText?: string;

  @ApiProperty({
    example: ['name', 'link'],
    description:
      'List of dynamic variables used in the template (e.g., placeholders in {{variable}} format)',
    type: [String],
  })
  variables: string[];

  @ApiProperty({
    example: 'User Engagement',
    description: 'Category or classification of the email template',
    required: false,
  })
  category?: string;

  @ApiProperty({
    example: 'Template sent to users upon registration',
    description: 'Detailed description of what this template is used for',
    required: false,
  })
  description?: string;

  @ApiProperty({
    example: true,
    description: 'Indicates whether this template is active or not',
  })
  isActive: boolean;

  @ApiProperty({
    example: 1,
    description: 'Version number of the template',
  })
  version: number;

  @ApiProperty({
    example: '2025-11-10T15:45:00.000Z',
    description: 'Date and time when the template was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-11-10T16:00:00.000Z',
    description: 'Date and time when the template was last updated',
  })
  updatedAt: Date;
}
