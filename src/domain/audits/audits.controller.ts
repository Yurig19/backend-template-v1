import { Controller, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiController } from 'src/core/decorators/api-controller.decorator';
import { ApiEndpoint } from 'src/core/decorators/methods.decorator';
import { ListAuditsDto } from './dtos/list-audits.dto';
import { ListAuditsQuery } from './use-cases/queries/list-audits-query';

@ApiController('audits')
export class AuditsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    method: 'GET',
    path: '/list',
    responseType: ListAuditsDto,
    summary: 'List Audits',
    isAuth: true,
    errorDescription: 'list error Audits',
    successDescription: 'list error Audits successfully',
  })
  @ApiQuery({ name: 'page', type: Number, required: true, example: 1 })
  @ApiQuery({ name: 'dataPerPage', type: Number, required: true, example: 10 })
  @ApiQuery({
    name: 'search',
    type: String,
    example: 'search',
    required: false,
  })
  async listAudits(
    @Query('page') page: number,
    @Query('dataPerPage') dataPerPage: number,
    @Query('search') search?: string
  ): Promise<ListAuditsDto> {
    return await this.queryBus.execute(
      new ListAuditsQuery(page, dataPerPage, search)
    );
  }
}
