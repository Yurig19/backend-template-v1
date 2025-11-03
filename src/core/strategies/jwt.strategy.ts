import { UserService } from '@/modules/users/services/user.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

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
    const user = await this.userService.findAuthByUuid(payload.userUuid);
    if (!user) {
      throw new UnauthorizedException('User not found in token validation.');
    }
    return user;
  }
}
