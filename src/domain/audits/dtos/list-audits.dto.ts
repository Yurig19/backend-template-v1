import { ApiParamDecorator } from 'src/core/decorators/api-param.decorator';

export class ReadAuditsListDto {
  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Unique identifier of the audit entry',
    example: 'a1b2c3d4',
  })
  uuid: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Name of the audited entity (e.g., "User", "Order")',
    example: 'User',
  })
  entity: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'HTTP method used for the operation',
    example: 'UPDATE',
  })
  method: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'UUID of the user who performed the action',
    example: 'u1v2w3x4',
  })
  userUuid: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Data before the change (old state)',
    example: '{"name": "Old Name"}',
  })
  oldData: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'Data after the change (new state)',
    example: '{"name": "New Name"}',
  })
  newData: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'URL path where the operation occurred',
    example: '/api/v1/users/123',
  })
  url: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'IP address of the client that initiated the request',
    example: '192.168.1.10',
  })
  ip: string;

  @ApiParamDecorator({
    type: String,
    required: true,
    description: 'User agent string from the client',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  })
  userAgent: string;

  @ApiParamDecorator({
    type: Date,
    required: true,
    description: 'Date and time when the audit entry was created',
    example: '2024-07-22T12:00:00.000Z',
  })
  createdAt: Date;
}

export class ListAuditsDto {
  @ApiParamDecorator({
    type: [ReadAuditsListDto],
    required: true,
    description: 'List of audit log entries',
  })
  data: ReadAuditsListDto[];

  @ApiParamDecorator({
    description: 'Total number of audit records available',
    required: false,
    type: Number,
    example: 42,
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
    description: 'Total number of pages based on pagination settings',
    required: false,
    type: Number,
    example: 5,
  })
  totalPages: number;
}
