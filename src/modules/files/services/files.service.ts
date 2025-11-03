import { PrismaService } from '@/core/database/prisma.service';
import { DeleteDto } from '@/core/dtos/delete.dto';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { BadRequestException, Logger } from '@nestjs/common';
import { File } from 'generated/prisma/client';
import { CreateFileDto } from '../dtos/create-file.dto';

export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(file: CreateFileDto): Promise<File> {
    try {
      return await this.prisma.file.create({
        data: file,
      });
    } catch (error) {
      this.logger.error('Failed to create file', error);
      throw new BadRequestException('Failed to create file.');
    }
  }

  async getByUuid(uuid: string): Promise<File> {
    try {
      return await this.prisma.file.findUnique({
        where: {
          uuid: uuid,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to get file by uuid: ${uuid}`, error);
      throw new BadRequestException('Failed to retrieve file.');
    }
  }

  async softDelete(uuid: string): Promise<File> {
    try {
      return await this.prisma.file.update({
        where: {
          uuid: uuid,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      this.logger.error(`Failed to soft delete file: ${uuid}`, error);
      throw new BadRequestException('Failed to soft delete file.');
    }
  }

  async delete(uuid: string): Promise<DeleteDto> {
    try {
      await this.prisma.file.delete({
        where: { uuid },
      });
      return {
        success: true,
        statusCode: HttpStatusCodeEnum.OK,
        message: 'File deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete file: ${uuid}`, error);
      throw new BadRequestException('Failed to delete file.');
    }
  }
}
