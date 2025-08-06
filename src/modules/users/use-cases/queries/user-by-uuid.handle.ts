import { HttpStatusCodeEnum } from '@/core/enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '@/core/enums/errors/statusTextError.enum';
import { AppError } from '@/core/errors/app.error';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { ReadUserDto } from '../../dtos/read-user.dto';
import { UserService } from '../../services/user.service';
import { UserByUuidQuery } from './user-by-uuid.query';

@QueryHandler(UserByUuidQuery)
export class UserByUuidHandle implements IQueryHandler<UserByUuidQuery> {
  constructor(private readonly userService: UserService) {}

  async execute(query: UserByUuidQuery): Promise<ReadUserDto> {
    const { uuid } = query;

    const user = await this.userService.findByUuid(uuid);

    if (!user) {
      throw new AppError({
        statusCode: HttpStatusCodeEnum.NOT_FOUND,
        statusText: HttpStatusTextEnum.NOT_FOUND,
        message: 'User not found.',
      });
    }

    return {
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.roles ? (user.roles.name ? user.roles.name : null) : null,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    } as ReadUserDto;
  }
}
