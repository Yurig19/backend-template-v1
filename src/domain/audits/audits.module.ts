import { Module } from '@nestjs/common';
import { AuditsController } from './audits.controller';
import { AuditsService } from './services/audits.service';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  imports: [CqrsModule],
  controllers: [AuditsController],
  providers: [PrismaService, AuditsService],
  exports: [AuditsService],
})
export class AuditsModule {}
