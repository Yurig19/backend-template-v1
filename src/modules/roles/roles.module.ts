import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RolesService } from './services/roles.service';

const handlers = [];

@Module({
  imports: [CqrsModule],
  controllers: [],
  providers: [
    RolesService,
    //
    ...handlers,
  ],
  exports: [RolesService],
})
export class RolesModule {}
