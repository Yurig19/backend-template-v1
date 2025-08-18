import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { AppError } from '@/core/exceptions/app.error';
import { generateHashPassword } from '@/core/utils/generatePassword';
import { RolesService } from '@/modules/roles/services/roles.service';
import { Injectable } from '@nestjs/common';
import type { Prisma, Users } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PatchUserDto } from '../dtos/patch-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly rolesService: RolesService
  ) {}

  private users = this.prisma.users;

  async initAdmin(): Promise<void> {
    const isAdminUser = await this.users.count({
      where: { deletedAt: null, roles: { type: 'ADMIN' } },
    });

    if (!isAdminUser) {
      await this.create({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: RoleEnum.admin,
      });
    }
  }

  async checkEmail(email: string): Promise<boolean> {
    const checkEmail = await this.users.count({
      where: { deletedAt: null, email: email },
    });

    if (checkEmail) {
      return true;
    }
    return false;
  }

  async checkUuid(uuid: string): Promise<boolean> {
    const checkUuid = await this.users.count({
      where: { deletedAt: null, uuid: uuid },
    });

    if (checkUuid) {
      return true;
    }
    return false;
  }

  async create(createUserDto: CreateUserDto): Promise<Users> {
    try {
      const { password, role, ...data } = createUserDto;

      const roleExists = await this.prisma.roles.findFirst({
        where: { type: role },
      });

      if (!roleExists) {
        throw new AppError({
          statusCode: HttpStatusCodeEnum.BAD_REQUEST,
          statusText: HttpStatusTextEnum.BAD_REQUEST,
          message: 'role not found in the database',
        });
      }

      const hashedPassword = generateHashPassword(password);

      return await this.users.create({
        data: {
          ...data,
          roles: {
            connect: { uuid: roleExists.uuid },
          },
          password: hashedPassword,
        },
      });
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `${error}`,
      });
    }
  }

  async findByUuid(uuid: string): Promise<{
    uuid: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    roles: {
      name: string;
    };
  }> {
    try {
      return await this.users.findUnique({
        where: { uuid },
        select: {
          uuid: true,
          name: true,
          email: true,
          password: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          roles: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `${error}`,
      });
    }
  }

  async findAuthByUuid(uuid: string): Promise<{
    uuid: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    roles: {
      name: string;
    };
  }> {
    try {
      return await this.users.findUnique({
        where: { uuid },
        select: {
          uuid: true,
          name: true,
          email: true,
          password: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          roles: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `${error}`,
      });
    }
  }

  async findByEmail(email: string): Promise<{
    uuid: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    roles: {
      name: string;
    };
  }> {
    try {
      return await this.users.findUnique({
        where: { email },
        select: {
          uuid: true,
          name: true,
          email: true,
          password: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          roles: {
            select: {
              name: true,
            },
          },
        },
      });
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `${error}`,
      });
    }
  }

  async listWithPagination(
    actualPage: number,
    dataPerPage: number,
    search?: string
  ): Promise<{
    users: (Users & {
      roles: {
        name: string;
      };
    })[];
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

      const query = this.prisma.users;

      const where: Prisma.UsersWhereInput = search
        ? { name: { contains: search, mode: 'insensitive' } }
        : {};

      const data = await query.findMany({
        where,
        skip,
        take,
        include: {
          roles: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          {
            createdAt: 'desc',
          },
        ],
      });

      const total = await query.count({ where });

      const totalPages = Math.max(Math.ceil(total / take), 1);

      return {
        users: data,
        total: total,
        totalPages: totalPages,
        currentPage: page,
      };
    } catch (error) {
      throw new AppError({
        message: `${error}`,
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      });
    }
  }

  async patch(
    uuid: string,
    data: PatchUserDto
  ): Promise<
    Users & {
      roles: {
        name: string;
      };
    }
  > {
    try {
      return await this.users.update({
        where: {
          uuid,
        },
        include: {
          roles: {
            select: {
              name: true,
            },
          },
        },
        data,
      });
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `${error}`,
      });
    }
  }

  async update(
    uuid: string,
    data: UpdateUserDto
  ): Promise<
    Users & {
      roles: {
        type: string;
      };
    }
  > {
    try {
      const { role, ...rest } = data;
      const roleData = await this.rolesService.findByType(role);

      if (!roleData) {
        throw new AppError({
          statusCode: HttpStatusCodeEnum.BAD_REQUEST,
          statusText: HttpStatusTextEnum.BAD_REQUEST,
          message: 'role not found',
        });
      }
      return await this.users.update({
        where: { uuid },
        data: {
          ...rest,
          roles: {
            connect: {
              uuid: roleData.uuid,
            },
          },
        },
        include: {
          roles: {
            select: {
              type: true,
            },
          },
        },
      });
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `${error}`,
      });
    }
  }

  async delete(uuid: string): Promise<void> {
    try {
      await this.users.delete({
        where: { uuid },
      });
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `${error}`,
      });
    }
  }

  async softDelete(uuid: string): Promise<void> {
    try {
      await this.prisma.users.update({
        where: { uuid },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `${error}`,
      });
    }
  }
}
