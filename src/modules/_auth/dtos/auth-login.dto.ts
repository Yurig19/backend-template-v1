import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

/**
 * Data transfer object for user login authentication.
 */
export class AuthLoginDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'User email address',
    example: 'admin@admin.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description:
      'User password (must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character)',
    example: 'Teste@123',
  })
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  password: string;
}
