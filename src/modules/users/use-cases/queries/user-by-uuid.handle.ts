import { NotFoundException } from '@nestjs/common';
import { type IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import type { ReadUserDto } from '../../dtos/read-user.dto';
import { UserService } from '../../services/user.service';
import { UserByUuidQuery } from './user-by-uuid.query';

@QueryHandler(UserByUuidQuery)
export class UserByUuidHandle implements IQueryHandler<UserByUuidQuery> {
  constructor(private readonly userService: UserService) {}

  /**
   * Handles the user by UUID query by retrieving a user by their UUID.
   * @param query User by UUID query containing user UUID
   * @returns User data if found
   */
  async execute(query: UserByUuidQuery): Promise<ReadUserDto> {
    const { uuid } = query;

    const user = await this.userService.findByUuid(uuid);

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return <ReadUserDto>{
      uuid: user.uuid,
      name: user.name,
      email: user.email,
      role: user.roles ? (user.roles.name ? user.roles.name : null) : null,
      password: user.password,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    };
  }
}
