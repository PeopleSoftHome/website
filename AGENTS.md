# AGENTS.md — TalentPro HR Portal

> 面向 AI 编程助手。**当前版本**：v4.4.2 | **技术栈**：Nuxt 4.4.8 + Nitro 2.13.4 + Vue 3.5 + TypeScript + CSS Modules + Pinia + @nuxtjs/i18n + NestJS 11 + Prisma 6 + Redis

---

## 1. 项目概览

TalentPro HR Portal 是面向中大型企业的 B2B HR SaaS 营销门户（SSG SPA），以「预约演示」为核心转化目标。

- **部署形态**：SSG 静态站点，产物位于 `.output/public/`
- **数据策略**：首页 Section 优先从后端 CMS 获取，失败回退到 `src/data/` 静态常量；博客/论坛/认证接入 NestJS API（`src/api/`）
- **前端**：`src/` 目录，Nuxt 文件路由，TypeScript 已全量迁移
- **后端**：`talentpro-backend/`，API Base `http://localhost:4000/api/v1`
- **Admin**：`talentpro-admin/`，端口 3457，独立部署

---

## 2. 技术栈与构建

### 2.1 核心依赖

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Nuxt | 4.4.8 | 文件路由 + 自动导入 + Nitro 引擎 |
| 底层框架 | Vue | 3.5.38 | SFC + `<script setup>`，组合式 API |
| 构建工具 | Vite | 7.3.5 | 开发端口 8080 |
| 状态管理 | Pinia | 3.x | `@pinia/nuxt` 自动注册 |
| i18n | @nuxtjs/i18n | 10.4.0 | 自动路由前缀 + SEO hreflang |
| 图片优化 | @nuxt/image | 2.0.0 | 自动 WebP + 响应式尺寸 |
| 样式 | CSS Modules | 原生 | 零运行时开销 |
| 语言 | TypeScript | ES Module | 前端已全量迁移，Admin/后端按模块推进 |

**不引入通用 UI 组件库**（antd / MUI）。所有原子组件自行封装。

### 2.2 构建命令

```bash
npm install
npm run dev        # http://localhost:8080
npm run build      # SSG → .output/public/
npm run preview
npm run generate
```

**环境要求**：Node.js ≥ 18，npm ≥ 9。

### 2.3 构建配置要点

- `srcDir: 'src'`, `ssr: true`, `nitro.preset: 'static'`
- `nitro.prerender: { routes: buildPrerenderRoutes(), crawlLinks: true }`，`buildPrerenderRoutes()` 在 `nuxt.config.ts` 中按 `prefix_except_default` 生成 3 语言全部动态路由
- `nitro.compressPublicAssets: false`（Windows static preset 下避免资源复制竞态）
- 模块：`@nuxtjs/i18n`, `@pinia/nuxt`, `@vite-pwa/nuxt`, `@nuxt/image`
- 自动导入：`components/`（`pathPrefix: false`）、`composables/`、`stores/`、`utils/`

---

## 3. 目录结构

```
np-website/
├── nuxt.config.ts
├── package.json
├── vitest.config.ts
├── public/                     # 静态资源
├── src/
│   ├── app.vue                 # 根组件 + 全局观察器
│   ├── middleware/             # 全局路由中间件
│   ├── pages/                  # 文件路由（首页 / 博客 / 论坛 / 产品 / 方案 / 案例 / 资源 / 新闻 / 招聘 / 关于 / 个人中心 / marketplace）
│   ├── components/
│   │   ├── layout/             # NavBar / Footer
│   │   ├── sections/           # 首页各区块
│   │   └── ui/                 # 原子组件（Button / DemoModal / SearchModal / VideoModal / ContactModal / ChatBot 等）
│   ├── stores/                 # Pinia stores
│   ├── api/                    # 后端 API 封装
│   ├── composables/            # 自定义 composables
│   ├── data/                   # 静态 fallback 数据
│   ├── i18n/                   # 多语言与插值
│   ├── tokens/                 # Design Token
│   └── styles/                 # global.css / animations.css / reveal.css
├── talentpro-admin/            # 管理后台
├── talentpro-backend/          # NestJS 后端
└── docker/                     # Dockerfile.frontend
```

---

## 4. 编码规范

### 4.1 命名规则

