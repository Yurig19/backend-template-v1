import type { IQuery } from '@nestjs/cqrs';

export class UserByUuidQuery implements IQuery {
  constructor(public readonly uuid: string) {}
}
