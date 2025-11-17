import { IQuery } from '@nestjs/cqrs';

export class LogsListQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly dataPerPage: number,
    public readonly search?: string
  ) {}
}
