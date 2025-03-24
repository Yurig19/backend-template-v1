import { Roles } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';

import { PrismaService } from 'prisma/prisma.service';

import { AppError } from 'src/core/errors/app.error';
import { HttpStatusCodeEnum } from 'src/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from 'src/core/enums/errors/statusTextError.enum';

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
          `Arquivo não encontrado: ${filePath}`
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
          'O arquivo roles.json não contém dados válidos.'
        );
      }
    } catch (error) {
      throw new AppError(
        HttpStatusCodeEnum.BAD_REQUEST,
        HttpStatusTextEnum.BAD_REQUEST,
        `Erro ao inicializar roles: ${error.message || error}`
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
        `Erro ao criar role: ${error.message || error}`
      );
    }
  }
}
