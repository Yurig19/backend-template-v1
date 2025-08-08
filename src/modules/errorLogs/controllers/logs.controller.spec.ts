import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { ListLogsDto } from '../dtos/list-logs.dto';
import { LogsListQuery } from '../use-cases/queries/logs-list.query';
import { LogsController } from './logs.controller';

describe('LogsController', () => {
  let controller: LogsController;
  let queryBus: QueryBus;

  const mockListLogsDto: ListLogsDto = {
    data: [
      {
        uuid: 'e1b1c3f4-12ab-4c56-9e78-9f0a1b2c3d4e',
        statusText: 'OK',
        method: 'GET',
        statusCode: 200,
        ip: '192.168.1.100',
        error: '',
        path: '/api/users',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        createdAt: new Date('2025-08-01T12:34:56.000Z'),
      },
    ],
    actualPage: 1,
    totalPages: 1,
    total: 1,
  };

  const queryBusMock = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LogsController],
      providers: [{ provide: QueryBus, useValue: queryBusMock }],
    }).compile();

    controller = module.get<LogsController>(LogsController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('list', () => {
    it('should call queryBus.execute with LogsListQuery and return result', async () => {
      const page = 1;
      const dataPerPage = 10;
      const search = 'log';

      queryBusMock.execute.mockResolvedValueOnce(mockListLogsDto);

      const result = await controller.list(page, dataPerPage, search);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new LogsListQuery(page, dataPerPage, search)
      );
      expect(result).toEqual(mockListLogsDto);
    });

    it('should handle undefined search param', async () => {
      const page = 2;
      const dataPerPage = 5;
      const search = undefined;

      queryBusMock.execute.mockResolvedValueOnce(mockListLogsDto);

      const result = await controller.list(page, dataPerPage, search);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new LogsListQuery(page, dataPerPage, undefined)
      );
      expect(result).toEqual(mockListLogsDto);
    });
  });
});
