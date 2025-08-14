import { DeleteDto } from '@/core/dtos/delete.dto';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { AppError } from '@/core/exceptions/app.error';
import { File } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateFileDto } from '../dtos/create-file.dto';

export class FilesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(file: CreateFileDto): Promise<File> {
    try {
      return await this.prisma.file.create({
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

  async getByUuid(uuid: string): Promise<File> {
    try {
      return await this.prisma.file.findUnique({
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
      throw new AppError({
        message: `${error}`,
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
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
      throw new AppError({
        message: `${error}`,
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
    }
  }
}
