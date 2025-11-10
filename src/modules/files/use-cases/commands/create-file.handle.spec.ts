import { PrismaService } from '@/core/database/prisma.service';
import { FilesService } from '@/modules/files/services/files.service';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from '../../services/upload.service';
import { CreateFileCommand } from './create-file.command';
import { CreateFileHandler } from './create-file.handle';

describe('CreateFileHandler (integration)', () => {
  let handler: CreateFileHandler;
  let prisma: PrismaService;
  let uploadService: UploadService;

  const mockFile = {
    originalname: 'test.txt',
    mimetype: 'text/plain',
    buffer: Buffer.from('test content'),
    size: 20,
  } as Express.Multer.File;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateFileHandler,
        FilesService,
        UploadService,
        PrismaService,
      ],
    }).compile();

    handler = module.get<CreateFileHandler>(CreateFileHandler);
    prisma = module.get<PrismaService>(PrismaService);
    uploadService = module.get<UploadService>(UploadService);

    await prisma.file.deleteMany();

    (uploadService.uploadFile as unknown as jest.Mock).mockResolvedValue(
      'https://example.com/uploads/test.txt'
    );
  });

  afterAll(async () => {
    await prisma.file.deleteMany();
    await prisma.$disconnect();
  });

  it('should create a file and persist in database', async () => {
    const command = new CreateFileCommand(mockFile);
    const result = await handler.execute(command);

    expect(result).toHaveProperty('uuid');
    expect(result.filename).toBe(mockFile.originalname);
    expect(result.mimetype).toBe(mockFile.mimetype);
    expect(result.size).toBe(mockFile.size);

    const dbRecord = await prisma.file.findUnique({
      where: { uuid: result.uuid },
    });
    expect(dbRecord).toBeTruthy();
    expect(dbRecord?.path).toBe('https://example.com/uploads/test.txt');
  });

  it('should throw BadRequestException when an error occurs in handler', async () => {
    const spy = (
      uploadService.uploadFile as unknown as jest.Mock
    ).mockRejectedValueOnce(new Error('upload failed'));

    const command = new CreateFileCommand(mockFile);
    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
    await expect(handler.execute(command)).rejects.toThrow(
      'Failed to create file.'
    );

    spy.mockRestore();
  });
});
