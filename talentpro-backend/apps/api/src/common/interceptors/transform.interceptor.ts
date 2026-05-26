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

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => {
        // If data already has success field, return as-is (for custom responses)
        if (data && typeof data === 'object' && 'success' in data) {
          return data as Response<T>;
        }
        // If data has data/meta structure (paginated), unwrap
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            success: true,
            data: (data as any).data,
            meta: (data as any).meta,
          };
        }
        return {
          success: true,
          data,
        };
      }),
    );
  }
}
