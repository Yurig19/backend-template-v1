import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';

/**
 * Data transfer object for verified JWT token payload.
 */
export class VerifyTokenDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'UUID of the user associated with the token',
    example: '123e4567-e89b-12d3-a456-426614174000',
    isUuid: true,
  })
  userUuid: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Full name of the user associated with the token',
    example: 'John Doe',
  })
  name: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Email address of the user associated with the token',
    example: 'johndoe@example.com',
  })
  email: string;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Issued at timestamp (token creation date)',
    example: '2025-03-08T12:34:56Z',
  })
  iat: Date;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Expiration timestamp of the token',
    example: '2025-03-15T12:34:56Z',
  })
  exp: Date;
}
