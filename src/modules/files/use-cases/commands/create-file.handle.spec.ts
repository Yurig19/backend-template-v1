import { PrismaService } from '@/core/database/prisma.service';
import { RoleEnum } from '@/core/enums/role.enum';
import { FilesService } from '@/modules/files/services/files.service';
import { UploadService } from '@/modules/files/services/upload.service';
import { CreateFileCommand } from '@/modules/files/use-cases/commands/create-file.command';
import { CreateFileHandler } from '@/modules/files/use-cases/commands/create-file.handle';
import { ReadUserAuthDto } from '@/modules/users/dtos/read-user-auth.dto';
import { BadRequestException, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

describe('CreateFileHandler (REAL INTEGRATION)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let handler: CreateFileHandler;

  const mockUser: ReadUserAuthDto = {
    uuid: 'user-test-uuid',
    name: 'Test User',
    password: 'Teste@123',
    email: 'test@example.com',
    role: RoleEnum.admin,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: new Date(),
  };

  const mockFile: Express.Multer.File = {
    originalname: 'real-test.txt',
    mimetype: 'text/plain',
    buffer: Buffer.from('testing content'),
    size: 17,
    fieldname: 'file',
    encoding: '7bit',
    stream: null,
    destination: null,
    filename: null,
    path: null,
  };

  const cleanDatabase = async () => {
    const tables = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    for (const t of tables) {
      if (t.tablename === '_prisma_migrations') continue;

      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE "public"."${t.tablename}" RESTART IDENTITY CASCADE;`
      );
    }
  };

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        FilesService,
        UploadService,
        CreateFileHandler,
      ],
    }).compile();

    app = module.createNestApplication();
    prisma = module.get(PrismaService);
    handler = module.get(CreateFileHandler);

    await app.init();

    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  it('should upload file and persist in database (REAL)', async () => {
    const command = new CreateFileCommand(mockUser, mockFile, false);

    const result = await handler.execute(command);

    expect(result).toHaveProperty('uuid');
    expect(result.filename).toBe(mockFile.originalname);
    expect(result.mimetype).toBe(mockFile.mimetype);
    expect(result.size).toBe(mockFile.size);

    const dbRecord = await prisma.file.findUnique({
      where: { uuid: result.uuid },
    });

    expect(dbRecord).not.toBeNull();
    expect(dbRecord?.filename).toBe('real-test.txt');
    expect(dbRecord?.path).toBeDefined();
    expect(dbRecord?.key).toBeDefined();
  });

  it('should throw BadRequestException when file is missing', async () => {
    const command = new CreateFileCommand(mockUser, undefined, false);

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });
});
