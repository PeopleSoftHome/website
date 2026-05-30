/**
 * 模块注册中心
 *
 * 集中声明所有 Feature 模块、Listener 和 Processor。
 * 新增模块只需在此文件添加一行 import + 推入数组，无需修改 AppModule。
 *
 * 未来可升级为目录扫描 auto-discovery（见 module-loader.ts）。
 */

// ─── Feature Modules ───
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { RoleModule } from '@/modules/role/role.module';
import { CmsModule } from '@/modules/cms/cms.module';
import { LeadModule } from '@/modules/lead/lead.module';
import { SearchModule } from '@/modules/search/search.module';
import { MediaModule } from '@/modules/media/media.module';
import { BlogModule } from '@/modules/blog/blog.module';
import { ForumModule } from '@/modules/forum/forum.module';
import { AnalyticsModule } from '@/modules/analytics/analytics.module';
import { SystemModule } from '@/modules/system/system.module';
import { NotificationModule } from '@/modules/notification/notification.module';
import { MailModule } from '@/modules/mail/mail.module';
import { AiModule } from '@/modules/ai/ai.module';
import { WorkspaceModule } from '@/modules/workspace/workspace.module';
import { ExportModule } from '@/modules/export/export.module';
import { ExperimentModule } from '@/modules/experiment/experiment.module';
import { DownloadModule } from '@/modules/download/download.module';
import { CaseModule } from '@/modules/case/case.module';
import { NewsModule } from '@/modules/news/news.module';
import { CareersModule } from '@/modules/careers/careers.module';
import { AboutModule } from '@/modules/about/about.module';
import { HealthModule } from '@/modules/health/health.module';

export const FEATURE_MODULES = [
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
  CaseModule,
  NewsModule,
  CareersModule,
  AboutModule,
  HealthModule,
];

// ─── Listeners ───
import { NotificationListener } from '@/listeners/notification.listener';
import { SearchIndexListener } from '@/listeners/search-index.listener';

export const LISTENERS = [
  NotificationListener,
  SearchIndexListener,
];

// ─── Processors ───
import { NotificationProcessor } from '@/processors/notification.processor';
import { SearchIndexProcessor } from '@/processors/search-index.processor';
import { LeadNurtureProcessor } from '@/processors/lead-nurture.processor';

export const PROCESSORS = [
  NotificationProcessor,
  SearchIndexProcessor,
  LeadNurtureProcessor,
];
