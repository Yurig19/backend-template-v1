import { ListLogsDto } from '../../dtos/list-logs.dto';
import { LogsService } from '../../services/logs.service';
import { LogsListHandler } from './logs-list.handle';
import { LogsListQuery } from './logs-list.query';

describe('LogsListHandler', () => {
  let handler: LogsListHandler;
  let logsService: jest.Mocked<LogsService>;

  const mockDate = new Date('2025-08-01T10:00:00Z');

  const mockLogs = [
    {
      uuid: 'log-uuid-1',
      ip: '127.0.0.1',
      error: '',
      method: 'GET',
      path: '/api/users',
      statusCode: 200,
      statusText: 'OK',
      userAgent: 'Mozilla/5.0',
      createdAt: mockDate,
    },
    {
      uuid: 'log-uuid-2',
      ip: '192.168.1.1',
      error: 'Internal error',
      method: 'POST',
      path: '/api/orders',
      statusCode: 500,
      statusText: 'Internal Server Error',
      userAgent: 'PostmanRuntime/7.28.4',
      createdAt: mockDate,
    },
  ];

  const mockServiceResponse = {
    logs: mockLogs,
    currentPage: 1,
    totalPages: 5,
    total: 50,
  };

  beforeEach(() => {
    logsService = {
      listWithPagination: jest.fn(),
    } as unknown as jest.Mocked<LogsService>;

    handler = new LogsListHandler(logsService);
  });

  it('should return paginated logs', async () => {
    logsService.listWithPagination.mockResolvedValue(mockServiceResponse);

    const query = new LogsListQuery(1, 10, 'error');

    const result = await handler.execute(query);

    const expected: ListLogsDto = {
      data: mockLogs.map((log) => ({
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
      totalPages: 5,
      total: 50,
    };

    expect(result).toEqual(expected);
    expect(logsService.listWithPagination).toHaveBeenCalledWith(1, 10, 'error');
  });

  it('should return empty data when no logs found', async () => {
    logsService.listWithPagination.mockResolvedValue({
      logs: [],
      currentPage: 1,
      totalPages: 0,
      total: 0,
    });

    const query = new LogsListQuery(1, 10);

    const result = await handler.execute(query);

    expect(result).toEqual({
      data: [],
      actualPage: 1,
      totalPages: 0,
      total: 0,
    });

    expect(logsService.listWithPagination).toHaveBeenCalledWith(
      1,
      10,
      undefined
    );
  });
});
