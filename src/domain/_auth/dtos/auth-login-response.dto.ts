import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';
import { ReadUserDto } from 'src/domain/users/dtos/read/read-user.dto';

export class AuthLoginResponseDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'JWT token',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVXVpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImlhdCI6MTYxNjIzOTAyMn0.1',
  })
  accessToken: string;

  @ApiParamDecorator({
    type: () => ReadUserDto,
    required: true,
    description: 'User ID',
    example: ReadUserDto,
  })
  user: ReadUserDto;
}
