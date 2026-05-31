# Changelog

## [v4.0.0] - 2026-05-30 (Nuxt 3 迁移完成)

### 🚀 Nuxt 3 全面迁移（6 个迭代，分支 `feat/nuxt3-infra`）

> 基线 commit: `d626835` → 最终 commit: `94b8b88`

**迭代 1 — 基础设施** (`a4677df`)
- `nuxt.config.ts` 创建，`app.vue` + `layouts/default.vue` 迁移
- 插件系统改造，`index.html` → `app.head` 配置
- 废弃旧入口 `main.js` / `vite.config.js`

**迭代 2 — 路由系统** (`5752aec`)
- 24 个页面迁移为 Nuxt 文件路由（`pages/index.vue`、`pages/blog/index.vue` 等）
- 删除 `src/router/index.js` + `guards.js`，创建 `src/middleware/route.global.ts`
- `router-link` → `NuxtLink`，CSS module 文件批量同步命名

**迭代 3 — 布局与自动导入** (`166ef12`)
- `useABTest.js` → `useAbTest.js`（驼峰规范）
- 清理 12 处冗余 `vue-router` import
- 验证 `pathPrefix: false` 组件自动注册

**迭代 4 — 数据获取** (`c950554`)
- 新建 `useApiData.js` / `useApiList.js` / `useCmsPageAsync.js`
- 首页/列表/详情页迁移至 `useAsyncData`，保留 Suspense + 骨架屏

**迭代 5 — i18n / Pinia / PWA** (`9416db6`)
- `@nuxtjs/i18n` 模块正式启用，`useI18n()` 全面替代 `inject('i18n')`
- 创建 Pinia `useAuthStore`（`stores/auth.pinia.js`），替代 legacy `createAuth()`
- `plugins/sectionRegistry.js` 迁移至 `utils/sectionRegistry.js`，消除构建警告
- `stores/i18n.js` 标记废弃，保留测试兼容
- 修复 Vitest 环境（jsdom + `unplugin-auto-import` + 全局 setup）

**迭代 6 — 构建优化 + 部署适配** (`94b8b88`)
- 安装 `@nuxt/image`，2 处 `<img>` 替换为 `<NuxtImg>`
- `nitro.compressPublicAssets` 启用 gzip + brotli 预压缩
- 静态资源缓存头配置（`_nuxt/**`、`fonts/**` 1 年缓存）
- 新建 `docker/Dockerfile.frontend` 多阶段构建
- 更新 `nginx.conf`（root 路径 `.output/public/` + `/health` 端点）
- 更新 CI/CD（产物路径 `dist/` → `.output/public/`）
- 更新 `lighthouserc.js` 端口 4173 → 3000

### 📊 迁移成果

| 指标 | 迁移前 (Vite SPA) | 迁移后 (Nuxt SSG) |
|------|------------------|------------------|
| 构建工具 | Vite 8 | Nuxt 3.4.6 + Nitro 2.13.4 |
| 路由 | Vue Router 手动配置 | Nuxt 文件路由（自动生成） |
| 状态管理 | Legacy factory + provide/inject | Pinia + 兼容层 |
| i18n | 自研 store | @nuxtjs/i18n 模块 |
| 构建产物 | `dist/` | `.output/public/` |
| 预渲染路由 | 无 | 20 条路由静态 HTML |
| 测试通过 | 117 测试 | 127 测试 |

---

## [v3.5.0] - 2026-05-29 (Sprint 25)

### ⚡ 性能优化

- **Bundle 分析**：`rollup-plugin-visualizer` + `npm run analyze` 命令，生成可视化包体积报告
- **资源预连接**：`index.html` 添加 `preconnect` + `dns-prefetch` 到 API 域名，`preload` NotoSansSC-400.woff2

### 🏗 后端架构

- **Cache-Control 拦截器**：`CacheControlInterceptor` 自动为公开 GET 接口添加缓存头
  - CMS / products / industries / cases / news：`public, max-age=300, stale-while-revalidate=60`
  - 媒体文件：`public, max-age=86400, immutable`
  - 其他公开接口：`public, max-age=60`

### 📚 文档

- **`.env.example` 重写**：前端环境变量完整说明（API 地址 / Sentry / reCAPTCHA）
- **`talentpro-backend/.env.example` 重写**：数据库 / Redis / JWT / SMTP / 存储 / 限流 / OpenAI / 种子数据 / PII 加密

---

## [v3.4.0] - 2026-05-29 (Sprint 24)

### 🧪 测试覆盖提升

- **MediaService 测试**：`media.service.spec.ts` — findAll / upload / delete / getStats / workspace 隔离
- **WorkspaceService 测试**：`workspace.service.spec.ts` — findMine / create / 权限校验
- **AnalyticsService 测试**：`analytics.service.spec.ts` — trackPageView / trackEvent / getDashboardStats / getConversionFunnel
- **后端测试总计：47 → 64 个**，覆盖 10 个模块

