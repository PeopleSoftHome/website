import { csrfMiddleware, CSRF_HEADER, CSRF_COOKIE } from './csrf';

describe('csrfMiddleware', () => {
  const build = (overrides: Partial<any> = {}) => {
    const req: any = {
      method: 'POST',
      path: '/api/v1/auth/profile',
      cookies: {},
      get: (name: string) => overrides.headers?.[name.toLowerCase()],
      ...overrides,
    };
    const res: any = {
      cookies: {},
      statusCode: 200,
      body: null,
      cookie(name: string, value: string, options: unknown) {
        this.cookies[name] = { value, options };
      },
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(body: unknown) {
        this.body = body;
        return this;
      },
    };
    const next = jest.fn();
    return { req, res, next };
  };

  beforeEach(() => {
    process.env.CORS_ORIGINS = 'http://localhost:3000';
  });

  it('issues a readable csrf cookie and rejects missing header', () => {
    const { req, res, next } = build();
    csrfMiddleware(req, res, next);
    expect(res.cookies[CSRF_COOKIE]).toBeDefined();
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('accepts matching cookie/header tokens', () => {
    const token = 'a'.repeat(64);
    const { req, res, next } = build({ cookies: { [CSRF_COOKIE]: token }, headers: { [CSRF_HEADER]: token } });
    csrfMiddleware(req, res, next);
    expect(res.statusCode).toBe(200);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects a cross-origin request even with a valid token', () => {
    const token = 'b'.repeat(64);
    const { req, res, next } = build({
      cookies: { [CSRF_COOKIE]: token },
      headers: {
        [CSRF_HEADER]: token,
        origin: 'https://evil.example',
      },
    });
    csrfMiddleware(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('exempts authentication bootstrap endpoints', () => {
    const { req, res, next } = build({ path: '/api/v1/auth/login' });
    csrfMiddleware(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
  });
});
