import { randomUUID } from 'node:crypto';
import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { RoleEnum } from '@/core/enums/role.enum';
import { AppError } from '@/core/errors/app.error';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from '../../services/user.service';
import { DeleteUserCommand } from './delete-user.command';
import { DeleteUserHandler } from './delete-user.handle';

describe('DeleteUserHandler (integration)', () => {
  let handler: DeleteUserHandler;
  let prisma: PrismaService;
  let userService: UserService;

  let existingUserUuid: string;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    require('dotenv').config({ path: '.env.test' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [DeleteUserHandler, UserService, PrismaService],
    }).compile();

    handler = module.get(DeleteUserHandler);
    prisma = module.get(PrismaService);
    userService = module.get(UserService);

    await prisma.audits.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();

    const role = await prisma.roles.create({
      data: {
        uuid: randomUUID(),
        name: RoleEnum.admin,
        createdAt: new Date(),
      },
    });

    const user = await prisma.users.create({
      data: {
        uuid: randomUUID(),
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
    await prisma.audits.deleteMany();
    await prisma.users.deleteMany();
    await prisma.roles.deleteMany();
    await prisma.$disconnect();
  });

  it('should delete user successfully when uuid exists', async () => {
    const result = await handler.execute(
      new DeleteUserCommand(existingUserUuid)
    );

    expect(result).toEqual({
      success: true,
      statusCode: HttpStatusCodeEnum.OK,
      message: 'User deleted successfully',
    });

    const userInDb = await prisma.users.findUnique({
      where: { uuid: existingUserUuid },
    });
    expect(userInDb).toBeNull();
  });

  it('should throw AppError (NOT_FOUND) when uuid does not exist', async () => {
    await expect(
      handler.execute(new DeleteUserCommand(randomUUID()))
    ).rejects.toEqual(
      new AppError({
        message: 'User not found',
        statusCode: HttpStatusCodeEnum.NOT_FOUND,
        statusText: HttpStatusTextEnum.NOT_FOUND,
      })
    );
  });

  it('should throw AppError (BAD_REQUEST) when delete fails internally', async () => {
    const fakeUuid = randomUUID();

    const role = await prisma.roles.findFirst();
    await prisma.users.create({
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
    ).rejects.toEqual(
      new AppError({
        message: 'Database error',
        statusCode: HttpStatusCodeEnum.BAD_REQUEST,
        statusText: HttpStatusTextEnum.BAD_REQUEST,
      })
    );
  });
});
