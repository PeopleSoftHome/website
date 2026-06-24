import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT || '4000', 10),
  env: process.env.APP_ENV || 'development',
  frontendUrl: process.env.APP_FRONTEND_URL || 'http://localhost:3000',
  corsOrigins:
    process.env.APP_CORS_ORIGINS ||
    `${process.env.APP_FRONTEND_URL || 'http://localhost:3000'},http://localhost:8080`,
  cacheKeyPrefix:
    process.env.CACHE_KEY_PREFIX ||
    (process.env.APP_ENV && process.env.APP_ENV !== 'development'
      ? `${process.env.APP_ENV}:`
      : ''),
}));
