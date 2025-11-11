import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';
import { ReadUserDto } from '@/modules/users/dtos/read-user.dto';

/**
 * Data transfer object for authentication login response.
 */
export class AuthLoginResponseDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'JWT access token used for authenticated requests',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyVXVpZCI6IjEyM2U0NTY3LWU4OWItMTJkMy1hNDU2LTQyNjYxNDE3NDAwMCIsImlhdCI6MTYxNjIzOTAyMn0.1',
  })
  accessToken: string;

  @ApiParamDecorator({
    type: () => ReadUserDto,
    required: true,
    description: 'Authenticated user details',
    example: ReadUserDto,
  })
  user: ReadUserDto;
}
