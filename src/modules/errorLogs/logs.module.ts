import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from 'prisma/prisma.service';
import { LogsController } from './controllers/logs.controller';
import { LogsService } from './services/logs.service';
import { LogsListHandler } from './use-cases/queries/logs-list.handle';

const handlers = [LogsListHandler];

@Module({
  imports: [CqrsModule],
  controllers: [LogsController],
  providers: [PrismaService, LogsService, ...handlers],
  exports: [LogsService],
})
export class LogsModule {}
