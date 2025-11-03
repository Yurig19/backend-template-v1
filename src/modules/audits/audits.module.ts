import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from 'prisma/prisma.service';
import { AuditsController } from './controllers/audits.controller';
import { AuditsService } from './services/audits.service';
import { AuditsListHandler } from './use-cases/queries/list-audits.handle';

const handlers = [AuditsListHandler];

@Module({
  imports: [CqrsModule],
  controllers: [AuditsController],
  providers: [AuditsService, ...handlers],
  exports: [AuditsService],
})
export class AuditsModule {}
