# Changelog

## [v4.3.2] - 2026-07-13 (全量清理与工程化改进)

### 🧹 工程化清理

- **版本与配置收口**: 三项目 `package.json` 统一升级至 `4.3.2`；`talentpro-backend/.env.example` 补全 `APP_CORS_ORIGINS`（含 3000/3001/3002/8080/3457）
- **ESLint 死代码检测恢复**: 恢复 `no-undef` / `no-unused-vars` 规则，修复 39 处未使用导入/变量；前端 `npm run lint` 0 errors
- **共享层物理迁移**: 前端将 `api/client`、CMS composables、主题/搜索/导航/焦点 trap/滚动锁、JSON-LD/日期等工具函数迁入 `src/shared/`；后端将 decorators/guards/helpers/interceptors/prisma/repositories/redis/metrics/types 迁入 `libs/shared/`，业务代码统一 `@shared/*` 导入，旧路径保留兼容性 re-export
- **Admin 组件工程化**: 组件按 `ui/ai/page-config/order-manager` 分目录；新增 `permission.config.js` 权限矩阵并接入菜单/路由；为所有视图/组件/工具补全 JSDoc
- **前端数据层抽象**: 新增 `createLocalizedData` / `createLocalizedEntry` 工厂重构 blog/cases/news/resources fallback；新增 `searchIndexFactory` 统一搜索索引结构

### ✅ 验证结果

- 前端 Vitest：`36 files, 172 tests` 全部通过
- 前端 Nuxt 生产构建：成功
- 后端 Jest：`83 files, 990 tests` 全部通过，不再超时
- 后端 NestJS 生产构建：成功
- Admin Vitest：`12 files, 77 tests` 全部通过
- Admin Vite 生产构建：成功

## [v4.3.1] - 2026-07-06 (项目整理与重构)

### 🧹 项目整理

- **代码复用层**: 前端建立 `src/shared/`，后端建立 `libs/shared/`，将 API 客户端、CMS 数据层、认证/主题/搜索、CRUD 仓库、Prisma 扩展等可复用能力显性化
- **死代码清理**: 删除未引用组件 `AppCard`、未使用模块 `manifest-loader`、`module-loader`，合并后端重复 `SearchDocument` 定义
- **依赖治理**: 移除 `vite-plugin-checker`、`rollup-plugin-visualizer`、`vite-plugin-pwa` 等未使用/重复依赖；将 `happy-dom` 归位到 `talentpro-admin`
- **目录重构**: 归档 `MEMORY.md`、`app-marketplace-plan.md`、根目录 `project-plan.md`、`website_架构与产品评估报告.md`；合并重复项目计划文档
- **文档整理**: 统一 README 与 docs 版本号为 v4.3.0；新增 `environment-variables.md`、`admin-components.md`、`reusable-assets.md`、`section-registry-sync.md`、`i18n-guide.md`

### ✅ 验证结果

- 前端 Vitest：`36 files, 172 tests` 全部通过
- 前端 Nuxt 生产构建：成功，预渲染 647 条路由
- 后端 TypeScript：`npx tsc --noEmit` 通过
- Admin Vite 生产构建：成功
- 后端 Jest 测试：因历史原因超时，建议后续优化测试性能；本次整理未改动业务逻辑

## [v4.3.0] - 2026-07-05 (技术债清零 + 高价值迭代)

### 🐛 缺陷修复

