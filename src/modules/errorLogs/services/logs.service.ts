import { prisma } from '@/core/lib/prisma';
import { Injectable, Logger } from '@nestjs/common';
import { ErrorLog, Prisma } from 'generated/prisma/client';

@Injectable()
export class LogsService {
  private readonly logger = new Logger(LogsService.name);

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
    const page = actualPage;
    const take = dataPerPage;
    const skip = (page - 1) * take;

    const where: Prisma.ErrorLogWhereInput = {};

    if (search) {
      where.OR = [
        {
          error: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    const [logs, total] = await prisma.$transaction([
      prisma.errorLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.errorLog.count({ where }),
    ]);

    const totalPages = Math.max(Math.ceil(total / take), 1);

    return {
      logs,
      total,
      totalPages,
      currentPage: page,
    };
  }
}
