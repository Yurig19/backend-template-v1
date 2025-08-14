import * as fs from 'node:fs';
import * as path from 'node:path';
import { AppError } from '@/core/exceptions/app.error';
import { FilesService } from '@/modules/files/services/files.service';
import { CreateFileCommand } from './create-file.command';
import { CreateFileHandler } from './create-file.handle';

describe('CreateFileHandler', () => {
  let handler: CreateFileHandler;
  let filesService: jest.Mocked<FilesService>;

  const mockFile = {
    originalname: 'test.txt',
    mimetype: 'text/plain',
    buffer: Buffer.from('test content'),
    size: 20,
  } as Express.Multer.File;

  const mockSavedFile = {
    uuid: 'file-uuid-123',
    filename: 'test.txt',
    mimetype: 'text/plain',
    path: path.resolve(process.cwd(), 'uploads', 'test.txt'),
    size: 20,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    filesService = {
      create: jest.fn(),
    } as unknown as jest.Mocked<FilesService>;

    handler = new CreateFileHandler(filesService);

    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    jest.spyOn(fs, 'mkdirSync').mockImplementation(jest.fn());
    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create a file successfully', async () => {
    filesService.create.mockResolvedValue(mockSavedFile);

    const command = new CreateFileCommand(mockFile);
    const result = await handler.execute(command);

    expect(fs.existsSync).toHaveBeenCalledWith(
      path.resolve(process.cwd(), 'uploads')
    );
    expect(fs.promises.writeFile).toHaveBeenCalledWith(
      mockSavedFile.path,
      mockFile.buffer
    );
    expect(filesService.create).toHaveBeenCalledWith({
      filename: mockFile.originalname,
      mimetype: mockFile.mimetype,
      path: mockSavedFile.path,
      size: mockFile.size,
    });
    expect(result).toEqual({
      uuid: mockSavedFile.uuid,
      filename: mockSavedFile.filename,
      mimetype: mockSavedFile.mimetype,
      path: mockSavedFile.path,
      size: mockSavedFile.size,
      createdAt: mockSavedFile.createdAt,
      updatedAt: mockSavedFile.updatedAt,
      deletedAt: mockSavedFile.deletedAt,
    });
  });

  it('should create uploads directory if it does not exist', async () => {
    (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
    filesService.create.mockResolvedValue(mockSavedFile);

    const command = new CreateFileCommand(mockFile);
    await handler.execute(command);

    expect(fs.mkdirSync).toHaveBeenCalledWith(
      path.resolve(process.cwd(), 'uploads'),
      { recursive: true }
    );
  });

  it('should throw AppError when an error occurs', async () => {
    jest
      .spyOn(fs.promises, 'writeFile')
      .mockRejectedValueOnce(new Error('failed to write'));

    const command = new CreateFileCommand(mockFile);

    await expect(handler.execute(command)).rejects.toBeInstanceOf(AppError);
  });
});
