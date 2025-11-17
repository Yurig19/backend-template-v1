import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';
import { MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiParamDecorator({
    type: String,
    description: 'Password recovery code',
    example: 'ABC123',
  })
  code: string;

  @ApiParamDecorator({
    type: String,
    description: 'New user password',
    example: 'newStrongPassword123',
  })
  @MinLength(6)
  newPassword: string;
}
