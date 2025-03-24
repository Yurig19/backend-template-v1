import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

// Prisma & Database Models
import { Logs, Prisma } from '@prisma/client';

// Enums
import { HttpStatusCodeEnum } from 'src/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from 'src/core/enums/errors/statusTextError.enum';

// Errors
import { AppError } from 'src/core/errors/app.error';

@Injectable()
export class LogsService {
  constructor(private readonly prisma: PrismaService) {}

  async logsListWithPagination(
    actualPage: number,
    dataPerPage: number,
    search?: string
  ): Promise<{
    logs: Logs[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const page =
        Number.isNaN(Number(actualPage)) || Number(actualPage) < 1
          ? 1
          : Number(actualPage);
      const take =
        Number.isNaN(Number(dataPerPage)) || Number(dataPerPage) < 1
          ? 10
          : Number(dataPerPage);
      const skip = (page - 1) * take;
      const query = this.prisma.logs;

      const where: Prisma.LogsWhereInput = {};

      if (search) {
        where.OR = [{ error: { contains: search, mode: 'insensitive' } }];
      }

      const data = await query.findMany({
        where,
        skip,
        take,
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      });

      const totalLogs = await query.count({ where });

      const totalPages = Math.max(Math.ceil(totalLogs / take), 1);

      return {
        logs: data,
        total: totalLogs,
        totalPages: totalPages,
        currentPage: page,
      };
    } catch (error) {
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `${error}`
      );
    }
  }
}
