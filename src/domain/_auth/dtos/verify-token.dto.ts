import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';

export class VerifyTokenDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'UUID do usuário associado ao token',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userUuid: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Nome do usuário associado ao token',
    example: 'John Doe',
  })
  name: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'E-mail do usuário associado ao token',
    example: 'johndoe@example.com',
  })
  email: string;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Data de criação do token',
    example: '2025-03-08T12:34:56Z',
  })
  iat: Date;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Data de expiração do token',
    example: '2025-03-15T12:34:56Z',
  })
  exp: Date;
}
