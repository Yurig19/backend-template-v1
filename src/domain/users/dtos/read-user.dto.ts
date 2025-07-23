import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';

export class ReadUserDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'UUID of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  uuid: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Full name of the user',
    example: 'John Doe',
  })
  name: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Email address of the user',
    example: 'example@example.com',
  })
  email: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'User password (hashed or raw depending on usage)',
    example: 'Teste@123',
  })
  password: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Role assigned to the user',
    example: 'admin',
  })
  role: string;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Timestamp when the user was created',
    example: '2025-01-01T10:00:00Z',
  })
  createdAt: Date;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Timestamp when the user was last updated',
    example: '2025-02-01T15:00:00Z',
  })
  updatedAt: Date;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Timestamp when the user was deleted (if applicable)',
    example: '2025-03-01T18:30:00Z',
  })
  deletedAt: Date;
}
