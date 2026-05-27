import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { QueueModule } from './modules/queue/queue.module';
import { MeilisearchModule } from './modules/meilisearch/meilisearch.module';
import { NotificationListener } from './listeners/notification.listener';
import { SearchIndexListener } from './listeners/search-index.listener';
import { NotificationProcessor } from './processors/notification.processor';
import { SearchIndexProcessor } from './processors/search-index.processor';
import { LeadNurtureProcessor } from './processors/lead-nurture.processor';
import { CacheInterceptor } from './common/interceptors/cache.interceptor';
import { TimingInterceptor } from './common/interceptors/timing.interceptor';
import { WorkspaceInterceptor } from './common/interceptors/workspace.interceptor';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { MetricsInterceptor } from './common/interceptors/metrics.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { MetricsModule } from './common/metrics/metrics.module';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { CmsModule } from './modules/cms/cms.module';
import { LeadModule } from './modules/lead/lead.module';
import { SearchModule } from './modules/search/search.module';
import { MediaModule } from './modules/media/media.module';
import { BlogModule } from './modules/blog/blog.module';
import { ForumModule } from './modules/forum/forum.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { SystemModule } from './modules/system/system.module';
import { NotificationModule } from './modules/notification/notification.module';
import { MailModule } from './modules/mail/mail.module';
import { AiModule } from './modules/ai/ai.module';
import { WorkspaceModule } from './modules/workspace/workspace.module';
import { ExportModule } from './modules/export/export.module';
import { ExperimentModule } from './modules/experiment/experiment.module';
import { DownloadModule } from './modules/download/download.module';
import { HealthModule } from './modules/health/health.module';
import { MiddlewareModule } from './common/middleware/middleware.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env', '../.env'],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            name: 'default',
            ttl: 60000,
            limit: 100,
          },
          {
            name: 'auth',
            ttl: 60000,
            limit: 10,
          },
          {
            name: 'search',
            ttl: 60000,
            limit: 30,
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
    MeilisearchModule,
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    CmsModule,
    LeadModule,
    SearchModule,
    MediaModule,
    BlogModule,
    ForumModule,
    AnalyticsModule,
    SystemModule,
    NotificationModule,
    MailModule,
    AiModule,
    WorkspaceModule,
    ExportModule,
    ExperimentModule,
    DownloadModule,
    HealthModule,
    MetricsModule,
    MiddlewareModule,
  ],
  providers: [
    NotificationListener,
    SearchIndexListener,
    NotificationProcessor,
    SearchIndexProcessor,
    LeadNurtureProcessor,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
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
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
