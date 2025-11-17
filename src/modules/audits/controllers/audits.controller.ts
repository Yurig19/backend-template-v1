import { ApiController } from '@/core/decorators/api-controller.decorator';
import { ApiEndpoint } from '@/core/decorators/methods.decorator';
import { RoleEnum } from '@/core/enums/role.enum';
import { ParseIntPipe, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListAuditsDto } from '../dtos/list-audits.dto';
import { ListAuditsQuery } from '../use-cases/queries/list-audits-query';

@ApiController('audits')
export class AuditsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiEndpoint({
    method: 'GET',
    path: '/list',
    responseType: ListAuditsDto,
    summary: 'List Audits',
    description:
      'Retrieves a paginated list of audit records, optionally filtered by search criteria.',
    operationId: 'listAudits',
    isAuth: true,
    successDescription: 'list error Audits successfully',
    roles: [RoleEnum.admin],
    queries: [
      { name: 'page', type: Number, required: true },
      { name: 'dataPerPage', type: Number, required: true },
      { name: 'search', type: String, required: false },
    ],
  })
  async listAudits(
    @Query('page', ParseIntPipe) page: number,
    @Query('dataPerPage', ParseIntPipe) dataPerPage: number,
    @Query('search') search?: string
  ): Promise<ListAuditsDto> {
    return await this.queryBus.execute(
      new ListAuditsQuery(page, dataPerPage, search)
    );
  }
}
