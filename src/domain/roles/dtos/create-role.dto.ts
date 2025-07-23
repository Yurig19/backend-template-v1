import { ApiParamDecorator } from '@/core/decorators/api-param.decorator';

export class CreateRoleDto {
  @ApiParamDecorator({
    type: String,
    description: 'Name of the role (e.g., "Admin", "User")',
    required: true,
    example: 'Admin',
  })
  name: string;

  @ApiParamDecorator({
    type: String,
    description: 'Type of the role or its category',
    required: true,
    example: 'system',
  })
  type: string;
}
