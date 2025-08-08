import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { ListAuditsDto } from '../dtos/list-audits.dto';
import { ListAuditsQuery } from '../use-cases/queries/list-audits-query';
import { AuditsController } from './audits.controller';

describe('AuditsController', () => {
  let controller: AuditsController;
  let queryBus: QueryBus;

  const mockListAuditsDto: ListAuditsDto = {
    data: [
      {
        uuid: 'audit-uuid-1',
        entity: 'User',
        method: 'POST',
        url: '/users',
        userAgent: 'PostmanRuntime/7.28.4',
        userUuid: 'user-uuid-1',
        newData: '{}',
        oldData: '{}',
        ip: '127.0.0.1',
        createdAt: new Date(),
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
      controllers: [AuditsController],
      providers: [{ provide: QueryBus, useValue: queryBusMock }],
    }).compile();

    controller = module.get<AuditsController>(AuditsController);
    queryBus = module.get<QueryBus>(QueryBus);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('listAudits', () => {
    it('should call queryBus.execute with ListAuditsQuery and return data', async () => {
      const page = 1;
      const dataPerPage = 10;
      const search = 'test';

      queryBusMock.execute.mockResolvedValueOnce(mockListAuditsDto);

      const result = await controller.listAudits(page, dataPerPage, search);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new ListAuditsQuery(page, dataPerPage, search)
      );
      expect(result).toEqual(mockListAuditsDto);
    });

    it('should handle undefined search param', async () => {
      const page = 2;
      const dataPerPage = 5;
      const search = undefined;

      queryBusMock.execute.mockResolvedValueOnce(mockListAuditsDto);

      const result = await controller.listAudits(page, dataPerPage, search);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new ListAuditsQuery(page, dataPerPage, undefined)
      );
      expect(result).toEqual(mockListAuditsDto);
    });
  });
});
