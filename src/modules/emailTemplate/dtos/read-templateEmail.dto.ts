import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';

export class ReadEmailTemplateDto {
  @ApiParamDecorator({
    type: String,
    isUuid: true,
    description: 'Unique identifier of the email template (UUID)',
    example: 'b4b4a770-45a3-4e2e-9fcb-1a2e78d8a8b1',
  })
  id: string;

  @ApiParamDecorator({
    type: String,
    description: 'Unique name of the email template (used as an identifier)',
    example: 'Welcome Email',
  })
  name: string;

  @ApiParamDecorator({
    type: String,
    description: 'Subject line of the email',
    example: 'Welcome to our platform!',
  })
  subject: string;

  @ApiParamDecorator({
    type: String,
    description: 'HTML body of the email template',
    example: '<h1>Hello {{name}}</h1><p>Thanks for joining us!</p>',
  })
  bodyHtml: string;

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'Plain text version of the email body (optional)',
    example: 'Hello {{name}}, thanks for joining us!',
  })
  bodyText?: string;

  @ApiParamDecorator({
    type: Array,
    description:
      'List of dynamic variables used in the template (e.g., placeholders like {{variable}})',
    example: ['name', 'link'],
  })
  variables: string[];

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'Category or classification of the email template',
    example: 'User Engagement',
  })
  category?: string;

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'Detailed description of what this template is used for',
    example: 'Template sent to users upon registration',
  })
  description?: string;

  @ApiParamDecorator({
    type: Boolean,
    description: 'Indicates whether this template is active or not',
    example: true,
  })
  isActive: boolean;

  @ApiParamDecorator({
    type: Number,
    description: 'Version number of the template',
    example: 1,
  })
  version: number;

  @ApiParamDecorator({
    type: Date,
    description: 'Date and time when the template was created',
    example: '2025-11-10T15:45:00.000Z',
  })
  createdAt: Date;

  @ApiParamDecorator({
    type: Date,
    description: 'Date and time when the template was last updated',
    example: '2025-11-10T16:00:00.000Z',
  })
  updatedAt: Date;
}
