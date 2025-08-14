import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { AppError } from '@/core/errors/app.error';
import { Injectable } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRoleDto } from '../dtos/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async initRoles() {
    try {
      const filePath = path.resolve(
        process.cwd(),
        'src/modules/roles/services/init.json'
      );

      if (!existsSync(filePath)) {
        throw new AppError({
          statusCode: HttpStatusCodeEnum.BAD_REQUEST,
          statusText: HttpStatusTextEnum.BAD_REQUEST,
          message: `File not found: ${filePath}`,
        });
      }

      const rolesData = JSON.parse(readFileSync(filePath, 'utf-8'));

      if (rolesData && Array.isArray(rolesData)) {
        for (const role of rolesData) {
          const existingRole = await this.prisma.roles.findUnique({
            where: { type: role.type },
          });

          const roleData: CreateRoleDto = {
            name: role.name,
            type: role.type,
          };

          if (!existingRole) {
            await this.createRole(roleData);
          }
        }
      } else {
        throw new AppError({
          statusCode: HttpStatusCodeEnum.BAD_REQUEST,
          statusText: HttpStatusTextEnum.BAD_REQUEST,
          message: 'The roles.json file does not contain valid data.',
        });
      }
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `Failed to initialize roles: ${error.message || error}`,
      });
    }
  }

  async findByType(type: RoleEnum): Promise<{ uuid: string }> {
    try {
      return await this.prisma.roles.findUnique({
        where: { type },
        select: { uuid: true },
      });
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `Failed to find role: ${error.message || error}`,
      });
    }
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Roles> {
    try {
      return await this.prisma.roles.create({
        data: createRoleDto,
      });
    } catch (error) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
        message: `Failed to create role: ${error.message || error}`,
      });
    }
  }
}
