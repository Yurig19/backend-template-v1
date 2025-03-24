import type { HttpStatusCodeEnum } from '../enums/errors/statusCodeErrors.enum';
import type { HttpStatusTextEnum } from '../enums/errors/statusTextError.enum';

export class AppError extends Error {
  constructor(
    public readonly statusCode: HttpStatusCodeEnum,
    public readonly statusText: HttpStatusTextEnum,
    message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
