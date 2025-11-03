import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { RoleEnum } from '@/core/enums/role.enum';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Roles } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreateRoleDto } from '../dtos/create-role.dto';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly prisma: PrismaService) {}

  private nodeEnv = process.env.NODE_ENV;

  async initRoles() {
    try {
      if (this.nodeEnv !== 'test') {
        const filePath = path.resolve(
          process.cwd(),
          'src/modules/roles/services/init.json'
        );

        if (!existsSync(filePath)) {
          throw new BadRequestException(`File not found: ${filePath}`);
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
          throw new BadRequestException(
            'The roles.json file does not contain valid data.'
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize roles', error);
      throw new BadRequestException('Failed to initialize roles.');
    }
  }

  async findByType(type: RoleEnum): Promise<{ uuid: string }> {
    try {
      return await this.prisma.roles.findUnique({
        where: { type },
        select: { uuid: true },
      });
    } catch (error) {
      this.logger.error(`Failed to find role by type: ${type}`, error);
      throw new BadRequestException('Failed to find role.');
    }
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Roles> {
    try {
      return await this.prisma.roles.create({
        data: createRoleDto,
      });
    } catch (error) {
      this.logger.error('Failed to create role', error);
      throw new BadRequestException('Failed to create role.');
    }
  }
}
