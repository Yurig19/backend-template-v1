import { DeleteDto } from '@/core/dtos/delete.dto';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { AppError } from '@/core/errors/app.error';
import { PrismaService } from 'prisma/prisma.service';
import { CreateFileDto } from '../dtos/create-file.dto';
import { ReadFileDto } from '../dtos/read-file.dto';

export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  private fileEntity = this.prisma.file;

  async create(file: CreateFileDto): Promise<ReadFileDto> {
    try {
      return await this.fileEntity.create({
        data: file,
      });
    } catch (error) {
      throw new AppError({
        message: `${error}`,
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
    }
  }

  async getByUuid(uuid: string): Promise<ReadFileDto> {
    try {
      return await this.fileEntity.findUnique({
        where: {
          uuid: uuid,
        },
      });
    } catch (error) {
      throw new AppError({
        message: `${error}`,
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
    }
  }

  async softDelete(uuid: string): Promise<ReadFileDto> {
    try {
      return await this.fileEntity.update({
        where: {
          uuid: uuid,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      throw new AppError({
        message: `${error}`,
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
    }
  }

  async delete(uuid: string): Promise<DeleteDto> {
    try {
      await this.fileEntity.delete({
        where: { uuid },
      });
      return {
        success: true,
        statusCode: HttpStatusCodeEnum.OK,
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new AppError({
        message: `${error}`,
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
    }
  }
}
