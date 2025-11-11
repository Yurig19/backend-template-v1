import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler()
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userRole = user?.roles.type;

    if (!userRole) {
      throw new ForbiddenException('User role not found');
    }

    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(
        'You do not have permission to access this resource'
      );
    }

    return true;
  }
}
