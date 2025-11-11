import { IQuery } from '@nestjs/cqrs';
import { ListAuditsQueryDto } from '../../dtos/list-query.dto';

export class ListAuditsQuery implements IQuery {
  constructor(public readonly params: ListAuditsQueryDto) {}
}
