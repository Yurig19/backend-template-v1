import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { Injectable } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { HttpStatusCodeEnum } from 'src/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from 'src/core/enums/errors/statusTextError.enum';
import { AppError } from 'src/core/errors/app.error';
import { CreateRoleDto } from '../dtos/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async initRoles() {
    try {
      const filePath = path.resolve(__dirname, 'init.json');

      if (!existsSync(filePath)) {
        throw new AppError(
          HttpStatusCodeEnum.BAD_REQUEST,
          HttpStatusTextEnum.BAD_REQUEST,
          `File not found: ${filePath}`
        );
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
        throw new AppError(
          HttpStatusCodeEnum.BAD_REQUEST,
          HttpStatusTextEnum.BAD_REQUEST,
          'The roles.json file does not contain valid data.'
        );
      }
    } catch (error) {
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `Failed to initialize roles: ${error.message || error}`
      );
    }
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Roles> {
    try {
      return await this.prisma.roles.create({
        data: createRoleDto,
      });
    } catch (error) {
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `Failed to create role: ${error.message || error}`
      );
    }
  }
}
