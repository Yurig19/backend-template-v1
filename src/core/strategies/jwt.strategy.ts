import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/domain/users/services/user.service';
import { HttpStatusCodeEnum } from '../enums/errors/statusCodeErrors.enum';
import { HttpStatusTextEnum } from '../enums/errors/statusTextError.enum';
import { AppError } from '../errors/app.error';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async validate(payload: any) {
    const user = await this.userService.findUserAuthByUuid(payload.userUuid);
    if (!user) {
      throw new AppError(
        HttpStatusCodeEnum.UNAUTHORIZED,
        HttpStatusTextEnum.UNAUTHORIZED,
        'Unauthorized'
      );
    }
    return user;
  }
}
