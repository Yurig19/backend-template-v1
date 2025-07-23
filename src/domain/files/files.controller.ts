import { ApiController } from '@/core/decorators/api-controller.decorator';
import { ApiEndpoint } from '@/core/decorators/methods.decorator';
import { UploadedFile } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateFileDto } from './dtos/create-file.dto';
import { ReadFileDto } from './dtos/read-file.dto';
import { CreateFileCommand } from './use-cases/commands/create-file.command';

@ApiController('files')
export class FilesController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiEndpoint({
    method: 'POST',
    path: '/create',
    summary: 'Create a file',
    operationId: 'createFile',
    responseType: ReadFileDto,
    bodyType: CreateFileDto,
    successDescription: 'File successfully created',
    errorDescription: 'Invalid data',
    isAuth: true,
    isFile: true,
  })
  async createFile(@UploadedFile() file: Express.Multer.File) {
    return this.commandBus.execute(new CreateFileCommand(file));
  }
}
