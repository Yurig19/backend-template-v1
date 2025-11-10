import { CreateFileDto } from '@/modules/files/dtos/create-file.dto';
import { ReadFileDto } from '@/modules/files/dtos/read-file.dto';
import { FilesService } from '@/modules/files/services/files.service';
import { BadRequestException, Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UploadService } from '../../services/upload.service';
import { CreateFileCommand } from './create-file.command';

@CommandHandler(CreateFileCommand)
export class CreateFileHandler implements ICommandHandler<CreateFileCommand> {
  private readonly logger = new Logger(CreateFileHandler.name);

  constructor(
    private readonly fileService: FilesService,
    private readonly uploadService: UploadService
  ) {}

  async execute(command: CreateFileCommand): Promise<ReadFileDto> {
    try {
      const filePath = await this.uploadService.uploadFile(command.file);

      const createFileDto: CreateFileDto = {
        filename: command.file.originalname,
        mimetype: command.file.mimetype,
        path: filePath.fileUrl,
        size: command.file.size,
      };

      const savedFile = await this.fileService.create(createFileDto);

      return {
        uuid: savedFile.uuid,
        filename: savedFile.filename,
        mimetype: savedFile.mimetype,
        path: savedFile.path,
        size: savedFile.size,
        createdAt: savedFile.createdAt,
        updatedAt: savedFile.updatedAt,
        deletedAt: savedFile.deletedAt,
      };
    } catch (error) {
      this.logger.error('Failed to create file', error);
      throw new BadRequestException('Failed to create file.');
    }
  }
}
