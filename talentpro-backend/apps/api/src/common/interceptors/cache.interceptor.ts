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
    const evictKeys = this.reflector.get<string[]>(CACHE_EVICT, context.getHandler());

    // 缓存清除逻辑（写操作后失效）— 使用 SCAN 替代 KEYS 避免阻塞
    if (evictKeys && evictKeys.length > 0) {
      return next.handle().pipe(
        tap(async () => {
          for (const evictKey of evictKeys) {
            const pattern = `${evictKey}:*`;
            let cursor = '0';
            do {
              const result = await this.redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
              cursor = result[0];
              const keys = result[1];
              if (keys.length > 0) {
                await this.redis.del(...keys);
              }
            } while (cursor !== '0');
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
