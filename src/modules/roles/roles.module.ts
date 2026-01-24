import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { RolesService } from './services/roles.service';

const handlers = [];

@Module({
  imports: [ConfigModule, CqrsModule],
  controllers: [],
  providers: [
    RolesService,
    //
    ...handlers,
  ],
  exports: [RolesService],
})
export class RolesModule {}