### 🔧 工程化

- **husky + lint-staged**：pre-commit 钩子自动运行前端 lint，检测 backend/admin 修改时运行对应 lint
- **`package.json` lint-staged 配置**：`src/**/*.{js,vue}` 和 `e2e/**/*.js` 自动 `eslint --fix`

### 🌍 i18n 完善

- **新增 `errors` i18n key**：`errors.requestFailed` / `errors.networkError` / `errors.noRefreshToken` / `errors.loadFailed`
- **三语言同步**：zh-CN / en / zh-TW
- **`api/client.js` 英文化**：错误消息改为英文，注释改为英文
- **`useApiData.js` / `useCmsData.js` / `stores/auth.js`**：移除硬编码中文错误消息

---

## [v3.3.0] - 2026-05-29 (Sprint 23)

### 🟡 P1 — 稳定性与体验

- **PWA 离线页面**：`public/offline.html` 离线状态提示 + 重试刷新按钮
- **PWA 导航回退**：`vite.config.js` Workbox `navigateFallback` 配置，断网时自动显示离线页
- **Vue 错误边界**：`ErrorBoundary.vue` 捕获子孙组件错误，显示友好降级 UI（开发模式显示堆栈）
- **App.vue 集成错误边界**：`router-view` 包裹于 ErrorBoundary 中，防止组件错误导致白屏

### 🧪 测试增强

- **Playwright E2E 新增 8 个测试**：
  - 搜索：`search.spec.js`（Cmd+K 触发、关键词输入、结果列表）
  - 主题/语言：`theme-language.spec.js`（暗色切换、语言切换）
  - 表单：`form.spec.js`（DemoModal 打开/步骤流转、联系表单）
- **E2E 总计：17 → 25 个测试**，全部通过

---

## [v3.2.0] - 2026-05-29 (Sprint 22)

### 🔴 P0 — 多租户解阻塞

- **User.email 唯一性约束迁移**：`users_email_key` → `users_email_workspaceId_key` 复合唯一索引，支持同一 email 存在于不同 Workspace
- **Prisma Schema 更新**：`Media` 模型新增 `webpUrl` / `thumbUrl` 字段

### 🟡 P1 — 性能极致化

- **图片自动 WebP 化**：`StorageService` 上传时自动生成 WebP（质量 85），体积减少 25%~40%
- **前端 `<picture>` 组件**：`Picture.vue` WebP 优先 + 原图 fallback，兼容所有浏览器
- **缩略图自动裁剪**：300x300 自适应裁剪，Admin 媒体库列表加载更快

### 🏗 架构改进

- **StorageService 文件清理**：delete 时同步删除原图 + 缩略图 + WebP 版本
- **Admin 媒体库预览**：列表显示缩略图，减少带宽消耗

---

## [v3.1.0] - 2026-05-29 (Sprint 21)

### 🟡 P1 — 运营增强

- **Admin 媒体库文件上传**：后端 `POST /medias/upload`（Multer + Sharp 缩略图）+ 前端拖拽上传组件
- **Dashboard 实时数据**：后端 `AnalyticsService` 新增业务指标（todayLeads/monthLeads/totalUsers/pendingLeads/leadTrend）
- **Dashboard 自动刷新**：前端 5 分钟轮询 + `onUnmounted` 清理

### 🟢 P2 — 性能与工程化

- **Lighthouse CI**：`.github/workflows/ci.yml` 集成 Lighthouse 性能审计（Performance ≥ 90, Accessibility ≥ 95）
- **JSON-LD 全覆盖**：补全 9 个缺失页面（About/Team/Contact/Partners/Careers/Campus/Social/Profile/Home），累计 24 个页面

### 🏗 架构改进

- **静态文件服务**：`@nestjs/serve-static` 配置 `/uploads` 目录，支持本地文件访问
- **StorageService**：统一文件上传抽象层，支持本地存储 + 缩略图自动生成

---

## [v3.0.0] - 2026-05-27

### 🔴 P0 — 核心功能修复

- **CMS 动态化**：StatsSection / LogoWallSection / WhyUsSection / AiFamilySection 全面接入 CMS API，支持运营后台配置化运营
- **Workspace 数据隔离**：Prisma `$use` 中间件自动注入 `workspaceId` 过滤 + `WorkspaceGuard` + `WorkspaceInterceptor` 全局注册
- **JWT 黑名单**：新增 `TokenBlacklist` 模型，logout 后 Access Token 立即失效
- **限流全局生效**：`ThrottlerGuard` 作为全局 Guard 注册，所有 API 端点默认受保护
- **ChatBot XSS 防护**：`formatMessage` 增加 HTML 转义，防止 AI 返回内容中的脚本注入

