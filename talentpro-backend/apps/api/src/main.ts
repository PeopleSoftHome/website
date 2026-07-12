import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction } from 'express';
import * as Sentry from '@sentry/nestjs';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@shared/filters';
import { TransformInterceptor } from '@shared/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  app.useLogger(app.get(Logger));
  const configService = app.get(ConfigService);
  const sentryDsn = configService.get<string>('SENTRY_DSN');
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: configService.get<string>('NODE_ENV', 'development'),
      tracesSampleRate: 1.0,
    });
  }
  app.enableShutdownHooks();
  const logger = app.get(Logger);

  const port = configService.get<number>('app.port', 4000);
  const frontendUrl = configService.get<string>('app.frontendUrl', 'http://localhost:3000');

  // Cookie parser（支持 signed cookies）
  app.use(cookieParser(configService.get<string>('JWT_SECRET')));

  // Helmet 安全响应头（显式 CSP，生产环境收紧 script-src）
  const isProduction = configService.get<string>('app.env') === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: isProduction ? ["'self'"] : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          fontSrc: ["'self'"],
          connectSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          ...(isProduction ? { upgradeInsecureRequests: [] } : {}),
        },
      },
      crossOriginEmbedderPolicy: false,
    }),
  );

  // CORS — 开发模式下允许多个 localhost 端口
  const corsOrigins = configService.get<string>('app.corsOrigins', frontendUrl);
  const origins = corsOrigins.split(',').map((o) => o.trim()).filter(Boolean);
  logger.log(`[CORS] Allowed origins: ${origins.join(', ')}`);
  app.enableCors({
    origin: origins,
    credentials: true,
    exposedHeaders: ['X-Request-Id'],
  });

  // CORP — 允许跨域资源嵌入（开发模式）
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  });

  // Global pipes & filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger（生产环境关闭）
  if (configService.get<string>('app.env') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('TalentPro API')
      .setDescription('TalentPro HR Portal — Enterprise Backend API')
      .setVersion('2.0.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  logger.log(`🚀 Server running on http://localhost:${port}`);
  if (configService.get<string>('app.env') !== 'production') {
    logger.log(`📚 Swagger docs on http://localhost:${port}/api/docs`);
  }
}

bootstrap();
