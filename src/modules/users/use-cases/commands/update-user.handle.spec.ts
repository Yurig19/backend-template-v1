import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { AppError } from '@/core/exceptions/app.error';
import { RolesService } from '@/modules/roles/services/roles.service';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
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
  });

  beforeEach(async () => {
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();

    await prisma.roles.createMany({
      data: [
        { uuid: RoleEnum.employee, name: 'Employee' },
        { uuid: RoleEnum.admin, name: 'Admin' },
      ],
    });

    const user = await prisma.users.create({
      data: {
        name: 'Initial User',
        email: 'initial@example.com',
        password: 'oldpassword',
        roleUuid: RoleEnum.employee,
      },
    });

    createdUserUuid = user.uuid;
  });

  afterAll(async () => {
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

    const updatedDbUser = await prisma.users.findUnique({
      where: { uuid: createdUserUuid },
    });
    expect(updatedDbUser?.name).toBe(updateUserDto.name);
    expect(updatedDbUser?.email).toBe(updateUserDto.email);
  });

  it('should throw AppError (400) if user does not exist', async () => {
    await prisma.users.deleteMany({ where: { uuid: createdUserUuid } });

    const updateUserDto: UpdateUserDto = {
      name: 'Non existent',
      email: 'nope@example.com',
      password: 'pass123',
      role: RoleEnum.admin,
    };

    await expect(
      handler.execute(new UpdateUserCommand(createdUserUuid, updateUserDto))
    ).rejects.toMatchObject(
      new AppError({
        message: '',
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      })
    );
  });
});
