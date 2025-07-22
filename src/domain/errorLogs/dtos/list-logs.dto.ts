import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';

export class ReadListLogsDto {
  @ApiParamDecorator({
    description: 'Unique identifier of the log entry',
    required: true,
    type: String,
    example: '1',
  })
  uuid: string;

  @ApiParamDecorator({
    description: 'Error message associated with the log',
    required: true,
    type: String,
    example: 'Something went wrong',
  })
  error: string;

  @ApiParamDecorator({
    description: 'HTTP status code returned by the request',
    required: true,
    type: Number,
    example: 404,
  })
  statusCode: number;

  @ApiParamDecorator({
    description: 'HTTP status text corresponding to the status code',
    required: true,
    type: String,
    example: 'Not Found',
  })
  statusText: string;

  @ApiParamDecorator({
    description: 'HTTP method used in the request (GET, POST, etc.)',
    required: true,
    type: String,
    example: 'GET',
  })
  method: string;

  @ApiParamDecorator({
    description: 'Request path that triggered the log',
    required: true,
    type: String,
    example: '/api/v1/users',
  })
  path: string;

  @ApiParamDecorator({
    description: 'IP address of the client that made the request',
    required: true,
    type: String,
    example: '192.168.0.1',
  })
  ip: string;

  @ApiParamDecorator({
    description: 'User agent string from the request header',
    required: true,
    type: String,
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  })
  userAgent: string;

  @ApiParamDecorator({
    description: 'Date and time when the log entry was created',
    required: true,
    type: Date,
    example: '2023-07-22T12:34:56.789Z',
  })
  createdAt: Date;
}

export class ListLogsDto {
  @ApiParamDecorator({
    description: 'List of log entries',
    required: false,
    type: [ReadListLogsDto],
  })
  data: ReadListLogsDto[];

  @ApiParamDecorator({
    description: 'Total number of log entries available',
    required: false,
    type: Number,
    example: 100,
  })
  total: number;

  @ApiParamDecorator({
    description: 'Current page number in the paginated result',
    required: false,
    type: Number,
    example: 1,
  })
  actualPage: number;

  @ApiParamDecorator({
    description: 'Total number of pages based on pagination',
    required: false,
    type: Number,
    example: 10,
  })
  totalPages: number;
}
