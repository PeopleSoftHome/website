import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Public } from '@/common/decorators/public.decorator';

/**
 * Cache-Control 拦截器
 * 自动为公开 GET 接口添加适当的缓存头
 */
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const isPublic = this.reflector.getAllAndOverride<boolean>(Public, [
      context.getHandler(),
      context.getClass(),
    ]);
    const isGet = request.method === 'GET';

    return next.handle().pipe(
      tap(() => {
        // 只为公开 GET 接口添加缓存头
        if (isPublic && isGet && !response.getHeader('Cache-Control')) {
          const path = request.route?.path || request.url;

          // 媒体文件长期缓存
          if (path.includes('/medias/') || path.includes('/uploads/')) {
            response.setHeader('Cache-Control', 'public, max-age=86400, immutable');
            return;
          }

          // CMS 静态数据中期缓存（5分钟）
          if (path.includes('/cms/') || path.includes('/products') || path.includes('/industries') || path.includes('/cases') || path.includes('/news')) {
            response.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
            return;
          }

          // 默认公开接口短期缓存（1分钟）
          response.setHeader('Cache-Control', 'public, max-age=60');
        }
      }),
    );
  }
}
