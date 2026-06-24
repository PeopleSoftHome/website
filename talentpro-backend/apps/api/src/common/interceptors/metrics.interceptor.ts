import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { PrometheusService } from '../metrics/prometheus.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor<unknown, unknown> {
  constructor(private readonly prometheus: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const route = request.route?.path || request.url;
    const start = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = (Date.now() - start) / 1000;
        const status = context.switchToHttp().getResponse().statusCode;
        this.prometheus.httpRequestsTotal.inc({ method, route, status });
        this.prometheus.httpRequestDuration.observe({ method, route }, duration);
      }),
    );
  }
}