| 类型 | 规则 | 示例 |
|------|------|------|
| Section 组件 | `[名称]Section` | `HeroSection` |
| 子组件 | 语义名称 | `ProductCard` |
| UI 原子 | 功能名 | `Button`, `Tag` |
| Composable | `use[功能名]` | `useCarousel` |
| Store | `[名称]Store` | `auth`, `theme` |
| 数据常量 | 全大写 SNAKE_CASE | `PRODUCT_TABS` |
| CSS class | camelCase | `.heroSection` |

### 4.2 单文件行数限制（指导性约束）

| 类型 | 建议上限 | 强制拆分线 | 超出策略 |
|------|----------|-----------|---------|
| Section 组件 | 250 行 | 600 行 | 拆子组件 |
| 子组件 | 150 行 | 400 行 | 提取 Composable |
| UI 原子组件 | 150 行 | 300 行 | - |
| CSS Module | 400 行 | 600 行 | 按互不相交类族拆分 |
| Hook / Composable | 150 行 | 300 行 | 拆分职责 |

> **原则**：行数不是硬指标，而是可读性信号。200 行左右的文件属于正常工程范围，不应为了凑行数而过度拆分；但当文件超过强制拆分线、职责明显混杂、或同一文件存在多个独立类族/状态时，应果断拆分。
>
> **明确豁免**：SVG Sprite、复杂分步表单、状态机密集 composable、静态 fallback 数据文件。长期超出应逐步收敛。

### 4.3 样式规范

- **CSS Modules 唯一合法方案**：每个组件/section 同名 `.module.css`
- **禁止硬编码色值**，必须使用 `var(--token)`
- 响应式写在同一文件底部，使用 `max-width` 断点
- `global.css`：`:root` 变量 + Reset + body；`animations.css`：全部 `@keyframes`；`reveal.css`：`.reveal` / `.is-visible`
- `src/tokens/index.ts` 是 Design Token 唯一真相来源，修改后同步 `:root`

### 4.4 弹窗 z-index 层级（不可冲突）

| 弹窗 | z-index | 触发 |
|------|---------|------|
| ChatBot | 1500 | 浮动栏 💬 |
| DemoModal / AuthModal | 2000 | 预约演示 / 登录 |
| ContactModal | 2100 | 浮动栏 📞 |
| SearchModal | 2500 | Cmd+K |
| VideoModal | 3000 | 观看演示 |

### 4.5 全局状态（Pinia）

- `useAuthStore` — 认证（SSR-safe，无 localStorage token）
- `useThemeStore` — 暗色模式
- `useModalStore` — DemoModal
- `useVideoModalStore` — VideoModal
- `useSearchStore` — 全局搜索
- `useAnalyticsStore` — 埋点队列

业务代码统一使用 Pinia Store；多语言统一 `useI18n()`。

---

## 5. 核心架构模式

### 5.1 Reveal 滚动入场

`App.vue` 全局 `IntersectionObserver`（threshold 0.06）+ `MutationObserver` 防抖扫描，自动给 `.reveal:not(.is-visible)` 添加 `.is-visible`。组件可直接使用 `class="reveal"`，避免与 `useScrollReveal` 重复观察。

### 5.2 暗色模式

`<html data-theme="dark">` 切换，`global.css` `[data-theme="dark"]` 覆盖 Token。优先级：`localStorage(tp-theme)` → `prefers-color-scheme` → `light`。`useTheme()` 提供 `{ theme, toggle, setTheme, isDark }`。

### 5.3 多语言 i18n

- 3 语言：`zh` / `en` / `zh-TW`；策略 `prefix_except_default`
- 约 772 keys，点分隔路径，支持 `{var}` 插值
- 自动 SEO：`hreflang` + `<html lang>`
- 优先级：`cookie(tp-locale)` → 浏览器语言 → `zh`

### 5.4 全局搜索

`Cmd+K` / `Ctrl+K` 触发，本地检索 `src/data/searchIndex.ts`，加权评分（标题 > tags > 描述），150ms 防抖，↑↓ 导航，Enter 跳转，关键词高亮。

---

## 6. 测试策略

### 6.1 自动化测试

| 类型 | 工具 | 命令 | 说明 |
|------|------|------|------|
| 前端单元测试 | Vitest | `npm run test:run` | composables / utils / pages / stores |
| 前端 E2E | Playwright | `npx playwright test` | 首页 / 博客 / 论坛 / 认证 / 搜索 / 主题 / 表单 |
| 后端单元测试 | Jest | `cd talentpro-backend && npm run test` | auth / user / blog / forum / lead / mail |
| 后端 E2E | Jest | `cd talentpro-backend && npm run test:e2e` | 持续补充 |

