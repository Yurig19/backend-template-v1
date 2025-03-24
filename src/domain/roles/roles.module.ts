import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { RolesService } from './services/roles.service';
import { PrismaService } from 'prisma/prisma.service';

const handlers = [];

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [
    PrismaService,
    RolesService,
    //
    ...handlers,
  ],
  exports: [RolesService],
})
export class RolesModule {}
