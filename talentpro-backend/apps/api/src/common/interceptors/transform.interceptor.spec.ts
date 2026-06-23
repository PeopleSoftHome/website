import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { lastValueFrom } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<unknown>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  const createContext = (url: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ url }),
      }),
    }) as ExecutionContext;

  it('should wrap plain data', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(createContext('/api/v1/users'), {
        handle: () => of({ id: 'u1' }),
      } as CallHandler),
    );
    expect(result).toMatchObject({ success: true, data: { id: 'u1' } });
  });

  it('should unwrap paginated data', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(createContext('/api/v1/users'), {
        handle: () => of({ data: [{ id: 'u1' }], meta: { total: 1 } }),
      } as CallHandler),
    );
    expect(result).toMatchObject({
      success: true,
      data: [{ id: 'u1' }],
      meta: { total: 1 },
    });
  });

  it('should skip metrics endpoint', async () => {
    const raw = 'metrics data';
    const result = await lastValueFrom(
      interceptor.intercept(createContext('/api/v1/metrics'), {
        handle: () => of(raw),
      } as CallHandler),
    );
    expect(result).toBe(raw);
  });
});
