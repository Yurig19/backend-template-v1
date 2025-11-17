import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';

export class CreateEmailTemplateDto {
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
      'List of dynamic variables used in the template (e.g., placeholders in {{variable}} format)',
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
    required: false,
    description: 'Defines whether this template is active or not',
    example: true,
  })
  isActive?: boolean;

  @ApiParamDecorator({
    type: Number,
    required: false,
    description: 'Version number of the template (defaults to 1)',
    example: 1,
  })
  version?: number;
}
