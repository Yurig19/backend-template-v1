import { randomUUID } from 'node:crypto';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { prisma } from '@/core/lib/prisma';
import { RolesModule } from '@/modules/roles/roles.module';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../services/user.service';
import { UserModule } from '../../users.module';
import { DeleteUserCommand } from './delete-user.command';
import { DeleteUserHandler } from './delete-user.handle';

describe('DeleteUserHandler (integration)', () => {
  let handler: DeleteUserHandler;
  let userService: UserService;

  let existingUserUuid: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      imports: [UserModule, RolesModule],
    }).compile();

    handler = module.get(DeleteUserHandler);
    userService = module.get(UserService);

    await prisma.audit.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    const role = await prisma.role.create({
      data: {
        name: RoleEnum.admin,
        createdAt: new Date(),
      },
    });

    const user = await prisma.user.create({
      data: {
        name: 'User Test',
        email: 'usertest@example.com',
        password: 'hashed',
        roleUuid: role.uuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    existingUserUuid = user.uuid;
  });

  afterAll(async () => {
    await prisma.audit.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();
    await prisma.$disconnect();
  });

  it('should delete user successfully when uuid exists', async () => {
    const result = await handler.execute(
      new DeleteUserCommand(existingUserUuid)
    );

    expect(result).toEqual({
      success: true,
      statusCode: HttpStatusCodeEnum.OK,
      message: 'User deleted successfully!',
    });

    const userInDb = await prisma.user.findUnique({
      where: { uuid: existingUserUuid },
    });
    expect(userInDb).toBeNull();
  });

  it('should throw NotFoundException when uuid does not exist', async () => {
    await expect(
      handler.execute(new DeleteUserCommand(randomUUID()))
    ).rejects.toThrow(NotFoundException);

    await expect(
      handler.execute(new DeleteUserCommand(randomUUID()))
    ).rejects.toThrow('User not found');
  });

  it('should throw BadRequestException when delete fails internally', async () => {
    const fakeUuid = randomUUID();

    const role = await prisma.role.findFirst();
    await prisma.user.create({
      data: {
        uuid: fakeUuid,
        name: 'User Error',
        email: 'error@example.com',
        password: 'hashed',
        roleUuid: role.uuid,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    jest
      .spyOn(userService, 'delete')
      .mockRejectedValueOnce(new Error('Database error'));

    await expect(
      handler.execute(new DeleteUserCommand(fakeUuid))
    ).rejects.toThrow(BadRequestException);

    await expect(
      handler.execute(new DeleteUserCommand(fakeUuid))
    ).rejects.toThrow('Failed to delete user.');
  });
});
