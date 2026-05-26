import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { PrismaModule } from './common/prisma/prisma.module';

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
            ttl: 60000,
            limit: 100,
          },
        ],
      }),
    }),
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
  ],
})
export class AppModule {}
