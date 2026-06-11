import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'path';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { QueueModule } from './modules/queue/queue.module';
import { MeilisearchModule } from './modules/meilisearch/meilisearch.module';
import { MetricsModule } from './common/metrics/metrics.module';
import { MiddlewareModule } from './common/middleware/middleware.module';
import {
  FEATURE_MODULES,
  LISTENERS,
  PROCESSORS,
} from './common/modules/module-registry';

import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { CacheControlInterceptor } from './common/interceptors/cache-control.interceptor';
import { WorkspaceInterceptor } from './common/interceptors/workspace.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { SentryInterceptor } from './common/interceptors/sentry.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionGuard } from './common/guards/permission.guard';
import { IpFilterGuard } from './common/guards/ip-filter.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env', '../.env'],
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().min(32).required().invalid('change-me-to-a-random-string-at-least-32-chars'),
        REDIS_URL: Joi.string().required(),
        SMTP_HOST: Joi.string().allow(''),
        SMTP_PORT: Joi.number().default(587),
        SMTP_USER: Joi.string().allow(''),
        SMTP_PASS: Joi.string().allow(''),
        RECAPTCHA_SECRET_KEY: Joi.string().allow(''),
        OPENAI_API_KEY: Joi.string().allow(''),
      }),
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: {
        index: false,
        fallthrough: true,
      },
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            name: 'default',
            ttl: Number(process.env.THROTTLE_TTL) || 60000,
            limit: Number(process.env.THROTTLE_LIMIT) || 500,
          },
          {
            name: 'strict',
            ttl: Number(process.env.THROTTLE_STRICT_TTL) || 60000,
            limit: Number(process.env.THROTTLE_STRICT_LIMIT) || 100,
          },
          {
            name: 'auth',
            ttl: Number(process.env.THROTTLE_AUTH_TTL) || 60000,
            limit: Number(process.env.THROTTLE_AUTH_LIMIT) || 10,
          },
          {
            name: 'search',
            ttl: Number(process.env.THROTTLE_SEARCH_TTL) || 60000,
            limit: Number(process.env.THROTTLE_SEARCH_LIMIT) || 60,
          },
          {
            name: 'lead',
            ttl: Number(process.env.THROTTLE_LEAD_TTL) || 3600000,
            limit: Number(process.env.THROTTLE_LEAD_LIMIT) || 5,
          },
        ],
      }),
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({ wildcard: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRATION', '15m') as any,
        },
      }),
      inject: [ConfigService],
    }),
    RedisModule,
    QueueModule,
    BullModule.registerQueue(
      { name: 'notification' },
      { name: 'search-index' },
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
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheControlInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: WorkspaceInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
    {
      provide: APP_GUARD,
      useClass: IpFilterGuard,
    },
  ],
})
export class AppModule {}