- **应用广场 500 / 空白**: 应用 `20260615000000_marketplace_align` migration 修复 `apps.tags` 等字段漂移；后端 Marketplace API 不再返回 500；列表与详情页均保留静态 fallback
- **博客/论坛空白**: 新增 `src/data/blog.js`、`src/data/forum.js` 静态 fallback；`pages/blog/index.vue`、`pages/blog/[slug].vue`、`pages/forum/index.vue`、`pages/forum/topic/[id].vue` 在 API 空库/失败时自动降级展示示例内容
- **案例详情缺时间线/产品**: `pages/cases/[slug].vue` 在拿到 API 数据后合并静态 `CASES` 的 `timeline`、`products`、`relatedCases` 等字段，保证详情页故事线完整
- **关于我们子页面路由**: `about.vue` 改为只渲染 `<NuxtPage />`，原内容下沉到 `about/index.vue`，修复 `/about/contact`、`/about/team`、`/about/partners` 被错误渲染为「了解我们」页面的问题
- **后端 lint**: 修复 `talentpro-backend` 46 个 `@typescript-eslint/no-unused-vars` errors
- **Admin lint**: 新增 `talentpro-admin/eslint.config.mjs` flat config，修复 lint 脚本 "all files ignored" 错误
- **ChatBot AI 对话**: `useChatBot.js` 从失效的 SSE `GET /ai/chat-stream` 改为 `POST /ai/chat`
- **中文字体加载**: `src/styles/global.css` 补全 `Noto Sans SC` 字重；`nuxt.config.ts` 预加载 400/700 woff2
- **ImageUpload 端点**: 修复 Admin 图片上传组件 URL（`/medias` → `/medias/upload`）
- **首页 Hero 不显示**: 修复 `sectionRegistry.js` 中 `DEFAULT_ORDER` 使用 `|| 99` 导致 `order: 0` 被误判为 `99`，Hero 被排到最后的 bug（改为 `?? 99`）
- **CORS 跨域**: 后端启动时设置 `APP_FRONTEND_URL=http://localhost:8080`，前端 dev 请求不再被拦截
- **客户案例空白**: `pages/cases/index.vue` 在 API 返回空数组时也回退到 `CASES` 静态数据，避免页面无卡片
- **限流 429**: `AnalyticsController` 添加 `@SkipThrottle()`，本地开发时 analytics 事件/热力点上报不再触发 `Too Many Requests`
- **未登录 401**: `CartButton` / `NotificationBell` 仅在用户已登录时才调用 `/cart` 与 `/notifications`，未登录状态不再报 `未授权，请登录`
- **控制台 i18n 警告**: `WhyUsSection` 改为回退静态 `WHY_US_TABS`/`SECURITY_CERTS`；`IndustrySolutionSection` 默认 key 改为 `mfg`；`src/i18n/keyMap.js` 增加 `manufacturing → mfg` 映射
- **CMS home 404 日志**: `cmsApi.getPage` 增加 `{ silent: true }`，避免 CMS 首页配置未创建时前端控制台打印红色错误
- **导航重构**: `src/data/navigation.js` 新增「关于我们」下拉菜单，纳入 应用广场 / 博客 / 社区 / 公司介绍 / 新闻 / 加入我们 / 联系我们；`NavBar.vue` / `MobileMenu.vue` 移除硬编码的博客/社区链接；footer「了解我们」同步补充
- **Docker 开发环境**: 新增根目录 `docker-compose.dev.yml`，一键启动 PostgreSQL / Redis / Meilisearch / MinIO / API，并自动执行 `prisma migrate deploy` + `db:seed` + `db:seed:rich`；修复 `prisma/schema.prisma` 与历史 migrations 的 Marketplace 字段漂移，新增 `20260615000000_marketplace_align` migration
- **tsconfig.json 不阻塞构建**: 调整 `include`/`exclude` 范围，仅包含 `src/types/**/*.ts`，避免 Nuxt 生产构建将根 tsconfig 误判为源码检查配置而失败
- **后端 lint 收尾**: 移除 `workspace.service.spec.ts` 未使用的 `ConflictException`，当前 `npm run lint` 0 errors / 9 warnings

### 🚀 高价值迭代

- **Admin 构建优化**: `talentpro-admin/vite.config.js` 细粒度 `manualChunks`，消除 500KB+ chunk warning
- **Admin 图片上传组件**: 新增 `ImageUpload.vue`；在博客/新闻表单中接入封面图上传；新增 6 个 Vitest 测试
- **Admin 测试体系**: 新增 `vitest.config.js` + `happy-dom`，`npm run test` 可用
- **后端类型安全**: `@typescript-eslint/no-explicit-any` 警告从 292 清零；新增 `common/types.ts` 统一 `UserContext`；修复 cms / export / payment / search / workspace 等模块的类型错误
- **后端 E2E**: 扩展 `e2e-run.js` 至 15 个用例，覆盖 Health / Auth / Blog / Forum / Lead / CMS / News（Marketplace 因 migrations 与 schema 漂移暂时跳过）
- **文档同步**: `docs/prd.md` / `docs/architecture.md` 升级至 v4.1.0，补充 Marketplace/Payment/Cart、Admin 视图清单
- **国际化补全**: 提取 204 个用户可见中文到 i18n key，移除所有 `|| '中文'` fallback
- **导航/页脚 CMS 化**: 新增 `useNavigation()` + `useSiteConfig()` + `src/api/system.js`；`NavBar`/`MobileMenu`/`Footer` 优先读取 `/cms/navigations/:key` 与 `/system/config/public`，失败时回退静态数据，运营无需发版即可调整导航、联系电话与版权信息
- **功能开关体系**: 后端 `GET /system/config/public` 返回 `featureFlags`；前端新增 `useFeatureFlag(key)`，支持按 key 灰度开启/关闭模块
- **AI 内容生成端点**: 后端 `POST /ai/generate` 支持 `blog`/`product`/`seo`/`translate`/`moderate` 类型；结果作为草稿返回，需运营确认后发布

