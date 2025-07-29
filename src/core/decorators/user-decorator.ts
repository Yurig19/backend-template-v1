import { ReadUserAuthDto } from '@/domain/users/dtos/read-user-auth.dto';
import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: keyof ReadUserAuthDto | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;

    if (data) {
      return user?.[data];
    }

    return <ReadUserAuthDto>{
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
);
