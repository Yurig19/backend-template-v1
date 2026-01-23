import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { LogsController } from './controllers/logs.controller';
import { LogsService } from './services/logs.service';
import { LogsListHandler } from './use-cases/queries/logs-list.handle';

const handlers = [LogsListHandler];

@Module({
  imports: [CqrsModule],
  controllers: [LogsController],
  providers: [LogsService, ...handlers],
  exports: [LogsService],
})
export class LogsModule {}