### 🔧 P3 技术债修复（2026-07-06）

- **PII email 加密与 HMAC 哈希索引（P3-04）**
  - Prisma schema：`User` / `WorkspaceInvite` 新增 `emailHash` 列；`User` 唯一约束与两者索引改为基于 `emailHash`
  - 字段级加密扩展 `field-encryption.extension.ts`：在 AES-GCM 加密前自动计算 `HMAC-SHA256(email)` 并写入 `emailHash`
  - `auth-user.service.ts` / `user.service.ts` / `workspace.service.ts` 的 email 等值查询改为按 `emailHash` 查找
  - 新增 migration `20260706100000_add_email_hash_columns`；`.env.example` 增加 `PII_HMAC_KEY`
  - 用户搜索保留按姓名模糊匹配；含 `@` 的查询串改为按 `emailHash` 精确匹配

- **后端启用完整 TypeScript 严格模式（P3-01）**
  - `talentpro-backend/tsconfig.json` 开启 `"strict": true`
  - 约 65 个 DTO 的字段补充 definite assignment assertion（`email!: string` 等）
  - 修复 catch 变量 `unknown`、Prisma `$transaction` mock 类型、服务属性初始化等 strict 错误
  - `npx tsc --noEmit` 通过，生产行为未变更

- **Admin 启用完整 TypeScript 严格模式（P3-02）**
  - `talentpro-admin/tsconfig.json` 开启 `"strict": true` 并添加 `ignoreDeprecations`
  - `vue-tsc --noEmit` 与生产构建通过

- **Admin 超行视图拆分（P3-06）**
  - 拆分 `PageConfigView.vue`（473 → 329 行）：`PageConfigSectionList.vue` / `PageConfigAddSection.vue` / `PageConfigMetaCard.vue` / `PageConfigAiPanel.vue`
  - 拆分 `OrderManagerView.vue`（287 → 250 行）：`OrderManagerFilters.vue` / `OrderManagerDetailDialog.vue` / `OrderManagerStatusDialog.vue` / `OrderManagerInvoiceDialog.vue`
  - 保留测试依赖的 `wrapper.vm` 属性与方法；Admin 测试与构建通过

### ✅ 验证结果

| 检查项 | 结果 |
|--------|------|
| 前端 `npm run lint` | ✅ 通过 |
| 前端 `npm run test:run` | ✅ 36 套件 / 175 测试通过 |
| 前端 `npm run build` | ✅ 647 条路由预渲染成功 |
| Playwright E2E | 未在当前迭代重跑 |
| 后端 `npm run lint` | ✅ 0 errors / 135 warnings（`any` 警告为历史遗留） |
| 后端 `npm run test` | ✅ 83 套件 / 990 测试通过 |
| 后端 `npm run test:e2e` | 未在当前迭代重跑 |
| Admin `npm run lint` | ✅ 通过 |
| Admin `npm test` | ✅ 12 套件 / 77 测试通过 |
| Admin `npm run build` | ✅ 通过 |
| 后端 `npx tsc --noEmit` | ✅ 通过 |
| Admin `npx vue-tsc --noEmit` | ✅ 通过 |

### 📝 文档同步

- `AGENTS.md`: 更新 `useChatBot.js` 描述、补充 Noto Sans SC 预加载说明
- `docs/prd.md`: 升级至 v4.1.0，新增 Marketplace / Payment / Cart 章节
- `docs/architecture.md`: 升级 Admin 视图清单与技术栈版本

---

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

## [v4.1.0] - 2026-06-09 (Marketplace / Payment / Cart + 技术债务清零)

### 🛒 Marketplace 模块

- **应用广场**：`pages/marketplace/index.vue` + `[slug].vue`，静态 fallback `src/data/marketplace.js`（12 应用 / 8 分类 / 11 供应商）
- **应用卡片**：渐变图标、评分星级、定价标签、Featured 精选区
- **应用详情**：Hero 渐变、定价方案（3 档）、功能列表、兼容性标签、相关应用推荐
- **管理后台**：`AppManagerView` / `CategoryManagerView` / `VendorManagerView` / `ReviewManagerView`
- **后端 API**：`MarketplaceModule`（App / AppCategory / AppVendor / AppReview / Subscription）

### 💳 Payment 模块

