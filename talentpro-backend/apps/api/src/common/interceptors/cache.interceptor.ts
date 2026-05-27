import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import Redis from 'ioredis';
import { CACHE_KEY, CACHE_TTL, CACHE_EVICT } from '../decorators/cache.decorator';
import { REDIS_CLIENT } from '../redis/redis.module';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    @Inject(REDIS_CLIENT) private redis: Redis,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const cacheKey = this.reflector.get<string>(CACHE_KEY, context.getHandler());
    const cacheTtl = this.reflector.get<number>(CACHE_TTL, context.getHandler()) || 60;
    const evictKey = this.reflector.get<string>(CACHE_EVICT, context.getHandler());

    // 缓存清除逻辑（写操作后失效）
    if (evictKey) {
      return next.handle().pipe(
        tap(async () => {
          const keys = await this.redis.keys(`${evictKey}:*`);
          if (keys.length > 0) {
            await this.redis.del(...keys);
          }
        }),
      );
    }

    if (!cacheKey) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const fullKey = `${cacheKey}:${request.originalUrl}`;

    const cached = await this.redis.get(fullKey).catch(() => null);
    if (cached) {
      return of(JSON.parse(cached));
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.redis.setex(fullKey, cacheTtl, JSON.stringify(response));
      }),
    );
  }
}
