import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/nestjs';

@Injectable()
export class SentryInterceptor implements NestInterceptor<unknown, unknown> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = user?.id;
    const url = request.originalUrl || request.url;
    const method = request.method;

    // 复制请求体并脱敏
    const body = request.body ? { ...request.body } : undefined;
    if (body && typeof body === 'object') {
      delete body.password;
      delete body.confirmPassword;
      delete body.newPassword;
      delete body.oldPassword;
      delete body.currentPassword;
    }

    return next.handle().pipe(
      catchError((error) => {
        Sentry.withScope((scope) => {
          scope.setTag('url', url);
          scope.setTag('method', method);
          if (userId) {
            scope.setUser({ id: userId });
          }
          if (body) {
            scope.setContext('request_body', body);
          }
          Sentry.captureException(error);
        });
        return throwError(() => error);
      }),
    );
  }
}
