import { prisma } from '@/core/lib/prisma';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Audit, Prisma } from 'generated/prisma/client';

@Injectable()
export class AuditsService {
  private readonly logger = new Logger(AuditsService.name);

  /**
   * Lists audit records with pagination and optional search filtering.
   * @param actualPage Current page number (defaults to 1 if invalid)
   * @param dataPerPage Number of items per page (defaults to 10 if invalid)
   * @param search Optional search term to filter audits by entity or method
   * @returns Paginated list of audits with total count and pagination metadata
   */
  async listWithPagination(
    actualPage: number,
    dataPerPage: number,
    search?: string
  ): Promise<{
    audits: Audit[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      const page = actualPage;
      const take = dataPerPage;
      const skip = (page - 1) * take;

      const where: Prisma.AuditWhereInput = {};

      if (search) {
        where.OR = [
          { entity: { contains: search, mode: 'insensitive' } },
          { method: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [audits, total] = await prisma.$transaction([
        prisma.audit.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.audit.count({ where }),
      ]);

      const totalPages = Math.max(Math.ceil(total / take), 1);

      return {
        audits,
        total,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      this.logger.error('Failed to list audits with pagination', error);
      throw new BadRequestException('Failed to retrieve audits list.');
    }
  }
}
