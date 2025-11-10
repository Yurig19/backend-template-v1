import { PrismaService } from '@/core/database/prisma.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Audit, Prisma } from 'generated/prisma/client';

@Injectable()
export class AuditsService {
  private readonly logger = new Logger(AuditsService.name);

  constructor(private readonly prisma: PrismaService) {}

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
      const page =
        Number.isNaN(Number(actualPage)) || Number(actualPage) < 1
          ? 1
          : Number(actualPage);
      const take =
        Number.isNaN(Number(dataPerPage)) || Number(dataPerPage) < 1
          ? 10
          : Number(dataPerPage);
      const skip = (page - 1) * take;

      const query = this.prisma.audit;

      const where: Prisma.AuditWhereInput = search
        ? {
            OR: [
              { entity: { contains: search, mode: 'insensitive' } },
              { method: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {};

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

      const totalAudits = await query.count({ where });

      const totalPages = Math.max(Math.ceil(totalAudits / take), 1);

      return {
        audits: data,
        total: totalAudits,
        totalPages: totalPages,
        currentPage: page,
      };
    } catch (error) {
      this.logger.error('Failed to list audits with pagination', error);
      throw new BadRequestException('Failed to retrieve audits list.');
    }
  }
}
