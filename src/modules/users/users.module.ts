import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from 'prisma/prisma.service';
import { RolesModule } from '../roles/roles.module';
import { UsersController } from './controllers/users.controller';
import { UserService } from './services/user.service';
import { CreateUserHandle } from './use-cases/commands/create-user.handle';
import { DeleteUserHandler } from './use-cases/commands/delete-user.handle';
import { ListUserHandle } from './use-cases/queries/list-user.handle';
import { UserByUuidHandle } from './use-cases/queries/user-by-uuid.handle';

const handlers = [
  CreateUserHandle,
  DeleteUserHandler,
  //
  UserByUuidHandle,
  ListUserHandle,
];

@Global()
@Module({
  imports: [CqrsModule, RolesModule],
  controllers: [UsersController],
  providers: [
    PrismaService,
    UserService,
    //
    ...handlers,
  ],
  exports: [UserService],
})
export class UserModule {}
