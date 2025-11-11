import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListUserDto, ReadUserListDto } from '../../dtos/list-user.dto';
import { UserService } from '../../services/user.service';
import { ListUsersQuery } from './list-user.query';

@QueryHandler(ListUsersQuery)
export class ListUserHandle implements IQueryHandler<ListUsersQuery> {
  constructor(private readonly userService: UserService) {}
  /**
   * Handles the list users query by retrieving a paginated list of users.
   * @param query List users query containing pagination and search parameters
   * @returns Paginated list of users
   */
  async execute(query: ListUsersQuery): Promise<ListUserDto> {
    const { dataPerPage, page, search } = query;

    const data = await this.userService.listWithPagination(
      page,
      dataPerPage,
      search
    );

    return <ListUserDto>{
      data:
        data.users && Array.isArray(data.users)
          ? data.users.map(
              (user) =>
                <ReadUserListDto>{
                  uuid: user.uuid,
                  name: user.name,
                  email: user.email,
                  password: user.password,
                  role: user.roles ? user.roles.name : null,
                  roleUuid: user.roleUuid,
                  createdAt: user.createdAt,
                  updatedAt: user.updatedAt,
                  deletedAt: user.deletedAt,
                }
            )
          : [],
      actualPage: data.currentPage,
      total: data.total,
      totalPages: data.totalPages,
    };
  }
}
