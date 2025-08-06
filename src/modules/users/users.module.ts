import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from 'prisma/prisma.service';
import { UserService } from './services/user.service';
import { CreateUserHandle } from './use-cases/commands/create-user.handle';
import { UserByUuidHandle } from './use-cases/queries/user-by-uuid.handle';
import { UsersController } from './users.controller';

const handlers = [
  CreateUserHandle,
  //
  UserByUuidHandle,
];

@Global()
@Module({
  imports: [CqrsModule],
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
