import { QueryBus } from '@nestjs/cqrs';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import { AuditsService } from '../services/audits.service';
import { AuditsController } from './audits.controller';

describe('AuditsController (integration)', () => {
  let controller: AuditsController;
  let auditsService: AuditsService;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditsController],
      providers: [
        AuditsService,
        PrismaService,
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn().mockResolvedValue({
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
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuditsController>(AuditsController);
    auditsService = module.get<AuditsService>(AuditsService);
    prisma = module.get<PrismaService>(PrismaService);

    await prisma.audits.deleteMany();

    const mockAudit = {
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
    };

    await prisma.users.create({
      data: {
        uuid: mockAudit.userUuid,
        name: 'User Test',
        email: 'user@test.com',
        password: 'hashed-password',
        createdAt: new Date(),
      },
    });

    await prisma.audits.create({
      data: mockAudit,
    });
  });

  afterAll(async () => {
    await prisma.audits.deleteMany();
    await prisma.$disconnect();
  });

  it('should return audits list from the real service', async () => {
    const result = await controller.listAudits(1, 10, 'User');

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data[0]).toMatchObject({
      uuid: 'audit-uuid-1',
      entity: 'User',
      method: 'POST',
    });
  });
});
