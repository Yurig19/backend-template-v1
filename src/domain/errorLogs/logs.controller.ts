import { Controller, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { ApiEndpoint } from 'src/core/decorators/methods.decorator';
import { ListLogsDto } from './dtos/list-logs.dto';
import { LogsListQuery } from './use-cases/queries/logs-list.query';

@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    method: 'GET',
    path: '/list',
    responseType: ListLogsDto,
    summary: 'List logs',
    isAuth: true,
    errorDescription: 'list error logs',
    successDescription: 'list error logs successfully',
  })
  @ApiQuery({ name: 'page', type: Number, required: true, example: 1 })
  @ApiQuery({ name: 'dataPerPage', type: Number, required: true, example: 10 })
  @ApiQuery({
    name: 'search',
    type: String,
    example: 'search',
    required: false,
  })
  async listLogs(
    @Query('page') page: number,
    @Query('dataPerPage') dataPerPage: number,
    @Query('search') search?: string
  ): Promise<ListLogsDto> {
    return await this.queryBus.execute(
      new LogsListQuery(page, dataPerPage, search)
    );
  }
}
