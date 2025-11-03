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

  handleRequest(err, user) {
    if (err || !user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
