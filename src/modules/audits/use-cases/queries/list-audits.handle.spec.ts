import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import { ListAuditsDto } from '../../dtos/list-audits.dto';
import { AuditsService } from '../../services/audits.service';
import { ListAuditsQuery } from './list-audits-query';
import { AuditsListHandler } from './list-audits.handle';

describe('AuditsListHandler (integration)', () => {
  let handler: AuditsListHandler;
  let auditsService: AuditsService;
  let prisma: PrismaService;

  const mockAudit = {
    uuid: randomUUID(),
    entity: 'User',
    method: 'POST',
    url: '/api/users',
    userAgent: 'PostmanRuntime/7.29.0',
    userUuid: randomUUID(),
    newData: JSON.stringify({ name: 'New Name' }),
    oldData: JSON.stringify({ name: 'Old Name' }),
    ip: '127.0.0.1',
    createdAt: new Date(),
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuditsListHandler, AuditsService, PrismaService],
    }).compile();

    handler = module.get<AuditsListHandler>(AuditsListHandler);
    auditsService = module.get<AuditsService>(AuditsService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.audits.deleteMany();

    await prisma.users.create({
      data: {
        uuid: mockAudit.userUuid,
        name: 'User Test',
        email: 'user@test.com',
        password: 'hashed-password',
        createdAt: new Date(),
      },
    });

    await prisma.audits.create({ data: mockAudit });
  });

  afterEach(async () => {
    await prisma.audits.deleteMany();
    await prisma.users.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should return paginated audits list', async () => {
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
      totalPages: 1,
      total: 1,
    });
  });

  it('should return empty data when no audits found', async () => {
    await prisma.audits.deleteMany();

    const query = new ListAuditsQuery(1, 10);

    const result = await handler.execute(query);

    expect(result).toEqual<ListAuditsDto>({
      data: [],
      actualPage: 1,
      totalPages: 1,
      total: 0,
    });
  });
});
