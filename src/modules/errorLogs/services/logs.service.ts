import { PrismaService } from '@/core/database/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ErrorLog, Prisma } from 'generated/prisma/client';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists error logs with pagination and optional search filtering.
   * @param actualPage Current page number (defaults to 1 if invalid)
   * @param dataPerPage Number of items per page (defaults to 10 if invalid)
   * @param search Optional search term to filter logs by error message
   * @returns Paginated list of error logs with total count and pagination metadata
   */
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
