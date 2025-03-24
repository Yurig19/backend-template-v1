import { Injectable } from '@nestjs/common';

import type { Users } from '@prisma/client';

import { PrismaService } from 'prisma/prisma.service';

import { HttpStatusCodeEnum } from 'src/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from 'src/core/enums/errors/statusTextError.enum';
import { AppError } from 'src/core/errors/app.error';

import { CreateUserDto } from '../dtos/create/create-user.dto';

import { generateHashPassword } from 'src/core/utils/generatePassword';

import { RoleEnum } from 'src/core/enums/role.enum';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async initAdminUser(): Promise<void> {
    const isAdminUser = await this.prisma.users.count({
      where: { deletedAt: null, roles: { type: 'ADMIN' } },
    });

    if (!isAdminUser) {
      await this.createUser({
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: RoleEnum.admin,
      });
    }
  }

  async checkEmailUser(email: string): Promise<boolean> {
    const checkEmail = await this.prisma.users.count({
      where: { deletedAt: null, email: email },
    });

    if (checkEmail) {
      return true;
    }
    return false;
  }

  async createUser(createUserDto: CreateUserDto): Promise<Users> {
    try {
      const { password, role, ...data } = createUserDto;

      const roleExists = await this.prisma.roles.findFirst({
        where: { type: role },
      });

      if (!roleExists) {
        throw new AppError(
          HttpStatusCodeEnum.BAD_REQUEST,
          HttpStatusTextEnum.BAD_REQUEST,
          'role não encontrada no banco de dados'
        );
      }

      const hashedPassword = generateHashPassword(password);

      return await this.prisma.users.create({
        data: {
          ...data,
          roles: {
            connect: { uuid: roleExists.uuid },
          },
          password: hashedPassword,
        },
      });
    } catch (error) {
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `${error}`
      );
    }
  }

  async findUserByUuid(uuid: string): Promise<{
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
      return await this.prisma.users.findUnique({
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
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `${error}`
      );
    }
  }

  async findUserAuthByUuid(uuid: string): Promise<{
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
      return await this.prisma.users.findUnique({
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
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `${error}`
      );
    }
  }

  async findUserByEmail(email: string): Promise<{
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
      return await this.prisma.users.findUnique({
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
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `${error}`
      );
    }
  }

  async updateUser(uuid: string, data: Partial<Users>): Promise<Users> {
    try {
      return await this.prisma.users.update({
        where: { uuid },
        data,
      });
    } catch (error) {
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `${error}`
      );
    }
  }

  async deleteUser(uuid: string): Promise<void> {
    try {
      await this.prisma.users.delete({
        where: { uuid },
      });
    } catch (error) {
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `${error}`
      );
    }
  }

  async softDeleteUser(uuid: string): Promise<void> {
    try {
      await this.prisma.users.update({
        where: { uuid },
        data: { deletedAt: new Date() },
      });
    } catch (error) {
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `${error}`
      );
    }
  }
}
