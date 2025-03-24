import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';

export class AuthLoginDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'E-mail do usuário',
    example: 'example@example.com',
  })
  @IsEmail()
  @IsString()
  email: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'user password',
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
