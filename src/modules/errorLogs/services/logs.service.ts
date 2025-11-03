import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Logs, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listWithPagination(
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
      this.logger.error('Failed to list logs with pagination', error);
      throw new BadRequestException('Failed to retrieve logs list.');
    }
  }
}
