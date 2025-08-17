import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import { ListLogsDto } from '../../dtos/list-logs.dto';
import { LogsService } from '../../services/logs.service';
import { LogsListHandler } from './logs-list.handle';
import { LogsListQuery } from './logs-list.query';

describe('LogsListHandler (integration)', () => {
  let handler: LogsListHandler;
  let logsService: LogsService;
  let prisma: PrismaService;

  const mockLog = {
    uuid: randomUUID(),
    error: 'Unauthorized access',
    statusCode: 401,
    statusText: 'UNAUTHORIZED',
    method: 'GET',
    path: '/orders',
    ip: '127.0.0.1',
    userAgent: 'jest-test',
    createdAt: new Date(),
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [LogsListHandler, LogsService, PrismaService],
    }).compile();

    handler = module.get<LogsListHandler>(LogsListHandler);
    logsService = module.get<LogsService>(LogsService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.logs.deleteMany();
    await prisma.logs.create({ data: mockLog });
  });

  afterEach(async () => {
    await prisma.logs.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return paginated logs list', async () => {
    const query = new LogsListQuery(1, 10, 'Unauthorized');

    const result = await handler.execute(query);

    expect(result).toEqual<ListLogsDto>({
      data: [
        {
          uuid: mockLog.uuid,
          error: mockLog.error,
          statusCode: mockLog.statusCode,
          statusText: mockLog.statusText,
          method: mockLog.method,
          path: mockLog.path,
          ip: mockLog.ip,
          userAgent: mockLog.userAgent,
          createdAt: mockLog.createdAt,
        },
      ],
      actualPage: 1,
      totalPages: 1,
      total: 1,
    });
  });

  it('should return empty data when no logs found', async () => {
    const query = new LogsListQuery(1, 10);

    const result = await handler.execute(query);

    expect(result).toEqual<ListLogsDto>({
      data: [],
      actualPage: 1,
      totalPages: 1,
      total: 0,
    });
  });
});