### 🟡 P1 — 高价值功能迭代

- **资源下载留资**：前端新增 DownloadGate 弹窗（姓名/邮箱/公司），后端 `DownloadModule` + `DownloadRecord` 模型，自动邮件发送资料
- **邮件自动化培育**：`LeadNurtureProcessor` 支持 Day3/Day7/Day14 延迟邮件队列（BullMQ）
- **AI 内容审核**：评论创建时自动敏感词检测 + 正则启发式 + 长度异常检测，输出 `aiRiskScore` / `aiFlags`，低分自动通过
- **搜索建议**：`SearchService.suggest()` 多索引聚合，前端 SearchModal 实时建议列表
- **A/B 测试框架**：`Experiment` / `ExperimentEvent` 模型 + 一致性哈希分流 + impression/conversion 追踪
- **热力图 + 滚动深度**：`useAnalytics` 新增 `initHeatmap`（点击坐标追踪）+ `initScrollDepth`（25/50/75/90% 里程碑）
- **ChatBot 流式输出**：`AiService.streamOpenAI` 真正 SSE 流式，前端 `EventSource` 实时打字机效果
- **动态 SEO**：BlogDetailView / ForumTopicView 加载后动态更新 `document.title` + `meta description`
- **Redis 缓存生效**：CMS 公开 GET 接口（products/industries/stats/logos 等）全部添加 `@Cacheable`
- **密码复杂度**：注册密码要求 8 位以上 + 大小写 + 数字 + 特殊字符
- **BullMQ 重试 + 死信监听**：Processor 配置 `attempts: 3` + `exponential backoff`，`@OnWorkerEvent('failed')` 记录永久失败
- **健康检查**：`/health`、`/health/ready`、`/health/live` 端点（Terminus）
- **生产 Dockerfile**：多阶段构建 + Prisma generate + HEALTHCHECK
- **CI/CD 流水线**：GitHub Actions 工作流（前端构建 + 单元测试 + 后端 E2E + Admin 构建）

### 🟢 Admin 后台增强

- **评论审核**：新增 AI 风险分数 / 标记标签展示列
- **A/B 测试管理**：ExperimentView（实验列表 / 新建 / 状态控制 / 转化统计）
- **下载留资记录**：DownloadRecordView（筛选 / CSV 导出）
- **敏感词管理**：SensitiveWordView（词库 CRUD / 内容检测模拟器）

### 🗄 数据库变更

- 新增模型：`Stat`、`ClientLogo`、`WhyUsTab`、`AiCard`、`DownloadRecord`、`Experiment`、`ExperimentEvent`、`SensitiveWord`、`TokenBlacklist`
- `Resource` 新增 `requiresLeadInfo` 字段
- `Comment` 新增 `aiRiskScore`、`aiFlags` 字段
- `User` 新增 `abVariant` 字段
- 核心模型新增软删除 `deletedAt` 字段
- 新增枚举：`ResourceType`、`WorkspacePlan`、`WorkspaceStatus`、`TokenType`、`NotificationType`
- 新增复合唯一索引 `@@unique([slug, workspaceId])` 于 `BlogPost`
- 新增外键约束：`Notification.userId`、`Media.createdBy`、`FollowUp.createdBy`、`DemoBooking.assignedTo`、`Setting.updatedBy`、`DownloadRecord.resourceId`
- 新增性能索引：`Section.pageId`、`NavItem.navigationId/parentId`、`Comment.parentId` + 复合索引

### 🔒 安全修复（v3.0.0 审计批次）

