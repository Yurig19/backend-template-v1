import { ApiController } from '@/core/decorators/api-controller.decorator';
import { ApiEndpoint } from '@/core/decorators/methods.decorator';
import { RoleEnum } from '@/core/enums/role.enum';
import { Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ListAuditsDto } from '../dtos/list-audits.dto';
import { ListAuditsQueryDto } from '../dtos/list-query.dto';
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
  })
  async listAudits(@Query() query: ListAuditsQueryDto): Promise<ListAuditsDto> {
    return await this.queryBus.execute(new ListAuditsQuery(query));
  }
}
