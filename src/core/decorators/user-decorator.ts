import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ReadUserAuthDto } from 'src/domain/users/dtos/read/read-user-auth.dto';

export const GetUser = createParamDecorator(
  (data: keyof ReadUserAuthDto | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;

    if (data) {
      return user?.[data];
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
    } as ReadUserAuthDto;
  }
);
