import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListAuditsDto, ReadAuditsListDto } from '../../dtos/list-audits.dto';
import { AuditsService } from '../../services/audits.service';
import { ListAuditsQuery } from './list-audits-query';

@QueryHandler(ListAuditsQuery)
export class AuditsListHandler implements IQueryHandler<ListAuditsQuery> {
  constructor(private readonly auditsService: AuditsService) {}

  async execute(query: ListAuditsQuery): Promise<ListAuditsDto> {
    const { dataPerPage, page, search } = query;

    const data = await this.auditsService.listWithPagination(
      page,
      dataPerPage,
      search
    );

    return <ListAuditsDto>{
      data: data.audits.length
        ? data.audits.map(
            (audit) =>
              <ReadAuditsListDto>{
                uuid: audit.uuid,
                entity: audit.entity,
                method: audit.method,
                url: audit.url,
                userAgent: audit.userAgent,
                userUuid: audit.userUuid,
                newData: audit.newData,
                oldData: audit.oldData,
                ip: audit.ip,
                createdAt: audit.createdAt,
              }
          )
        : [],
      actualPage: data.currentPage ?? 0,
      totalPages: data.totalPages ?? 0,
      total: data.total ?? 0,
    };
  }
}
