import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    const user = request['user'];
    const userIp = request.ip;
    const userAgent = request.headers['user-agent'];
    const entity = request.path.split('/')[3];
    const action = request.method;
    const url = request.url;

    let oldData = null;
    const dataUuid = request.params.uuid || request.body.uuid;

    if (action === 'PUT' || action === 'DELETE') {
      oldData = this.prisma[entity].findUnique({
        where: { uuid: dataUuid },
      });
    }

    return next.handle().pipe(
      tap(async (responseData) => {
        const newData =
          action === 'PUT' || action === 'PATCH' || action === 'DELETE'
            ? responseData
            : null;
        await this.prisma.audits.create({
          data: {
            entity,
            method: action,
            url,
            userUuid: user?.uuid || null,
            ip: userIp,
            userAgent,
            oldData: oldData ? oldData : null,
            newData: newData,
          },
        });
      })
    );
  }
}
