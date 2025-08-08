import { ListAuditsDto } from '../../dtos/list-audits.dto';
import { AuditsService } from '../../services/audits.service';
import { ListAuditsQuery } from './list-audits-query';
import { AuditsListHandler } from './list-audits.handle';

describe('AuditsListHandler', () => {
  let handler: AuditsListHandler;
  let auditsService: jest.Mocked<AuditsService>;

  const mockAudit = {
    uuid: 'audit-uuid-123',
    entity: 'User',
    method: 'POST',
    url: '/api/users',
    userAgent: 'PostmanRuntime/7.29.0',
    userUuid: 'user-uuid-456',
    newData: JSON.stringify({ name: 'New Name' }),
    oldData: JSON.stringify({ name: 'Old Name' }),
    ip: '127.0.0.1',
    createdAt: new Date(),
  };

  beforeEach(() => {
    auditsService = {
      listWithPagination: jest.fn(),
    } as unknown as jest.Mocked<AuditsService>;

    handler = new AuditsListHandler(auditsService);
  });

  it('should return paginated audits list', async () => {
    auditsService.listWithPagination.mockResolvedValue({
      audits: [mockAudit],
      currentPage: 1,
      totalPages: 3,
      total: 30,
    });

    const query = new ListAuditsQuery(1, 10, 'user');

    const result = await handler.execute(query);

    expect(result).toEqual<ListAuditsDto>({
      data: [
        {
          uuid: mockAudit.uuid,
          entity: mockAudit.entity,
          method: mockAudit.method,
          url: mockAudit.url,
          userAgent: mockAudit.userAgent,
          userUuid: mockAudit.userUuid,
          newData: mockAudit.newData,
          oldData: mockAudit.oldData,
          ip: mockAudit.ip,
          createdAt: mockAudit.createdAt,
        },
      ],
      actualPage: 1,
      totalPages: 3,
      total: 30,
    });

    expect(auditsService.listWithPagination).toHaveBeenCalledWith(
      1,
      10,
      'user'
    );
  });

  it('should return empty data when no audits found', async () => {
    auditsService.listWithPagination.mockResolvedValue({
      audits: [],
      currentPage: 1,
      totalPages: 0,
      total: 0,
    });

    const query = new ListAuditsQuery(1, 10);

    const result = await handler.execute(query);

    expect(result).toEqual<ListAuditsDto>({
      data: [],
      actualPage: 1,
      totalPages: 0,
      total: 0,
    });

    expect(auditsService.listWithPagination).toHaveBeenCalledWith(
      1,
      10,
      undefined
    );
  });
});
