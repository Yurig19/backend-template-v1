import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';
import { generateHashPassword } from '@/core/security/helpers/password.helper';
import { RolesService } from '@/modules/roles/services/roles.service';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma, Role, User } from 'generated/prisma/client';
import { search } from 'redoc/typings/services/SearchWorker.worker';
import { CreateUserDto } from '../dtos/create-user.dto';
import { PatchUserDto } from '../dtos/patch-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly rolesService: RolesService,
    private readonly configService: ConfigService
  ) {}

  private users = prisma.user;

  /**
   * Initializes an admin user if no admin exists in the database.
   * Uses environment variables for admin credentials.
   */
  async init(): Promise<void> {
    const adminName = this.configService.get<string>('ADMIN_NAME');
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
    const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

    const isAdminUser = await this.users.count({
      where: { deletedAt: null, roles: { type: 'ADMIN' } },
    });

    if (!isAdminUser) {
      await this.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: RoleEnum.admin,
      });
    }
  }

  /**
   * Checks if an email address already exists in the database.
   * @param email Email address to check
   * @returns True if email exists, false otherwise
   */
  async checkEmail(email: string): Promise<boolean> {
    const checkEmail = await this.users.count({
      where: { deletedAt: null, email: email },
    });

    if (checkEmail) {
      return true;
    }
    return false;
  }

  /**
   * Checks if a user UUID already exists in the database.
   * @param uuid User UUID to check
   * @returns True if UUID exists, false otherwise
   */
  async checkUuid(uuid: string): Promise<boolean> {
    const checkUuid = await this.users.count({
      where: { deletedAt: null, uuid: uuid },
    });

    if (checkUuid) {
      return true;
    }
    return false;
  }

  /**
   * Creates a new user with hashed password and associated role.
   * @param createUserDto User data to be created
   * @returns Created user with role information
   */
  async create(createUserDto: CreateUserDto): Promise<User & { roles: Role }> {
    const { password, role, ...data } = createUserDto;

    const roleExists = await prisma.role.findFirst({
      where: { type: role },
    });

    if (!roleExists) {
      throw new BadRequestException('role not found in the database');
    }

    const hashedPassword = await generateHashPassword(password);

    return await this.users.create({
      data: {
        ...data,
        roles: {
          connect: { uuid: roleExists.uuid },
        },
        password: hashedPassword,
      },
      include: { roles: true },
    });
  }

  /**
   * Finds a user by UUID with role name information.
   * @param uuid User UUID to search for
   * @returns User data with role name
   */
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
  }

  /**
   * Finds a user by UUID for authentication purposes with role type.
   * @param uuid User UUID to search for
   * @returns User data with role type for authentication
   */
  async findAuthByUuid(uuid: string): Promise<{
    uuid: string;
    name: string;
    email: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date;
    roles: {
      type: string;
    };
  }> {
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
            type: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    action: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Finds a user by email address with role name information.
   * @param email Email address to search for
   * @returns User data with role name
   */
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
  }

  /**
   * Lists users with pagination and optional search filtering.
   * @param actualPage Current page number (defaults to 1 if invalid)
   * @param dataPerPage Number of items per page (defaults to 10 if invalid)
   * @param search Optional search term to filter users by name
   * @returns Paginated list of users with total count and pagination metadata
   */
  async listWithPagination(
    actualPage: number,
    dataPerPage: number,
    search?: string
  ): Promise<{
    users: (User & {
      roles: { name: string };
    })[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const page = actualPage;
    const take = dataPerPage;
    const skip = (page - 1) * take;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          roles: {
            select: { name: true },
          },
        },
        orderBy: [{ createdAt: 'desc' }],
      }),

      prisma.user.count({ where }),
    ]);

    const totalPages = Math.max(Math.ceil(total / take), 1);

    return {
      users,
      total,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Partially updates a user by UUID (PATCH operation).
   * @param uuid User UUID to update
   * @param data Partial user data to update
   * @returns Updated user with role name
   */
  async patch(
    uuid: string,
    data: PatchUserDto
  ): Promise<
    User & {
      roles: {
        name: string;
      };
    }
  > {
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
  }

  /**
   * Updates a user by UUID with role assignment (PUT operation).
   * @param uuid User UUID to update
   * @param data User data to update including role
   * @returns Updated user with role type
   */
  async update(
    uuid: string,
    data: UpdateUserDto
  ): Promise<
    User & {
      roles: {
        type: string;
      };
    }
  > {
    const { role, ...rest } = data;
    const roleData = await this.rolesService.findByType(role);

    if (!roleData) {
      throw new BadRequestException('role not found');
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
  }

  /**
   * Permanently deletes a user from the database.
   * @param uuid User UUID to delete
   */
  async delete(uuid: string): Promise<void> {
    await this.users.delete({
      where: { uuid },
    });
  }

  /**
   * Performs a soft delete on a user by setting its deletedAt timestamp.
   * @param uuid User UUID to soft delete
   */
  async softDelete(uuid: string): Promise<void> {
    await this.users.update({
      where: { uuid },
      data: { deletedAt: new Date() },
    });
  }
}
