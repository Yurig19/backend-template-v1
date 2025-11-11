import { UserService } from '@/modules/users/services/user.service';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly userService: UserService) {
    super();
  }

  /**
   * Validates JWT token and ensures the user exists in the database.
   * @param context Execution context containing the request
   * @returns True if authentication is successful, throws UnauthorizedException otherwise
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isActivated = (await super.canActivate(context)) as boolean;

    if (!isActivated) {
      throw new UnauthorizedException('Unauthorized');
    }

    const user = request.user;
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userData = await this.userService.findAuthByUuid(user.uuid);

    if (!userData) {
      throw new UnauthorizedException(
        'User not found! Use a valid token or login again.'
      );
    }

    request.user = userData;
    return true;
  }

  /**
   * Handles the request after JWT validation.
   * @param err Error object if validation failed
   * @param user User object from JWT payload
   * @returns User object if valid, throws UnauthorizedException otherwise
   */
  handleRequest(err, user) {
    if (err || !user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
