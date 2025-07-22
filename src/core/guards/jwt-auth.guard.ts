import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserService } from 'src/domain/users/services/user.service';
import { HttpStatusCodeEnum } from '../enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '../enums/errors/statusTextError.enum';
import { AppError } from '../errors/app.error';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly userService: UserService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isActivated = (await super.canActivate(context)) as boolean;

    if (!isActivated) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'Unauthorized'
      );
    }

    const user = request.user;
    if (!user) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'Unauthorized'
      );
    }

    const userData = await this.userService.findUserAuthByUuid(user.uuid);

    if (!userData) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'User not found! Use a valid token or login again.'
      );
    }

    request.user = userData;
    return true;
  }

  handleRequest(err, user) {
    if (err || !user) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'Unauthorized'
      );
    }
    return user;
  }
}
