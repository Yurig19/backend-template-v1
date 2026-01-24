import { ApiController } from '@/core/decorators/api-controller.decorator';
import { ApiEndpoint } from '@/core/decorators/methods.decorator';
import { GetUser } from '@/core/decorators/user-decorator';
import { ReadUserAuthDto } from '@/modules/users/dtos/read-user-auth.dto';
import { ParseBoolPipe, Query, UploadedFile } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ReadFileDto } from '../dtos/read-file.dto';
import { CreateFileCommand } from '../use-cases/commands/create-file.command';

@ApiController('files')
export class FilesController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiEndpoint({
    method: 'POST',
    path: '/create',
    summary: 'Create a file',
    description:
      'Uploads a file and creates a new file record in the system. Supports both public and private uploads.',
    operationId: 'createFile',
    responseType: ReadFileDto,
    successDescription: 'File successfully created',
    isAuth: true,
    isFile: 'any',
    queries: [
      {
        name: 'isPrivate',
        type: Boolean,
        required: false,
        description: 'private file',
      },
    ],
  })
  async createFile(
    @GetUser() userData: ReadUserAuthDto,
    @UploadedFile() file: Express.Multer.File,
    @Query('isPrivate', ParseBoolPipe) isPrivate?: boolean
  ): Promise<ReadFileDto> {
    return this.commandBus.execute(
      new CreateFileCommand(userData, file, isPrivate)
    );
  }
}