### 6.2 手动验证要点

每次变更后确认：`npm run dev` 无报错 → `npm run build` 成功且路由预渲染通过 → Vitest + Playwright 全绿 → 首页 Section 可见 → 导航下拉不消失 → Tab 切换联动 → 轮播/Logo 墙/弹窗/搜索/暗色/多语言正常 → 博客/论坛/认证/产品/方案/案例/资源/新闻/招聘/关于我们流程正常 → 后端 `/health` 200。响应式覆盖 375px / 768px / 1024px+。

---

## 7. 安全与性能

### 7.1 安全

- 认证：JWT Access/Refresh + bcrypt + 角色（USER/ADMIN/SUPER_ADMIN）
- 表单：前后端双重校验，手机号格式校验，HTTPS 强制（生产）
- ChatBot：`escapeHtml` 后 `v-html`
- API：`ThrottlerGuard` 全局限流
- JWT logout：写入 `TokenBlacklist`
- PII：AES-256-GCM 字段级加密（`PII_ENCRYPTION_KEY`）
- CSP：`helmet` 显式配置
- 依赖：`npm audit` 0

### 7.2 性能目标

| 指标 | 目标 | 工具 |
|------|------|------|
| LCP | < 2.5s | Lighthouse |
| CLS | < 0.1 | Lighthouse |
| JS vendor | < 150KB gzip | Vite 报告 |
| JS app | < 80KB gzip | Vite 报告 |
| CSS | < 30KB gzip | Vite 报告 |

优化：vendor chunk 拆分、图片懒加载 + `max-width: 100%`、IntersectionObserver 动画、`prefers-reduced-motion` 禁用动效。

---

## 8. 部署

```bash
npm run build
```

产物在 `.output/public/`，可部署到 Vercel / Netlify / Nginx / OSS+CDN / Docker。Nginx 需 `try_files $uri $uri/ /index.html;`。静态资源（`_nuxt/**`、`fonts/**`）配 1 年缓存。

**本地全栈**：`docker-compose -f docker-compose.dev.yml up -d` 启动 PG/Redis/Meilisearch/MinIO/后端，然后宿主机 `npm run dev`。

---

## 9. 常见陷阱

1. CSS Modules 跨文件 `@keyframes` 需本地声明。
2. Tab 切换后 `.reveal` 由全局 `MutationObserver` 自动修复。
3. 严禁硬编码 `#fff`/`#000`，使用语义化 CSS 变量。
4. 新增用户可见文本必须同步 `zh-CN.json` / `en.json` / `zh-TW.json`。
5. 新增弹窗前核对 z-index 表。
6. Admin：`useList` 返回普通对象包裹的 ref，模板用 `list.items` 访问时必须 `reactive(useList(...))` 包装（参照 `useCrud` 返回约定）；从 `useCrud` 的 reactive 返回值解构必须经 `toRefs`，直接解构会拿到一次性快照（el-table 收到 RefImpl 会抛 `rows is not iterable`，继而引发 `parentNode` 渲染崩溃）。

---

## 10. 文档索引

| 文档 | 路径 |
|------|------|
| 产品需求 | `docs/prd.md` |
| 项目规格 | `docs/project-spec.md` |
| 技术架构 | `docs/architecture.md` |
| 设计系统 | `docs/design-system.md` |
| 项目计划 | `docs/project-plan.md` |
| 风险登记册 | `docs/risk-register.md` |
| 测试计划 | `docs/test-plan.md` |
| 变更记录 | `CHANGELOG.md` |

---

## 11. 版本规范速查

### v3.0.0 架构规范

- **安全**：ChatBot 转义；API 默认限流；JWT logout 写入黑名单；密码 ≥8 位含大小写+数字+特殊字符
- **缓存**：CMS GET 用 `@Cacheable`；`@CacheEvict` 推荐 `keys: string[]`
- **事件**：BullMQ `attempts: 3` + 指数退避；`@OnWorkerEvent('failed')` 记录死信
- **SEO**：Blog/Forum 动态更新 `document.title` + meta；JSON-LD 用 i18n key
- **PII**：AES-256-GCM 自动加解密；密钥 `PII_ENCRYPTION_KEY`
- **SSE**：Redis Pub/Sub；全局 1 个 `psubscribe('sse:notifications:*')`；channel `sse:notifications:{userId}`
- **Icon**：SVG Sprite；`<Icon name="xxx" />` 零改动
- **响应包装**：`TransformInterceptor` 用 Symbol 标记避免误判
- **分页**：统一 `getSkip` / `buildPaginatedResponse`
- **Admin 权限**：路由守卫检查 `roles` + `permissions`；菜单用 `visibleMenu` + `hasMenuPermission`，**禁止菜单项直接用 `v-permission`**
- **CmsTable**：支持 `form-field-{prop}` 插槽、`apiParams`、`defineExpose({ setParams, params, fetch, refresh })`
- **BaseCrudRepository**：单一模型 `extends BaseCrudRepository`；CMS 内容用 `CmsContentRepository.forModel(modelName)`
- **CI/CD**：GitHub Actions 前端构建 + Vitest + 后端 Nest build + E2E

