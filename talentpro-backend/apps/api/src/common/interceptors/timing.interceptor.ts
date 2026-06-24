import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TimingInterceptor implements NestInterceptor<unknown, unknown> {
  private readonly logger = new Logger('Timing');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.originalUrl;
    const handler = context.getHandler().name;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const message = `${method} ${path} [${handler}] ${duration}ms`;
        if (duration > 500) {
          this.logger.warn(`SLOW: ${message}`);
        } else {
          this.logger.debug(message);
        }
      }),
    );
  }
}
