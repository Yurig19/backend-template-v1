import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';

export class ReadUserDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'UUID do usuário',
    example: 'John Doe',
  })
  uuid: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Nome completo do usuário',
  })
  name: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'email do usuário',
    example: 'example@example.com',
  })
  email: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Senha do usuário',
    example: 'Teste@123',
  })
  password: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'role do usuário',
    example: 'admin',
  })
  role: string;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Data de criação do usuário',
  })
  createdAt: Date;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Data de atualização do usuário',
  })
  updatedAt: Date;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Data de exclusão do usuário',
  })
  deletedAt: Date;
}
