/* eslint-disable @typescript-eslint/no-explicit-any */
import { CacheInterceptor } from './cache.interceptor';
import { CACHE_KEY, CACHE_TTL, CACHE_EVICT } from '../decorators/cache.decorator';
import { of, throwError, firstValueFrom } from 'rxjs';
import { delay } from 'rxjs/operators';

describe('CacheInterceptor', () => {
  let interceptor: CacheInterceptor;
  let reflector: { get: jest.Mock };
  let redis: { get: jest.Mock; setex: jest.Mock; scan: jest.Mock; del: jest.Mock };
  let configService: { get: jest.Mock };

  const context: any = {
    getHandler: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({ originalUrl: '/api/v1/blogs/posts?page=1' }),
    }),
  };

  beforeEach(() => {
    reflector = { get: jest.fn() };
    redis = {
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
      scan: jest.fn().mockResolvedValue(['0', []]),
      del: jest.fn().mockResolvedValue(1),
    };
    configService = { get: jest.fn().mockReturnValue('') };
    interceptor = new CacheInterceptor(reflector as any, redis as any, configService as any);
    reflector.get.mockImplementation((key: string) => {
      if (key === CACHE_KEY) return 'blog:posts';
      if (key === CACHE_TTL) return 300;
      return undefined;
    });
  });

  it('缓存命中时直接返回，不执行 handler', async () => {
    redis.get.mockResolvedValue(JSON.stringify({ data: [1] }));
    const handler = jest.fn();
    const result = await firstValueFrom(await interceptor.intercept(context, { handle: () => of(handler()) }));
    expect(result).toEqual({ data: [1] });
    expect(handler).not.toHaveBeenCalled();
  });

  it('未命中时执行 handler 并写入 Redis（含 url 后缀与 TTL）', async () => {
    const result = await firstValueFrom(await interceptor.intercept(context, { handle: () => of({ ok: true }) }));
    expect(result).toEqual({ ok: true });
    expect(redis.setex).toHaveBeenCalledWith('blog:posts:/api/v1/blogs/posts?page=1', 300, JSON.stringify({ ok: true }));
  });

  it('single-flight：并发未命中只回源一次，所有请求拿到同一结果', async () => {
    let calls = 0;
    const handler = { handle: () => { calls += 1; return of({ n: calls }).pipe(delay(50)); } };
    const run = () => interceptor.intercept(context, handler).then((o) => firstValueFrom(o));
    const [a, b, c] = await Promise.all([run(), run(), run()]);
    expect(calls).toBe(1);
    expect(a).toEqual({ n: 1 });
    expect(b).toEqual({ n: 1 });
    expect(c).toEqual({ n: 1 });
    expect(redis.setex).toHaveBeenCalledTimes(1);
  });

  it('handler 报错时错误传播给所有等待方，且后续请求可重试', async () => {
    const failing = { handle: () => throwError(() => new Error('db down')) };
    const run = () => interceptor.intercept(context, failing).then((o) => firstValueFrom(o));

    // 并发等待方共享同一个 rejection
    await expect(Promise.all([run(), run()])).rejects.toThrow('db down');
    // inFlight 已清理，后续请求重新回源
    await expect(run()).rejects.toThrow('db down');

    const ok = await interceptor
      .intercept(context, { handle: () => of({ recovered: true }) })
      .then((o) => firstValueFrom(o));
    expect(ok).toEqual({ recovered: true });
  });

  it('Redis 写入失败不影响响应返回', async () => {
    redis.setex.mockRejectedValue(new Error('redis down'));
    const result = await firstValueFrom(await interceptor.intercept(context, { handle: () => of({ ok: 1 }) }));
    expect(result).toEqual({ ok: 1 });
  });

  it('CacheEvict：执行写操作后按模式 SCAN 并删除', async () => {
    reflector.get.mockImplementation((key: string) => (key === CACHE_EVICT ? ['blog:posts'] : undefined));
    redis.scan.mockResolvedValueOnce(['0', ['blog:posts:a', 'blog:posts:b']]);
    const result = await firstValueFrom(await interceptor.intercept(context, { handle: () => of('done') }));
    expect(result).toBe('done');
    await new Promise((r) => setImmediate(r));
    expect(redis.del).toHaveBeenCalledWith('blog:posts:a', 'blog:posts:b');
  });

  it('无缓存元数据时直接透传', async () => {
    reflector.get.mockReturnValue(undefined);
    const result = await firstValueFrom(await interceptor.intercept(context, { handle: () => of('pass') }));
    expect(result).toBe('pass');
    expect(redis.get).not.toHaveBeenCalled();
  });
});
