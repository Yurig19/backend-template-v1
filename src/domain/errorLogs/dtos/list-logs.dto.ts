import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';

export class ReadListLogsDto {
  @ApiParamDecorator({
    description: '',
    required: true,
    type: String,
    example: '1',
  })
  uuid: string;

  @ApiParamDecorator({
    description: '',
    required: true,
    type: String,
    example: '1',
  })
  error: string;

  @ApiParamDecorator({
    description: '',
    required: true,
    type: Number,
    example: '1',
  })
  statusCode: number;

  @ApiParamDecorator({
    description: '',
    required: true,
    type: String,
    example: '1',
  })
  statusText: string;

  @ApiParamDecorator({
    description: '',
    required: true,
    type: String,
    example: '1',
  })
  method: string;

  @ApiParamDecorator({
    description: '',
    required: true,
    type: String,
    example: '1',
  })
  path: string;

  @ApiParamDecorator({
    description: '',
    required: true,
    type: String,
    example: '1',
  })
  ip: string;

  @ApiParamDecorator({
    description: '',
    required: true,
    type: String,
    example: '1',
  })
  userAgent: string;

  @ApiParamDecorator({
    description: '',
    required: true,
    type: Date,
    example: '1',
  })
  createdAt: Date;
}

export class ListLogsDto {
  @ApiParamDecorator({
    description: '',
    required: false,
    type: [ReadListLogsDto],
  })
  data: ReadListLogsDto[];

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
