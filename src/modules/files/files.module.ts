import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { FilesController } from './controllers/files.controller';
import { FilesService } from './services/files.service';
import { UploadService } from './services/upload.service';
import { CreateFileHandler } from './use-cases/commands/create-file.handle';

const handlers = [CreateFileHandler];

@Module({
  imports: [CqrsModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    UploadService,
    //
    ...handlers,
  ],
  exports: [FilesService, UploadService],
})
export class FileModule {}
