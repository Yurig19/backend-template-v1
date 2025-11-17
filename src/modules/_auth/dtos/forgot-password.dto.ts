import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
