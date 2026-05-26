import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.APP_PORT, 10) || 4000,
  env: process.env.APP_ENV || 'development',
  frontendUrl: process.env.APP_FRONTEND_URL || 'http://localhost:3000',
}));
