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
      const page = Math.max(actualPage, 1);
      const take = Math.max(dataPerPage, 1);
      const skip = (page - 1) * take;

      const where: Prisma.AuditsWhereInput = {};

      if (search) {
        where.OR = [{ entity: { contains: search, mode: 'insensitive' } }];
      }

      const [audits, totalAudits] = await Promise.all([
        this.prisma.audits.findMany({
          where,
          skip,
          take,
        }),
        this.prisma.audits.count({ where }),
      ]);

      const totalPages = Math.ceil(totalAudits / take);

      return {
        audits,
        total: totalAudits,
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
