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
  constructor(private readonly prismaService: PrismaService) {}

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
      const page = Math.max(actualPage, 1);
      const take = Math.max(dataPerPage, 1);
      const skip = (page - 1) * take;

      const where: Prisma.LogsWhereInput = {};

      if (search) {
        where.OR = [{ error: { contains: search, mode: 'insensitive' } }];
      }

      const [logs, totalLogs] = await Promise.all([
        this.prismaService.logs.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        this.prismaService.logs.count({ where }),
      ]);

      const totalPages = Math.ceil(totalLogs / take);

      return {
        logs,
        total: totalLogs,
        totalPages,
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
