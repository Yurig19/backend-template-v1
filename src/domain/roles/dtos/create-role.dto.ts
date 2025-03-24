import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';

export class CreateRoleDto {
  @ApiParamDecorator({
    type: String,
    description: 'name',
    required: true,
  })
  name: string;

  @ApiParamDecorator({
    type: String,
    description: 'type',
    required: true,
  })
  type: string;
}
