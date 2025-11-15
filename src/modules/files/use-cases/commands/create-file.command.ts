import { ReadUserAuthDto } from '@/modules/users/dtos/read-user-auth.dto';
import { ICommand } from '@nestjs/cqrs';

export class CreateFileCommand implements ICommand {
  constructor(
    public readonly userData: ReadUserAuthDto,
    public readonly file: Express.Multer.File,
    public readonly isPrivate: boolean = false
  ) {}
}
