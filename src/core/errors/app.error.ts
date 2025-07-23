import type { HttpStatusCodeEnum } from '../enums/errors/statusCodeErrors.enum';
import type { HttpStatusTextEnum } from '../enums/errors/statusTextError.enum';

type AppErrorParams = {
  statusCode: HttpStatusCodeEnum;
  statusText: HttpStatusTextEnum;
  message: string;
};

export class AppError extends Error {
  public readonly statusCode: HttpStatusCodeEnum;
  public readonly statusText: HttpStatusTextEnum;

  constructor({ statusCode, statusText, message }: AppErrorParams) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
}
