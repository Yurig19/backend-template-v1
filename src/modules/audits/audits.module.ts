import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaService } from 'prisma/prisma.service';
import { AuditsController } from './controllers/audits.controller';
import { AuditsService } from './services/audits.service';

@Module({
  imports: [CqrsModule],
  controllers: [AuditsController],
  providers: [PrismaService, AuditsService],
  exports: [AuditsService],
})
export class AuditsModule {}
