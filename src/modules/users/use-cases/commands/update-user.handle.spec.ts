import { PrismaService } from '@/core/database/prisma.service';
import { RoleEnum } from '@/core/enums/role.enum';
import { RolesService } from '@/modules/roles/services/roles.service';
import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserDto } from '../../dtos/update-user.dto';
import { UserService } from '../../services/user.service';
import { UpdateUserCommand } from './update-user.command';
import { UpdateUserHandler } from './update-user.handle';

describe('UpdateUserHandler (integration)', () => {
  let prisma: PrismaService;
  let handler: UpdateUserHandler;
  let createdUserUuid: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService, UserService, RolesService, UpdateUserHandler],
    }).compile();

    prisma = module.get<PrismaService>(PrismaService);
    handler = module.get<UpdateUserHandler>(UpdateUserHandler);

    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    const employeeRole = await prisma.role.create({
      data: { type: RoleEnum.employee, name: 'Employee' },
    });

    await prisma.role.create({
      data: { type: RoleEnum.admin, name: 'Admin' },
    });

    const user = await prisma.user.create({
      data: {
        name: 'Initial User',
        email: 'initial@example.com',
        password: 'oldpassword',
        roleUuid: employeeRole.uuid,
      },
    });

    createdUserUuid = user.uuid;
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  it('should update user successfully and return updated data', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
      password: 'newpassword123',
      role: RoleEnum.admin,
    };

    const result = await handler.execute(
      new UpdateUserCommand(createdUserUuid, updateUserDto)
    );

    expect(result.name).toBe(updateUserDto.name);
    expect(result.email).toBe(updateUserDto.email);
    expect(result.role).toBe(updateUserDto.role);

    const updatedDbUser = await prisma.user.findUnique({
      where: { uuid: createdUserUuid },
    });
    expect(updatedDbUser?.name).toBe(updateUserDto.name);
    expect(updatedDbUser?.email).toBe(updateUserDto.email);
  });

  it('should throw BadRequestException if user does not exist', async () => {
    await prisma.user.deleteMany({ where: { uuid: createdUserUuid } });

    const updateUserDto: UpdateUserDto = {
      name: 'Non existent',
      email: 'nope@example.com',
      password: 'pass123',
      role: RoleEnum.admin,
    };

    await expect(
      handler.execute(new UpdateUserCommand(createdUserUuid, updateUserDto))
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