- **XSS 防护**：BlogDetailView / ForumTopicView `renderMarkdown` 前增加 `escapeHtml` 转义；提取为 `src/utils/markdown.js`
- **MarkdownEditor XSS**：过滤 `javascript:` / `data:` / `vbscript:` 危险协议，内联链接只允许 http/https
- **AI SSE 公开滥用**：`@Sse('chat-stream')` 改为 `@Post('chat-stream')`，支持 reCAPTCHA body 认证
- **草稿文章泄露**：`findAllPosts` / `findPostBySlug` 强制过滤 `status: 'PUBLISHED'`，防止草稿公开访问
- **JWT 本地存储安全**：前端 `logout()` 调用后端 `/auth/logout` 使 Token 失效，写入 `TokenBlacklist`
- **SSE Token 安全**：前端 `FetchEventSource` 优先通过 `Authorization` header 传递 token，降级到 query param；后端 `SseAuthGuard` 优先读取 header
- **全局 JWT 黑名单**：`JwtAuthGuard` 作为 `APP_GUARD` 全局注册，`@Public()` 元数据控制公开路由
- **密码策略**：注册正则增加 `$` 锚点，防止前缀匹配绕过；CreateUserDto 统一 8位+大小写+数字+特殊字符
- **审计日志**：`AuditInterceptor` 全局注册，自动记录 POST/PATCH/DELETE 操作
- **CSP 加固**：Helmet 中间件 + 严格内容安全策略
- **Nginx 加固**：HSTS / X-Frame-Options / rate limit / ssl_ciphers / client_max_body_size
- **API 限流细化**：auth 端点独立限流桶 + `auth` 限流名称
- **Metrics 端点保护**：移除 `@Public()`，改为 ADMIN/SUPER_ADMIN 角色保护
- **users/search 保护**：移除 `@Public()`，需登录访问
- **RefreshToken 过期**：从 `JWT_REFRESH_EXPIRATION` 配置读取，避免硬编码
- **种子脚本安全**：管理员密码强制从 `SEED_ADMIN_PASSWORD` 环境变量读取
- **TokenCleanup 扩展**：同步清理 `RefreshToken` 表过期记录
- **Analytics 防伪造**：`ipAddress`/`userAgent` 从服务端 `req` 获取，移除客户端 `userId`
- **Download 防伪造**：移除 DTO 中的 `userId` 字段，服务端从认证上下文获取
- **PII 字段加密**：User.phone / DemoBooking.phone+email 通过 Prisma 扩展自动 AES-256-GCM 加解密
- **依赖漏洞修复**：nodemailer 6.10.1 → 8.0.9 / bcrypt 5.1.1 → 6.0.0 / xlsx → exceljs 4.4.0 / vite 5.4.2 → 8.0.14

### 🏗 架构改进

- **Prisma 扩展**：`$extends` 中间件自动注入 `workspaceId` 过滤（模型白名单）+ `softDeleteExtension` 自动过滤已删除记录
- **Prisma 索引优化**：新增 User.roleId、Comment.authorId、Media.createdBy 索引
- **Redis 缓存**：`CacheInterceptor` DI 注入 `REDIS_CLIENT` + `@CacheEvict` 写失效；`redis.keys()` 改为 `SCAN` 游标迭代
- **SSE Redis Pub/Sub**：Notification 实时推送支持多实例集群，全局仅 1 个 Redis psubscribe 连接
- **PII 加密扩展**：`fieldEncryptionExtension` AES-256-GCM 自动加解密敏感字段
- **导出流式化**：`export.service.ts` 改为 `WorkbookWriter` 流式写入 + 50,000 条上限 + 游标分页防 OOM
- **DTO 体系完善**：blog/forum/lead/cms/analytics/experiment/workspace/system 等模块新增 20+ DTO + 通用 PaginationDto
- **Workspace 隔离修复**：Blog/Forum/Lead Service 层补充 workspaceId 校验
- **核心事务修复**：auth-user.register / workspace.create / forum-post.create/delete / download.createRecord / cms-page.upsertNavigation 全部原子化
- **Prometheus 监控**：`MetricsModule` + `MetricsInterceptor` + `MetricsController`（`/metrics`）占位，安装 `prom-client` 后启用
- **Sentry 错误监控**：`src/utils/sentry.js` 占位，安装 `@sentry/vue` 后启用
- **结构化日志**：`nestjs-pino` + 启动时敏感配置校验（JWT_SECRET/REDIS_URL/DATABASE_URL）
- **nginx 生产配置**：`nginx.conf` 含 SSL、Gzip、缓存、API 反向代理、SSE 长连接、SPA fallback
- **前端 CSS Modules 迁移**：BlogListView / BlogDetailView / ForumView / ForumTopicView / ProfilePage 完成迁移
- **前端 Icon 重构**：`Icon.vue` 554 行 → 25 行，SVG Sprite 方案，78 图标零改动兼容
- **前端 i18n 完善**：匿名/知乎/微博/skip-link 等硬编码文本提取到多语言文件
- **前端 Vite 升级**：5.4.2 → 8.0.14，manualChunks 适配 Rolldown 引擎
- **Playwright E2E**：新增 firefox、webkit、mobile chrome、mobile safari 浏览器矩阵
- **Admin RBAC**：`v-permission` 指令（single/all/any 模式）+ auth store 权限辅助方法
- **前端错误上报**：`window.onerror` / `onunhandledrejection` beacon 上报到 `/api/v1/analytics/errors`
- **单元测试大幅提升**：后端 2 suites/9 tests → 7 suites/47 tests；前端 26/107 → 28/117
- **API 类型定义**：`src/api/types.d.ts` JSDoc 类型补充

### ⚠️ 待执行（手动）

```bash
cd talentpro-backend
npm install          # 安装 @nestjs/schedule, helmet
npx prisma migrate dev --name p1_enums_indexes_soft_delete
npx prisma generate
```
```
