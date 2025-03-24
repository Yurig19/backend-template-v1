import { Injectable } from '@nestjs/common';

import { Audits, Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

import { HttpStatusCodeEnum } from 'src/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from 'src/core/enums/errors/statusTextError.enum';
import { AppError } from 'src/core/errors/app.error';

@Injectable()
export class AuditsService {
  constructor(private readonly prisma: PrismaService) {}

  async auditsListWithPagination(
    actualPage: number,
    dataPerPage: number,
    search?: string
  ): Promise<{
    audits: Audits[];
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

      const query = this.prisma.audits;

      const where: Prisma.AuditsWhereInput = search
        ? { entity: { contains: search, mode: 'insensitive' } }
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
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `Error fetching audits: ${error.message}`
      );
    }
  }
}
