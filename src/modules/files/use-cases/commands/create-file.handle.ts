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

  /**
   * Handles the create file command by uploading a file to S3 and creating a file record.
   * @param command Create file command containing file data
   * @returns Created file data with upload information
   */
  async execute(command: CreateFileCommand): Promise<ReadFileDto> {
    try {
      const { userData, file, isPrivate } = command;

      const { uuid } = userData ?? {};

      if (uuid) {
        if (!file) {
          throw new BadRequestException(
            'No file was uploaded. Please make sure you include a file in the form-data with the correct field name.'
          );
        }

        const filePath = await this.uploadService.uploadFile(file, isPrivate);

        const { fileUrl, fileKey } = filePath ?? {};

        if (fileUrl && fileKey) {
          const createFileDto: CreateFileDto = {
            filename: file.originalname,
            mimetype: file.mimetype,
            path: fileUrl,
            size: file.size,
            key: fileKey,
            userUuid: uuid,
            isPrivate,
            storage: 's3',
          };

          const savedFile = await this.fileService.create(createFileDto);

          return {
            uuid: savedFile.uuid,
            filename: savedFile.filename,
            mimetype: savedFile.mimetype,
            path: savedFile.path,
            size: savedFile.size,
            isPrivate: savedFile.isPrivate,
            key: savedFile.key,
            storage: savedFile.storage,
            userUuid: savedFile.userUuid,
            createdAt: savedFile.createdAt,
            updatedAt: savedFile.updatedAt,
            deletedAt: savedFile.deletedAt,
          };
        }
      } else {
        this.logger.error('Failed to upload file: missing user UUID.');
      }

      this.logger.error(
        'Failed to upload file to S3: missing file URL or key.'
      );
      throw new BadRequestException(
        'File upload failed. Unable to store on S3.'
      );
    } catch (error) {
      this.logger.error('Failed to create file', error);
      throw new BadRequestException('Failed to create file.');
    }
  }
}
