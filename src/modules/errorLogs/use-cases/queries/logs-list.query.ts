import { IQuery } from '@nestjs/cqrs';
import { ListErrorLogsQueryDto } from '../../dtos/list-query.dto';

export class LogsListQuery implements IQuery {
  constructor(public readonly params: ListErrorLogsQueryDto) {}
}
