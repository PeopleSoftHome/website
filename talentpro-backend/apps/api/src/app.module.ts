import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';
import { IncomingMessage, IncomingHttpHeaders } from 'http';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { PrismaModule } from '@shared/prisma/prisma.module';
import { RedisModule } from '@shared/redis/redis.module';
import { QueueModule } from './modules/queue/queue.module';
import { MeilisearchModule } from './modules/meilisearch/meilisearch.module';
import { MetricsModule } from '@shared/metrics/metrics.module';
import { MiddlewareModule } from './config/middleware.module';
import { FEATURE_MODULES, LISTENERS, PROCESSORS } from './config/module-registry';
import { CacheInterceptor } from '@shared/interceptors/cache.interceptor';
import { TimingInterceptor } from '@shared/interceptors';
import { CacheControlInterceptor } from '@shared/interceptors/cache-control.interceptor';
import { WorkspaceInterceptor } from '@shared/interceptors';
import { AuditInterceptor } from '@shared/interceptors/audit.interceptor';
import { MetricsInterceptor } from '@shared/interceptors/metrics.interceptor';
import { SentryInterceptor } from '@shared/interceptors';
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard';
import { PermissionGuard } from '@shared/guards/permission.guard';
import { IpFilterGuard } from '@shared/guards/ip-filter.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env', '../.env'],
      validationSchema: Joi.object({
        APP_PORT: Joi.number().default(4000),
        APP_ENV: Joi.string().valid('development', 'staging', 'production').default('development'),
        APP_FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
        APP_CORS_ORIGINS: Joi.string().allow(''),
        DATABASE_URL: Joi.string().required(),
        REDIS_URL: Joi.string().required(),
        REDIS_MODE: Joi.string().valid('single', 'cluster', 'sentinel').default('single'),
        JWT_SECRET: Joi.string().min(32).required().invalid('change-me-to-a-random-string-at-least-32-chars'),
        STORAGE_TYPE: Joi.when('APP_ENV', { is: 'production', then: Joi.string().valid('s3', 'oss').required(), otherwise: Joi.string().valid('local', 's3', 'oss').default('local') }),
        STORAGE_BUCKET: Joi.when('STORAGE_TYPE', { is: Joi.valid('s3', 'oss'), then: Joi.string().min(1).required(), otherwise: Joi.string().allow('') }),
        STORAGE_REGION: Joi.string().default('us-east-1'),
        STORAGE_ENDPOINT: Joi.string().uri().allow(''),
        STORAGE_FORCE_PATH_STYLE: Joi.boolean().default(false),
        STORAGE_ACCESS_KEY_ID: Joi.when('STORAGE_TYPE', { is: Joi.valid('s3', 'oss'), then: Joi.string().min(1).required(), otherwise: Joi.string().allow('') }),
        STORAGE_SECRET_ACCESS_KEY: Joi.when('STORAGE_TYPE', { is: Joi.valid('s3', 'oss'), then: Joi.string().min(1).required(), otherwise: Joi.string().allow('') }),
        STORAGE_SIGNING_SECRET: Joi.string().min(32).required(),
        SIGNED_URL_TTL_SECONDS: Joi.number().integer().min(1).max(900).default(300),
        JWT_ACCESS_EXPIRATION: Joi.string().default('15m'),
        JWT_REFRESH_EXPIRATION: Joi.string().default('7d'),
        PII_ENCRYPTION_KEY: Joi.string().min(32).required(),
        SMTP_HOST: Joi.string().allow(''),
        SMTP_PORT: Joi.number().default(587),
        SMTP_USER: Joi.string().allow(''),
        SMTP_PASS: Joi.string().allow(''),
        RECAPTCHA_SECRET_KEY: Joi.string().allow(''),
        OPENAI_API_KEY: Joi.string().allow(''),
        OPENAI_MODEL: Joi.string().allow(''),
        AZURE_OPENAI_API_KEY: Joi.string().allow(''),
        ANTHROPIC_API_KEY: Joi.string().allow(''),
        MEILISEARCH_HOST: Joi.string().uri().allow(''),
        MEILISEARCH_API_KEY: Joi.string().allow(''),
        SENTRY_DSN: Joi.string().uri().allow(''),
        STRIPE_SECRET_KEY: Joi.string().allow(''),
        STRIPE_WEBHOOK_SECRET: Joi.string().allow(''),
        STRIPE_PUBLISHABLE_KEY: Joi.string().allow(''),
        THROTTLE_TTL: Joi.number().default(60000),
        THROTTLE_LIMIT: Joi.number().default(500),
        THROTTLE_STRICT_TTL: Joi.number().default(60000),
        THROTTLE_STRICT_LIMIT: Joi.number().default(100),
        THROTTLE_AUTH_TTL: Joi.number().default(60000),
        THROTTLE_AUTH_LIMIT: Joi.number().default(10000),
        THROTTLE_SEARCH_TTL: Joi.number().default(60000),
        THROTTLE_SEARCH_LIMIT: Joi.number().default(60),
        THROTTLE_LEAD_TTL: Joi.number().default(3600000),
        THROTTLE_LEAD_LIMIT: Joi.number().default(10000),
        APP_ALLOWED_IPS: Joi.string().allow(''),
        APP_BLOCKED_IPS: Joi.string().allow(''),
        TRUSTED_PROXIES: Joi.string().allow(''),
        CACHE_KEY_PREFIX: Joi.string().allow(''),
        LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('info'),
        AI_GATEWAY_RPM: Joi.number().integer().min(1).default(30),
        AI_GATEWAY_MAX_WAIT_MS: Joi.number().integer().min(1000).default(60000),
        AI_GATEWAY_CONCURRENCY: Joi.number().integer().min(1).default(4),
        AGENT_DEMO_REQUIRE_PROVIDER: Joi.when('APP_ENV', { is: 'production', then: Joi.boolean().truthy('true').falsy('false').default(true), otherwise: Joi.boolean().truthy('true').falsy('false').default(false) }),
        AI_GOVERNANCE_AUDIT: Joi.boolean().truthy('true').falsy('false').default(true),
      }),
      validationOptions: { allowUnknown: false, abortEarly: false },
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get<string>('LOG_LEVEL', 'info'),
          redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["x-api-key"]', 'req.body.password', 'req.body.refreshToken', 'req.body.token', 'res.headers["set-cookie"]'], remove: true },
          transport: config.get<string>('app.env') !== 'production' ? { target: 'pino-pretty', options: { singleLine: true, colorize: true } } : undefined,
          genReqId: (req: IncomingMessage & { requestId?: string; headers: IncomingHttpHeaders & { 'x-request-id'?: string } }) => req.headers['x-request-id'] || req.requestId || randomUUID(),
        },
      }),
    }),
    ThrottlerModule.forRootAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (config: ConfigService) => ({
      throttlers: [
        { name: 'default', ttl: config.get<number>('THROTTLE_TTL', 60000), limit: config.get<number>('THROTTLE_LIMIT', 500) },
        { name: 'strict', ttl: config.get<number>('THROTTLE_STRICT_TTL', 60000), limit: config.get<number>('THROTTLE_STRICT_LIMIT', 100) },
        { name: 'auth', ttl: config.get<number>('THROTTLE_AUTH_TTL', 60000), limit: config.get<number>('THROTTLE_AUTH_LIMIT', 10000) },
        { name: 'search', ttl: config.get<number>('THROTTLE_SEARCH_TTL', 60000), limit: config.get<number>('THROTTLE_SEARCH_LIMIT', 60) },
        { name: 'lead', ttl: config.get<number>('THROTTLE_LEAD_TTL', 3600000), limit: config.get<number>('THROTTLE_LEAD_LIMIT', 10000) },
      ],
    })}),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true }),
    JwtModule.registerAsync({ imports: [ConfigModule], useFactory: (configService: ConfigService) => ({ secret: configService.get<string>('JWT_SECRET'), signOptions: { expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any } }), inject: [ConfigService] }),
    RedisModule,
    QueueModule,
    BullModule.registerQueue(
      { name: 'notification', defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 100, removeOnFail: 50 } },
      { name: 'search-index', defaultJobOptions: { attempts: 3, backoff: { type: 'exponential', delay: 2000 }, removeOnComplete: 100, removeOnFail: 50 } },
    ),
    MeilisearchModule,
    PrismaModule,
    MetricsModule,
    MiddlewareModule,
    ...FEATURE_MODULES,
  ],
  providers: [
    ...LISTENERS,
    ...PROCESSORS,
    { provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
    { provide: APP_INTERCEPTOR, useClass: CacheControlInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TimingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: WorkspaceInterceptor },
    { provide: APP_INTERCEPTOR, useClass: AuditInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
    { provide: APP_INTERCEPTOR, useClass: SentryInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
    { provide: APP_GUARD, useClass: IpFilterGuard },
  ],
})
export class AppModule {}
