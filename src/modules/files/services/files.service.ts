import { DeleteDto } from '@/core/dtos/delete.dto';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { handlePrismaError } from '@/core/errors/helpers/prisma-error.helper';
import { prisma } from '@/core/lib/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { File } from 'generated/prisma/client';
import { CreateFileDto } from '../dtos/create-file.dto';

@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);

  /**
   * Creates a new file record in the database.
   * @param file File data to be created
   * @returns Created file record
   */
  async create(file: CreateFileDto): Promise<File> {
    try {
      const { userUuid, ...data } = file;
      return await prisma.file.create({
        data: {
          ...data,
          ...(userUuid
            ? {
                user: { connect: { uuid: userUuid } },
              }
            : {}),
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Retrieves a file by its UUID.
   * @param uuid Unique identifier of the file
   * @returns File record if found
   */
  async getByUuid(uuid: string): Promise<File> {
    try {
      return await prisma.file.findUnique({
        where: {
          uuid: uuid,
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Performs a soft delete on a file by setting its deletedAt timestamp.
   * @param uuid Unique identifier of the file to soft delete
   * @returns Updated file record with deletedAt set
   */
  async softDelete(uuid: string): Promise<File> {
    try {
      return await prisma.file.update({
        where: {
          uuid: uuid,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    } catch (error) {
      handlePrismaError(error);
    }
  }

  /**
   * Permanently deletes a file from the database.
   * @param uuid Unique identifier of the file to delete
   * @returns Success response with status code and message
   */
  async delete(uuid: string): Promise<DeleteDto> {
    try {
      await prisma.file.delete({
        where: { uuid },
      });
      return {
        success: true,
        statusCode: HttpStatusCodeEnum.OK,
        message: 'File deleted successfully',
      };
    } catch (error) {
      handlePrismaError(error);
    }
  }
}
