import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';
import { RoleEnum } from '@/core/enums/role.enum';
import {
  IsEmail,
  IsEnum,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

/**
 * Data transfer object for partially updating a user (PATCH operation).
 */
export class PatchUserDto {
  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString({ message: 'Name must be a string.' })
  @MinLength(3, { message: 'Name must be at least 3 characters long.' })
  name: string;

  @ApiParamDecorator({
    type: String,
    required: false,
    description: 'Email address of the user',
    example: 'name@email.com',
  })
  @IsString({ message: 'Email must be a string.' })
  @MinLength(3, { message: 'Email must be at least 3 characters long.' })
  @IsEmail({}, { message: 'Email must be a valid email address.' })
  email: string;

  @ApiParamDecorator({
    type: String,
    required: false,
    description:
      'User password (must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character)',
    example: 'Teste@123',
  })
  @IsString({ message: 'Password must be a string.' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Password must contain at least 8 characters, including 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
    },
  )
  password: string;

  @ApiParamDecorator({
    type: RoleEnum,
    required: false,
    description: 'User role (e.g., ADMIN, USER, etc.)',
    example: 'ADMIN',
    enumName: 'RoleEnum',
  })
  @IsEnum(RoleEnum, {
    message: 'Role must be one of: ADMIN, EMPLOYEE, MANAGER.',
  })
  role: RoleEnum;
}
