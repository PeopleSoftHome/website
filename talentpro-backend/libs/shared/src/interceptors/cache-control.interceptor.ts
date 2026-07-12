import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorators/public.decorator';

/**
 * Cache-Control 拦截器
 * 自动为公开 GET 接口添加精确的缓存头
 */
@Injectable()
export class CacheControlInterceptor implements NestInterceptor<unknown, unknown> {
  constructor(private reflector: Reflector) {}

  private readonly mediaRegex = /^\/(?:api\/v1\/)?medias\/|^\/uploads\//;
  private readonly longCacheRegex = /^\/(?:api\/v1\/)?cms\/|^\/(?:api\/v1\/)?(products|industries|cases|news|solutions|careers|about)\b/;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
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

          // 媒体文件 / 上传资源长期缓存（仅当 URL 含 hash 或明确为静态资源时使用 immutable）
          if (this.mediaRegex.test(path)) {
            response.setHeader('Cache-Control', 'public, max-age=86400');
            return;
          }

          // CMS / 公开内容接口中期缓存（5 分钟）
          if (this.longCacheRegex.test(path)) {
            response.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
            return;
          }

          // 默认公开接口短期缓存（1 分钟）
          response.setHeader('Cache-Control', 'public, max-age=60');
        }
      }),
    );
  }
}