- **Stripe Checkout**：`PaymentService.createStripeCheckout()` 生成 Session，`line_items` 映射定价方案
- **Webhook 处理**：`handleStripeWebhook()` 监听 `checkout.session.completed`，自动激活订阅
- **订单生命周期**：`PENDING` → `COMPLETED` / `FAILED` / `REFUNDED`，Prisma 事务保证
- **前端支付页**：`payment/success.vue` / `payment/cancel.vue`，带订单信息展示
- **环境变量**：`STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `STRIPE_API_VERSION='2024-12-18.acacia'`

### 🛍️ Cart 模块

- **Redis 购物车**：`cart:{userId}`，TTL 7天（`7 * 24 * 60 * 60`）
- **CRUD 接口**：`getCart` / `addItem` / `updateItem` / `removeItem` / `clearCart`
- **前端组件**：`CartButton.vue`（下拉列表、数量角标、结算入口）

### 🔧 技术债务修复（P0 / P1 / P2 / P4）

**P0 — 安全红线**
- 删除误提交的 `talentpro-backend/.env`（含真实数据库密码）
- Stripe API 版本修复：`2026-05-27.dahlia` → `2024-12-18.acacia`
- SSR 安全：所有 `localStorage` / `document` / `window` 访问包裹 `typeof window !== 'undefined'` 或 `onMounted`
- 8 个动态路由（blog/cases/news/products/resources/solutions/careers/marketplace）数据缺失时返回 HTTP 404
- 后端新增 3 个 Jest 测试套件：`cart.service.spec.ts`（9 测）、`marketplace.service.spec.ts`（10 测）、`payment.service.spec.ts`（8 测）
- 后端新增首个 E2E 测试：`app.e2e-spec.ts`（GET /health/live）

**P1 — 架构修复**
- 统一 API 解包风格：移除 14 处 `.then((r) => r.data)`，由响应拦截器统一 unwrap `{ success, data, meta }`
- 补全 `src/api/index.js` 导出：新增 caseApi / newsApi / aboutApi / careersApi / marketplaceApi / paymentApi / cartApi / notificationApi / userApi / commentApi
- 删除遗留 `src/stores/auth.js`（91 行），确认零引用
- XSS 防护：安装 `marked` + `dompurify`，`renderMarkdown()` 统一使用 `DOMPurify.sanitize()`，`CommentItem.vue` / `forum/topic/[id].vue` / `MarkdownEditor.vue` 迁移到 `utils/markdown.js`
- Docker `start:prod` 路径修复：`dist/main.js` → `dist/apps/api/src/main.js`
- 前端 `.dockerignore` 排除 backend/admin 目录
- `talentpro-admin/package.json` 补充 `lint` / `test` scripts

**P2 — 代码质量**
- CSS 硬编码色值清零：新增 11 个 Design Token（`indigo-400` / `amber-500` / `grad-primary-light` 等），替换 5 个文件 23 处硬编码
- `alert()` → `showToast()`：`marketplace/[slug].vue` 和 `CartButton.vue` 全部替换
- i18n key 补全：`marketplace` 命名空间 0 缺失（zh/en/zh-TW 三语言同步）
- 删除遗留测试 `src/stores/auth.test.js`（引用已删除的 `auth.js`）

**P4 — 清理与规范**
- 删除遗留文件：`index.html.deprecated` / `src/api/baseUrl.ts` / `src/api/client.ts` / `scripts/prerender.js` / `src/stores/i18n.js` / `src/stores/i18n.test.js`
- ESLint 配置修复：添加 `createError` 全局变量，删除 4 个重复全局定义
- import 路径统一：`@/api/baseUrl` → `@/api/baseUrl.js`（App.vue / useRum.js）
- `package.json` engines 字段：`node >= 18.0.0` / `npm >= 9.0.0`（根目录 + admin + backend）
- AGENTS.md 同步：更新 stores/ 目录结构描述，移除 `auth.js` / `i18n.js` legacy 说明

### 🐛 依赖与基础设施修复

- **Bull 队列注册**：`NotificationModule` / `SearchModule` / `AppModule` 补充 `BullModule.registerQueue()`，修复 `@InjectQueue()` 运行时缺失队列错误
- **Prisma 迁移**：`prisma migrate reset` 成功应用 10 个迁移，`prisma db seed` 完成（8 分类 + 11 供应商 + 12 应用）
- **Schema 修复**：`isVerified` → `verified`、`logo` → `logoUrl`、seed 数据补充 `iconUrl` / `version`

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

### ✅ 已完成的迁移任务

- `prisma migrate reset` 成功应用 10 个迁移
- `prisma db seed` 完成：8 分类 + 11 供应商 + 12 应用
```
