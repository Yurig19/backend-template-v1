import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FilesController } from './files.controller';
import { FilesService } from './services/files.service';
import { CreateFileHandler } from './use-cases/commands/create-file.handle';

const handlers = [CreateFileHandler];

@Module({
  imports: [CqrsModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    //
    ...handlers,
  ],
})
export class FileModule {}