### v4.0.0 Nuxt 迁移

- 文件路由：`src/pages/` 自动生成；动态 `[slug].vue`、通配 `[...slug].vue`
- 中间件：`src/middleware/route.global.ts` 统一处理认证与 meta
- 自动导入：严禁在 `.vue` 中手动 `import { ref, computed } from 'vue'`（除非 ESLint 要求）
- SSR 安全：`window/document/localStorage` 必须 `onMounted` / `process.client`；Pinia 中 `typeof window !== 'undefined'`
- 数据获取：优先 `useAsyncData` + `$fetch`；key 全局唯一；`{ server: false }` 客户端获取；`default` 做 fallback
- 图片：全部 `<NuxtImg>`；远程图配置 `image.domains`
- 产物：`.output/public/`；`compressPublicAssets` 预生成 gzip/brotli；`_nuxt/**` 1 年缓存

### v4.1.0 交易与扩展

- **Marketplace**：后端 `marketplace/`（App/AppCategory/AppVendor/AppReview/Subscription）+ Admin 管理页 + 前端 `pages/marketplace/` + fallback `src/data/marketplace.ts`
- **Payment**：Stripe Checkout + Webhook；订单状态 `PENDING/COMPLETED/FAILED/REFUNDED`；环境变量 `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- **Cart**：Redis TTL 7 天；`CartService` CRUD；前端 `CartButton`
- **Bull 队列**：`@InjectQueue` 必须在模块/AppModule 注册；已注册 `notification`, `search-index`, `lead-nurture`

### v4.2.0 配置治理与安全加固

- **JWT Cookie-only**：前端与 Admin 均 `withCredentials: true`，不再读写 `localStorage` token；后端优先 httpOnly Cookie，兼容 Bearer
- **Cookie**：`httpOnly: true`, `sameSite: 'lax'`, `secure: true`（生产）；`TokenBlacklist` 记录注销 token；Admin `logout` 调用后端 `/auth/logout`
- **PII 加密扩展**：覆盖 `User/DemoBooking/DownloadRecord/JobApplication/AppVendor/TeamMember` 的 phone/email/resumeUrl/contact 等；查询字段 email 暂为明文
- **审计**：`AuditInterceptor` 记录 `oldValue/newValue`；`POST /system/audit-logs` 仅 SUPER_ADMIN
- **IP 过滤**：`TRUSTED_PROXIES` 支持 CIDR/IPv6；`APP_ALLOWED_IPS` / `APP_BLOCKED_IPS`
- **工程化**：Joi 校验关键 env；限流 `THROTTLE_TTL/LIMIT` 可配置；`process.env` 收敛到 `ConfigService`；公开配置 `GET /system/config/public`；前端 `runtimeConfig.public.apiBaseUrl`
- **导航 CMS 化**：NavBar/MobileMenu/Footer 优先 `useNavigation()` 读 CMS，失败回退 `src/data/navigation.ts`
- **功能开关**：后端 `featureFlags` + 前端 `useFeatureFlag(key)`
- **AI 生成**：`POST /ai/generate`（ADMIN/SUPER_ADMIN）；Admin `AiAssistButton` 已接入 Blog/News/Case/EmailTemplate/Products/Industries/Job/AppManager
- **CMS 通用 CRUD**：`/cms/content/:type` 走 `CmsGenericService`
- **翻译后端化**：`useCmsTranslations()` 合并 CMS 覆盖层；Admin `/cms/translations` 管理页
- **ChatBot**：后端 `ChatBotConfig` / `AiChatSession`；`GET /system/chatbot-config`；`POST /ai/chat` 与 `/ai/chat-stream` 持久化多轮对话
- **站点配置后端化**：`GET /system/config/public` 返回 sitePhone/copyright/featureFlags/hotTags/socialLinks/siteTitle/siteDescription；`useSiteConfig()` 统一消费
- **Admin 移动端**：`src/styles/responsive.css` 全局引入
- **Admin TS 启动**：新增 `tsconfig.json` + `env.d.ts`，`main.ts` 已迁移

### v4.2.0 可观测性与架构债

- **日志**：`nestjs-pino`；`genReqId` 读 `X-Request-ID`；响应头 `X-Request-Id`；自动脱敏 auth/cookie/password
- **CSP**：`helmet` 显式配置
- **ErrorBoundary**：`App.vue` 包裹 `<ErrorBoundary>`
- **Redis 缓存隔离**：`CACHE_KEY_PREFIX` 前缀；`Cache-Control` 精确正则匹配
- **AI 审核**：`CommentModerationService` 叠加 OpenAI Moderation API
- **LLM 抽象**：`LlmProvider` 接口；已接入 `AiOpenAiService` / `AiAzureOpenAiService` / `AiAnthropicService`；`LlmProviderFactory` 按 `AI_PROVIDER` 选择真实实现，未配置或 `openrouter` 时显式报错；模型参数环境变量驱动
- **依赖治理**：`npm audit` 0；`overrides` 锁定安全版本

### v4.3.0 Admin 配置智能化

- **AI 图片生成**：`POST /ai/generate-image`（ADMIN/SUPER_ADMIN，权限 `ai:generate-image`）；DALL·E 生成后落入媒体库；环境变量 `OPENAI_IMAGE_MODEL/SIZE/QUALITY/STYLE`。
- **Admin 配置助手**：`POST /ai/admin/chat`（权限 `ai:chat`），为配置流程提供文案/图片建议；聊天面板嵌入 `PageConfigView`。
- **Section 配置 schema**：`sectionRegistry.js` 与 `src/utils/sectionRegistry.ts` 同步 `defaultConfig` + `configSchema`；Hero 支持背景图/标题/副标题/CTA/仪表盘开关。
- **动态配置表单**：`SectionConfigForm.vue` 按 schema 渲染 input/textarea/switch/image-upload；`ImageUpload.vue` 支持“AI 生成图片”。
- **门户 Hero 配置化**：`HeroSection.vue` 读取 CMS `Section.config`，未配置时回退 i18n。
- **部署注意**：新增权限 `ai:generate-image`、`ai:chat` 在 `seed.ts` 中写入。已有数据库需重新执行 seed 或手动将这两条权限赋予 ADMIN / SUPER_ADMIN 角色。

### v4.3.2 共享层迁移

- **前端 `src/shared/`**：API client、CMS composables、主题/搜索/导航/焦点 trap/滚动锁、JSON-LD/日期工具迁入；`src/composables`、`src/utils`、`src/api` 下的同名旧文件是 **Nuxt 自动导入的桥（re-export shim），禁止删除**（`imports.dirs` 不含 `shared/`）。
- **后端 `libs/shared/`**：decorators/guards/helpers/interceptors/prisma/repositories/redis/metrics/types 迁入，业务统一 `@shared/*` 导入；旧路径 `@/common/*` re-export 已于 v4.3.3 移除。
- **Admin 工程化**：组件按 `ui/ai/page-config/order-manager` 分目录；`permission.config.js` 权限矩阵接入菜单/路由。

### v4.3.3 项目整理（复用沉淀 + 性能优化）

- **useDetailPage**：详情页数据加载统一抽象，已接入 news/blog/cases/products/solutions/careers/resources 7 个 `[slug]` 页；`fallbackMap` 支持 Ref/getter。marketplace 详情页为并行双请求 + 非 fatal 404，刻意不用。
- **后端 helpers**：`incrementViewCount(model, id)`（view-count.helper）；`getRevenueByDay/getRevenueTopApps`（revenue-stats.helper，groupBy 聚合，payment 与 analytics 共用）。
- **RoleService**：走 `BaseCrudRepository`（`role.repository.ts`），新增 model 的 CRUD 一律沿用该模式。
- **热点缓存**：blog/forum 公开列表 GET 已加 `@Cacheable(ttl 300s)` + 写操作 `@CacheEvict`；详情接口（`posts/:slug`、`topics/:id`）**不加缓存**（v4.3.4 起），保证 viewCount 逐请求精确自增。
- **工程化**：Token 校验唯一脚本 `scripts/validate-tokens-sync.js`（husky + CI 共用）；CI 强制 `validate:versions` 与 Admin 测试；发件人配置唯一 key 为 `SMTP_FROM`。

### v4.3.5 P0 闭环

- **Stripe Webhook**：`main.ts` 必须 `rawBody: true`（`@RawBody()` 依赖），改动前验签必失败——支付相关改动后需回归 webhook 测试。
- **限流默认值**：Joi 与 `forRootAsync` 工厂 fallback 必须保持一致（当前 500/100/10000/60/10000）。
- **CI deploy**：镜像 push 与 OSS 部署由 `vars.DOCKER_REGISTRY` / `vars.OSS_BUCKET` / `vars.OSS_ADMIN_BUCKET` 开关控制，配置即启用，勿硬编码 registry/bucket。
- **压测**：`npm run test:load`（`scripts/load-test.cjs`，零依赖）；方法与基线表见 `docs/load-testing.md`。

### v4.3.6 P1 闭环

- **缓存 single-flight**：`CacheInterceptor` 进程内防击穿（in-flight Promise 共享）；改动缓存行为必须回归 `cache.interceptor.spec.ts`。
- **搜索跳转**：`useSearch.selectItem` 按 `section` 分流——`/` 开头走 `router.push`，否则锚点滚动；新增搜索结果类型时保持该约定。
- **ChatBot actions**：`POST /ai/chat` 响应含 `actions`（`open_demo`/`open_contact`/`link`，规则意图识别、三语 label）；前端按 type 执行，新增动作类型需同步 `ChatBot.vue handleAction`。
- **定价页**：`/pricing`（i18n `pricing.*` ×3）；导航 fallback 在 `src/data/navigation/header.ts`（ZH/EN 两份，CMS 导航优先）。

### v4.4.0 P2 闭环

- **语义 RAG**：`AiEmbeddingService`（env `AI_EMBEDDING_ENABLED` + `OPENAI_API_KEY` 门控）；`AiEmbedding` 表用 raw SQL + `::vector` cast；`npm run ai:embed` 重建索引；语义结果优先、关键词补充、按标题去重。
- **实验平台**：`GET /experiments/:key/assign` 确定性分桶（md5(`key:sessionId`)），impression 幂等；前端 `useExperiment(key)`，参考 `CtaBannerSection` 接法（config 覆盖文案 + 点击 `trackConversion`）。
- **Admin TS**：核心层（api/stores/router/composables/directives/utils/config）已是严格 TS；views 仍为 JS（渐进策略），新增核心代码必须 TS。
- **多租户**：保持预留（`docs/adr/ADR-001-multi-tenancy.md`），禁止扩展 `workspaceStorage` 能力面。
- **HA 资产**：PG 流复制与 MinIO 纠删码 compose 在 `docker/`，运维手册 `docs/postgres-minio-ha.md`。

### v4.4.1 P3 闭环

- **CSS Module 拆分范式**：超 200 行时按**互不相交类族**拆为多文件（含各自 media/dark 规则），组件内用 **Proxy 回退链**合并（`new Proxy({}, { get: (_, k) => sBase[k] ?? sX[k] })`）——禁止按 @media 块横切（断开响应式覆盖）；禁止展开运算符合并（vitest 将 CSS Module mock 为不可枚举 Proxy，展开丢类名）。参照 `src/pages/marketplace/`。
- **NavBar 子组件**：`NavSearchBar/NavLangSwitcher/NavUserMenu` 与主文件共享 `NavBar.module.css`（同文件 import 哈希一致）。
- **SSE**：25s 命名事件 `heartbeat` 心跳；消费端只监听 `message`，新增事件类型须保持命名事件与 message 分离。

### v4.4.2 技术债清零（D-3~D-8）

- **页面 composable 必须显式 import**：Vitest 无 Nuxt 自动导入，页面中使用 `@/shared/composables/*` 一律显式 import（参照 blog/forum index）。
- **服务端分页**：用 `usePagedList`（page + watchSources + fallback + meta.total）；loadMore 场景才用 `useListPage`。
- **Admin typecheck 棘轮**：`npm run typecheck`，核心层（非 views）必须 0 error；改动某 view 顺带清零其错误。
- **E2E 弹窗等待**：统一 `toPass` 轮询（已打开则不重复触发），禁止单纯加大 timeout。
- **分群**：`usePersonalization()` segment 随实验 assign 入库；RUM 看板 `/web-vitals`（Admin）。
- **Vite 同名双文件**：`.js` 优先于 `.ts` 解析——迁移 TS 后必须删除旧 `.js`。

---

*TalentPro HR Portal · AGENTS.md v4.4.2*
