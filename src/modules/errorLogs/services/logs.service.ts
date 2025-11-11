import { PrismaService } from '@/core/database/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ErrorLog, Prisma } from 'generated/prisma/client';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listWithPagination(
    actualPage: number,
    dataPerPage: number,
    search?: string
  ): Promise<{
    logs: ErrorLog[];
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

      const where: Prisma.ErrorLogWhereInput = {};

      if (search) {
        where.OR = [{ error: { contains: search, mode: 'insensitive' } }];
      }

      const [logs, total] = await this.prisma.$transaction([
        this.prisma.errorLog.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.errorLog.count({ where }),
      ]);

      const totalPages = Math.max(Math.ceil(total / take), 1);

      return {
        logs,
        total,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      this.logger.error('Failed to list logs with pagination', error);
      throw new BadRequestException('Failed to retrieve logs list.');
    }
  }
}
