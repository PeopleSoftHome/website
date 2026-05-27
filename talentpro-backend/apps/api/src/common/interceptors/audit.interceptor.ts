import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const user = request.user;
    const userId = user?.id;

    // 仅审计写操作
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) || !userId) {
      return next.handle();
    }

    const resource = request.route?.path || request.url;
    const action = `${method} ${resource}`;
    const resourceId = request.params?.id;

    return next.handle().pipe(
      tap(async (response) => {
        try {
          await this.prisma.auditLog.create({
            data: {
              userId,
              action,
              resource: request.path || resource,
              resourceId: resourceId || undefined,
              ipAddress: request.ip,
              userAgent: request.headers['user-agent'],
              // 不记录完整请求体，避免敏感信息泄漏
              newValue: method === 'DELETE' ? undefined : { status: 'success' },
            },
          });
        } catch {
          // 审计失败不应影响主业务
        }
      }),
    );
  }
}
