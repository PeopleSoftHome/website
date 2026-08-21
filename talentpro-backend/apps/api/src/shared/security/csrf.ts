import { randomBytes, timingSafeEqual } from 'crypto';
import type { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXEMPT_PATHS = new Set([
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/refresh',
  '/api/v1/auth/dev-login',
]);

export const CSRF_COOKIE = 'tp_csrf_token';
export const CSRF_HEADER = 'x-csrf-token';

function issueToken(): string {
  return randomBytes(32).toString('hex');
}

function validDoubleSubmit(cookieValue: string | undefined, headerValue: string | undefined): boolean {
  if (!cookieValue || !headerValue) return false;
  const cookie = Buffer.from(cookieValue);
  const header = Buffer.from(headerValue);
  return cookie.length === header.length && timingSafeEqual(cookie, header);
}

export function csrfMiddleware(req: Request, res: Response, next: NextFunction) {
  const isProduction = process.env.NODE_ENV === 'production';
  const token = req.cookies?.[CSRF_COOKIE] || issueToken();

  if (!req.cookies?.[CSRF_COOKIE]) {
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 2 * 60 * 60 * 1000,
      path: '/',
    });
  }

  if (SAFE_METHODS.has(req.method) || EXEMPT_PATHS.has(req.path)) {
    return next();
  }

  const origin = req.get('origin');
  const allowedOrigins = (process.env.CORS_ORIGINS || process.env.NUXT_PUBLIC_APP_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    return res.status(403).json({ success: false, error: { message: 'Invalid request origin' } });
  }

  const headerToken = req.get(CSRF_HEADER);
  if (!validDoubleSubmit(token, headerToken)) {
    return res.status(403).json({ success: false, error: { message: 'CSRF validation failed' } });
  }

  return next();
}
