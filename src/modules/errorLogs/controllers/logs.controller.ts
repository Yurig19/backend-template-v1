import { ApiController } from '@/core/decorators/api-controller.decorator';
import { ApiEndpoint } from '@/core/decorators/methods.decorator';
import { RoleEnum } from '@/core/enums/role.enum';
import { Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListLogsDto } from '../dtos/list-logs.dto';
import { ListErrorLogsQueryDto } from '../dtos/list-query.dto';
import { LogsListQuery } from '../use-cases/queries/logs-list.query';

@ApiController('logs')
export class LogsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    method: 'GET',
    path: '/list',
    responseType: ListLogsDto,
    summary: 'List logs',
    description:
      'Retrieves a paginated list of error logs, optionally filtered by search criteria.',
    operationId: 'listLogs',
    isAuth: true,
    successDescription: 'list error logs successfully',
    roles: [RoleEnum.admin],
  })
  async list(@Query() query: ListErrorLogsQueryDto): Promise<ListLogsDto> {
    return await this.queryBus.execute(new LogsListQuery(query));
  }
}
