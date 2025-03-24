import {
  IsEmail,
  IsEnum,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';

import { RoleEnum } from 'src/core/enums/role.enum';

export class CreateUserDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'user name',
    example: 'John Doe',
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'user email',
    example: 'name@email.com',
  })
  @IsString()
  @MinLength(3)
  @IsEmail()
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

  @ApiParamDecorator({
    type: RoleEnum,
    required: true,
    description: 'user email',
    example: 'name@email.com',
    enumName: 'RoleEnum',
  })
  @IsEnum(RoleEnum)
  role: RoleEnum;
}
