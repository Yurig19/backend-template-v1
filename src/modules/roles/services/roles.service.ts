import { existsSync, readFileSync } from 'node:fs';
import * as path from 'node:path';
import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Role } from 'generated/prisma/client';
import { CreateRoleDto } from '../dtos/create-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly configService: ConfigService) {}

  private get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV') ?? '';
  }

  /**
   * Initializes roles from a JSON file if they don't already exist.
   * Only runs in non-test environments.
   */
  async init() {
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
          const existingRole = await prisma.role.findUnique({
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
  }

  /**
   * Finds a role by its type.
   * @param type Role type enum value
   * @returns Role UUID if found
   */
  async findByType(type: RoleEnum): Promise<{ uuid: string }> {
    return await prisma.role.findUnique({
      where: { type },
      select: { uuid: true },
    });
  }

  /**
   * Creates a new role in the database.
   * @param createRoleDto Role data to be created
   * @returns Created role
   */
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    return await prisma.role.create({
      data: createRoleDto,
    });
  }
}
