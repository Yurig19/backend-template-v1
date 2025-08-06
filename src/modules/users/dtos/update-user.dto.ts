import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';
import { RoleEnum } from '@/core/enums/role.enum';
import {
  IsEmail,
  IsEnum,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Email address of the user',
    example: 'name@email.com',
  })
  @IsString()
  @MinLength(3)
  @IsEmail()
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

  @ApiParamDecorator({
    type: RoleEnum,
    required: true,
    description: 'User role (e.g., ADMIN, USER, etc.)',
    example: 'ADMIN',
    enumName: 'RoleEnum',
  })
  @IsEnum(RoleEnum)
  role: RoleEnum;
}
