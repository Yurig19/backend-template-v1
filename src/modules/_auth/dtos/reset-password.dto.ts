import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'ABC123', description: 'Password recovery code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    example: 'newStrongPassword123',
    description: 'New user password',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
