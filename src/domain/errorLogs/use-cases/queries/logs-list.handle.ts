import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { LogsListQuery } from './logs-list.query';
import { LogsService } from '../../services/logs.service';
import { ListLogsDto, ReadListLogsDto } from '../../dtos/list-logs.dto';

@QueryHandler(LogsListQuery)
export class LogsListHandler implements IQueryHandler<LogsListQuery> {
  constructor(private readonly logsService: LogsService) {}

  async execute(query: LogsListQuery): Promise<ListLogsDto> {
    const { dataPerPage, page, search } = query;

    const data = await this.logsService.logsListWithPagination(
      dataPerPage,
      page,
      search
    );

    return <ListLogsDto>{
      data: data.logs.length
        ? data.logs.map(
            (log) =>
              <ReadListLogsDto>{
                uuid: log.uuid,
                ip: log.ip,
                error: log.error,
                method: log.method,
                path: log.path,
                statusCode: log.statusCode,
                statusText: log.statusText,
                userAgent: log.userAgent,
                createdAt: log.createdAt,
              }
          )
        : [],
      actualPage: data.currentPage ?? 0,
      totalPages: data.totalPages ?? 0,
      total: data.total ?? 0,
    };
  }
}
