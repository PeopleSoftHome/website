import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
}

/** 内部标记：已包装为统一响应格式，避免重复包装 */
const TRANSFORMED = Symbol('transformed');

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    // 跳过 Prometheus 指标端点（纯文本输出）
    if (request.url === '/api/v1/metrics') {
      return next.handle() as unknown as Observable<Response<T>>;
    }
    return next.handle().pipe(
      map((data) => {
        // 已转换过，直接返回（避免误伤含 success 字段的业务数据）
        if (data && typeof data === 'object' && (data as any)[TRANSFORMED] === true) {
          return data as unknown as Response<T>;
        }
        // 分页结构：解包 data + meta
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            success: true,
            data: (data as any).data,
            meta: (data as any).meta,
            [TRANSFORMED]: true,
          } as unknown as Response<T>;
        }
        return {
          success: true,
          data,
          [TRANSFORMED]: true,
        } as unknown as Response<T>;
      }),
    );
  }
}
