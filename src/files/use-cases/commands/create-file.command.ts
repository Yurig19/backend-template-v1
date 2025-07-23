import { ICommand } from '@nestjs/cqrs';

export class CreateFileCommand implements ICommand {
  constructor(public readonly file: Express.Multer.File) {}
}
