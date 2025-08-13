import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import { ListLogsDto } from '../../dtos/list-logs.dto';
import { LogsService } from '../../services/logs.service';
import { LogsListHandler } from './logs-list.handle';
import { LogsListQuery } from './logs-list.query';

describe('LogsListHandler (integration)', () => {
  let prisma: PrismaService;
  let handler: LogsListHandler;

  const mockDate = new Date('2025-08-01T10:00:00Z');

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, LogsService, LogsListHandler],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    handler = module.get<LogsListHandler>(LogsListHandler);

    await prisma.logs.deleteMany();
  });

  afterAll(async () => {
    await prisma.logs.deleteMany();
    await prisma.$disconnect();
  });

  it('should return paginated logs', async () => {
    const log1 = await prisma.logs.create({
      data: {
        uuid: randomUUID(),
        ip: '127.0.0.1',
        error: '',
        method: 'GET',
        path: '/api/users',
        statusCode: 200,
        statusText: 'OK',
        userAgent: 'Mozilla/5.0',
        createdAt: mockDate,
      },
    });

    const log2 = await prisma.logs.create({
      data: {
        uuid: randomUUID(),
        ip: '192.168.1.1',
        error: 'Internal error',
        method: 'POST',
        path: '/api/orders',
        statusCode: 500,
        statusText: 'Internal Server Error',
        userAgent: 'PostmanRuntime/7.28.4',
        createdAt: mockDate,
      },
    });

    const query = new LogsListQuery(1, 10);
    const result = await handler.execute(query);

    const expected: ListLogsDto = {
      data: [log1, log2].map((log) => ({
        uuid: log.uuid,
        ip: log.ip,
        error: log.error,
        method: log.method,
        path: log.path,
        statusCode: log.statusCode,
        statusText: log.statusText,
        userAgent: log.userAgent,
        createdAt: log.createdAt,
      })),
      actualPage: 1,
      totalPages: 1,
      total: 2,
    };

    expect(result).toEqual(expected);
  });

  it('should return empty data when no logs found', async () => {
    await prisma.logs.deleteMany();

    const query = new LogsListQuery(1, 10);
    const result = await handler.execute(query);

    expect(result).toEqual({
      data: [],
      actualPage: 1,
      totalPages: 0,
      total: 0,
    });
  });
});
