import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';

export class ReadAuditsListDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Audits uuid',
  })
  uuid: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Audits entity',
  })
  entity: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Audits method',
  })
  method: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Audits userUuid',
  })
  userUuid: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Audits oldData',
  })
  oldData: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Audits newData',
  })
  newData: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Audits url',
  })
  url: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Audits ip',
  })
  ip: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Audits userAgent',
  })
  userAgent: string;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Audits createdAt',
  })
  createdAt: Date;
}

export class ListAuditsDto {
  @ApiParamDecorator({
    type: [ReadAuditsListDto],
    required: true,
    description: 'Entity name',
  })
  data: ReadAuditsListDto[];

  @ApiParamDecorator({
    description: '',
    required: false,
    type: Number,
    example: '1',
  })
  total: number;

  @ApiParamDecorator({
    description: '',
    required: false,
    type: Number,
    example: '1',
  })
  actualPage: number;

  @ApiParamDecorator({
    description: '',
    required: false,
    type: Number,
    example: '1',
  })
  totalPages: number;
}
