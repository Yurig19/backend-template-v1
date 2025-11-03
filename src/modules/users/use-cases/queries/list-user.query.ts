import { IQuery } from '@nestjs/cqrs';

export class ListUsersQuery implements IQuery {
  constructor(
    public readonly page: number,
    public readonly dataPerPage: number,
    public readonly search?: string
  ) {}
}
