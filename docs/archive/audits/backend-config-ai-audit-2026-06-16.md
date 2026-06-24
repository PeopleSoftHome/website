# TalentPro 后台配置、前后端一致性与 AI 辅助内容生成审计报告

> **审计日期**：2026-06-16  
> **审计范围**：`talentpro-backend/apps/api/src` 后端配置体系、`src/` 营销门户、`talentpro-admin/src` Admin 后台  
> **审计目标**：从可维护性、可配置性、用户体验、技术架构、安全性等维度识别优化点与技术债；重点关注“可配置项应由后端统一驱动”以及“后端接入 AI 辅助内容生成”。  
> **交叉参考**：`docs/admin-backend-audit-report.md`、`docs/reports/tech-debt-and-defects-audit-2026-06-15.md`

---

## 一、执行摘要

当前 TalentPro 后端已经具备相当完整的配置与 CMS 能力（Setting、Navigation、Translation、CMS 全内容类型、RBAC/Permission、Workspace、Feature 开关所需的数据模型），但**前端对后端配置的 consumed 程度严重不足**，导致“后台可配、前台仍硬编码”的错位。同时，AI 模块目前仅支撑 ChatBot 对话，**未延伸到内容运营场景**，错失降低运营成本、提升运营效率的最大价值点。

### 关键结论

1. **前后端一致性是当前最大配置债**：`useCmsData` 的 `preferFallback: true` 策略让 CMS 数据被静态 JS 常量永久覆盖；导航、页脚、站点设置、翻译、产品/方案/案例详情仍使用 `src/data/*.js`。
2. **缺少运行时公共配置 API**：reCAPTCHA 站点密钥、Sentry DSN、功能开关等仍硬编码或构建时注入，无法热更新。
3. **AI 内容生成能力空白**：后端仅有 `/ai/chat`、`/ai/chat-stream`，无面向 Admin/CMS 的内容生成/翻译/SEO/审核端点。
4. **安全与多租户存在结构性风险**：JWT 双源（cookie vs localStorage）、Workspace 多租户 schema 与业务逻辑矛盾、PII 加密模型覆盖不全、审计日志信息过少。
5. **工程化配置不规范**：`.env.example` 缺项、部分模块直接读 `process.env`、限流兜底值强制覆盖 env、Pino 未启用。

### 优先级速览

| 优先级 | 数量 | 主题 |
|--------|------|------|
| 🔴 P0 | 6 | CMS 优先于静态 fallback、公共配置 API、ChatBot reCAPTCHA、Workspace 注册逻辑、产品/方案详情 CMS 化、Admin CMS CRUD 端点对齐 |
| 🟡 P1 | 12 | 导航/页脚/设置/翻译后端化、功能开关、AI 生成端点、httpOnly Cookie 统一、PII 加密扩展、审计日志增强、限流/缓存/日志调优 |
| 🟢 P2 | 8 | TypeScript 迁移、LLM 多提供商抽象、IPv6 IP 过滤、前端 ErrorBoundary、依赖漏洞、CSP 策略 |

---

## 修复状态（2026-06-16 迭代后）

| 优先级 | 审计项 | 状态 | 关键文件/说明 |
|--------|--------|------|---------------|
| P0 | 2.1 CMS 数据被静态 fallback 永久覆盖 | ✅ 已修复 | `src/composables/useCmsData.js` 改为 CMS 优先，仅当 CMS 为空/失败时回退 |
| P0 | 2.2 导航/页脚/站点设置硬编码 | ✅ 已修复 | 新增 `useNavigation()` / `useSiteConfig()` / `src/api/system.js`；NavBar/Footer/SearchModal 已接入 CMS 与公开配置 API；热门标签、社交链接、站点 title/description 均支持后端配置 |
| P0 | 2.3 产品/方案二级页面静态 JS | ✅ 已修复 | `products/[slug].vue`、`solutions/[slug].vue` 已接入 CMS API |
| P0 | 2.4 前端 env 前缀不匹配 | ✅ 已修复 | `nuxt.config.ts` 使用 `runtimeConfig.public.apiBaseUrl`；`NUXT_PUBLIC_API_BASE_URL` 为标准键 |
| P0 | 2.6 Admin CMS 管理页与后端端点不匹配 | ✅ 已修复 | `/cms/content/:type` 暴露完整 `POST/PATCH/DELETE` |
| P0 | 3.3 ChatBot reCAPTCHA Token 缺失 | ✅ 已修复 | `useChatBot.js` 在调用 `/ai/chat` 前获取 `recaptchaToken` |
| P0 | 4.2 Workspace 多租户注册逻辑矛盾 | ✅ 已修复 | 注册流程支持加入现有 Workspace；`Workspace.ownerId` 唯一约束移除 |
| P1 | 2.5 功能开关体系 | ✅ 已修复 | 后端 `GET /system/config/public` 返回 `featureFlags`；前端 `useFeatureFlag(key)` 已可用；Admin 新增 `/system/feature-flags` 管理页 |
| P1 | 2.7 翻译系统未接入后端 | ✅ 已修复 | 前端 `useCmsTranslations` 运行时合并 CMS 覆盖层；Admin 新增 `/cms/translations` 翻译管理 |
| P1 | 2.8 SEO/联系信息硬编码 | ✅ 已修复 | `sitePhone`、`copyright`、`siteTitle`、`siteDescription` 已后端化并通过 `useSiteConfig()` 消费；App.vue 动态同步默认 title/description |
| P1 | 3.1 AI 内容生成端点 | ✅ 已修复 | `POST /ai/generate` 上线；Admin Blog/News/Case/EmailTemplate/Products/Industries/Job/AppManager 接入 `AiAssistButton` |
| P1 | 3.4 ChatBot 配置与历史持久化 | ✅ 已修复 | 新增 `ChatBotConfig` / `AiChatSession` 模型；公开 `GET /system/chatbot-config`；`POST /ai/chat` 保存会话历史 |
| P1 | 3.5 RAG 范围窄/Prompt 硬编码 | ✅ 已修复 | RAG 扩展至 products/industries/ai_cards/resources/case_studies/news/pages/blog_posts；Prompt 从 Setting 读取 |
| P1 | 3.6 OpenAI 工程化 | ✅ 已修复 | 官方 `openai` SDK；`LlmProviderFactory` 多提供商抽象；参数从 Setting/env 读取 |
| P1 | 3.7 内容审核 AI 化 | ✅ 已修复 | `CommentModerationService` 叠加 OpenAI Moderation API |
| P1 | 4.1 JWT 双源不一致 | ✅ 已修复 | 前端 `withCredentials: true`；后端 `JwtStrategy` 支持 Cookie + Bearer |
| P1 | 4.3 PII 加密覆盖不全 | ✅ 已修复 | 扩展至 DownloadRecord / JobApplication / AppVendor / TeamMember |
| P1 | 4.4 审计日志信息过少 | ✅ 已修复 | `AuditInterceptor` 捕获 oldValue/newValue；手动写入端点仅限 SUPER_ADMIN |
| P1 | 4.5 IP 过滤 IPv6/CIDR | ✅ 已修复 | `IpFilterGuard` 使用 `ipaddr.js`；支持 `TRUSTED_PROXIES` |
| P1 | 4.6 权限注解不一致 | ✅ 已修复 | 所有写端点补齐 `@Permission()`；`PermissionGuard` 全局注册 |
| P1 | 4.7 reCAPTCHA 端点限流 | ✅ 已修复 | `/ai/*` 与 `/auth/*` 已叠加 `@Throttle`；Analytics 单独限流 |
| P1 | 5.1 环境变量管理不规范 | ✅ 已修复 | `.env.example` 补全；`ConfigService` 收敛 `process.env` |
| P1 | 5.2 限流配置债 | ✅ 已修复 | 限流值从 env 读取，不再强制覆盖 |
| P1 | 5.3 缓存与日志 | ✅ 已修复 | Pino 启用；缓存键环境隔离；Cache-Control 精确匹配 |
| P2 | 5.4 前端工程化 | ⚠️ 已启动 | `tsconfig.json` 已添加；ErrorBoundary / 字体加载 / 依赖漏洞已修复；Admin 入口 `main.ts` 与 `tsconfig.json` 已就位，其余 JS→TS 迁移按季度规划推进 |
| P2 | 4.6 权限注解（同 P1） | ✅ 已修复 | 所有写端点补齐 `@Permission()`；`PermissionGuard` 全局注册 |

**验证结果（最终全量回归，2026-06-16）**：
- 前端 lint：通过（0 errors）
- 前端 Vitest：27 套件 / 113 测试通过
- 前端 build：25 条路由预渲染成功
- Playwright chromium：57/57 通过
- Playwright firefox：57/57 通过
- Playwright webkit：57/57 通过
- Playwright Mobile Chrome / Mobile Safari：114/114 通过
- Playwright 全浏览器汇总：`285 passed (8.0m)`（workers=2, retries=1）
- 后端 lint：0 errors / 11 warnings
- 后端 Jest：17 套件 / 131 测试通过
- Admin build：通过
- 后端生产构建与运行时：`/health` 200，ChatBot `/ai/chat` 正常返回，公开配置 `/system/config/public` 返回新字段

---

## 二、前后端一致性与可配置性（重点）

### 2.1 CMS 数据被静态 fallback 永久覆盖（P0）

- **位置**：`src/composables/useCmsData.js:63-68`，以及所有首页 Section（ProductMatrix、IndustrySolution、Testimonial、Resource、AiFamily、WhyUs、LogoWall、Stats）
- **证据**：
  ```js
  const shouldUseFallback = () => {
    if (!options.fallbackKey) return false;
    if (!fallbackLoaded.value) return false;
    if (options.preferFallback && fallbackData.value.length > 0) return true; // 永远优先 fallback
    return items.value.length === 0;
  };
  ```
- **影响**：后端 CMS 与 Admin 内容管理页编辑后，用户侧永远看不到变化；CMS 投资被静态 JS 抵消。
- **建议**：
  - 生产环境默认 `preferFallback: false`，仅当 CMS 返回空或失败时才回退。
  - 增加远程开关 `site:cms_authoritative` 控制是否强制 CMS 优先。
  - 在 CMS 数据稳定后，逐步移除或构建时生成 `src/data/*.js`。

### 2.2 导航、页脚、站点设置仍硬编码（P0）

- **位置**：`src/components/layout/NavBar/NavBar.vue`、`Footer.vue`、`MobileMenu.vue`；后端 `cmsApi.getNavigation`、`/system/settings` 已就绪
- **证据**：`import { NAV_LINKS, FOOTER_LINKS, HOT_TAGS } from '@/data/navigation.js'`；`cmsApi.getNavigation` 无组件调用。
- **影响**：运营无法在不发版的情况下调整导航、页脚、联系电话、版权信息、热门标签、社交媒体链接。
- **建议**：
  - `NavBar` 调用 `cmsApi.getNavigation('header')`，`Footer` 调用 `cmsApi.getNavigation('footer')` 或公开 Settings。
  - 新增公开端点 `GET /system/config/public`，白名单返回 `recaptchaSiteKey`、`sentryDsn`、`sitePhone`、`copyright`、`featureFlags` 等。
  - Admin 补齐 Navigation、Site Settings 管理视图。

### 2.3 产品/方案/案例/新闻/招聘二级页面仍读静态 JS（P0/P1）

- **位置**：`src/pages/products/[slug].vue`、`solutions/[slug].vue`、`cases/index.vue`、`news/index.vue`、`careers/index.vue`、`about/team.vue`
- **证据**：`import { PRODUCT_MAP } from '@/data/products.js'`、`import { INDUSTRY_MAP } from '@/data/industries.js'`、`import { CASES } from '@/data/cases.js'` 等。
- **影响**：后端已提供完整 CRUD API，但二级页面不消费；内容更新必须改代码。
- **建议**：
  - 扩展 Prisma `Product`/`Industry` 模型字段（`scenarios`、`testimonial`、`specs`、`awards`、`roi`、`painPoints` 等）。
  - 二级页面统一使用 `useAsyncData + API`，静态数据仅作为构建时 fallback。
  - 应用广场 `marketplace/index.vue`、`marketplace/[slug].vue` 同样应优先调用后端 Marketplace API。

### 2.4 前端 env 前缀与 Nuxt 3 RuntimeConfig 不匹配（P0）

- **位置**：`src/api/baseUrl.js:1`、`nuxt.config.ts:13-19`
- **证据**：
  ```js
  export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
  ```
  而 Nuxt 3 runtimeConfig 使用 `NUXT_PUBLIC_API_BASE_URL`。
- **影响**：SSG 生产构建后 `VITE_*` 不会被自动暴露，`API_BASE_URL` 回退到 localhost，前端无法连接真实后端。
- **建议**：统一使用 `NUXT_PUBLIC_API_BASE_URL`，`baseUrl.js` 改为读取 `useRuntimeConfig().public.apiBaseUrl`；更新 `.env.example` 与 CI/CD。

### 2.5 无功能开关（Feature Flags）体系（P1）

- **位置**：全项目无 `FeatureFlag` 模型/表；`Setting` 表存在但未按 feature 使用
- **影响**：无法灰度发布、按租户启用功能、紧急关闭模块；AI/市场/支付仅依赖 env 是否存在。
- **建议**：
  - 新增 `FeatureFlag` 模型（key、enabled、targetAudience、expiresAt）或约定 `feature:*` Setting。
  - 公开 `GET /system/feature-flags`，前端实现 `useFeatureFlag(key)`。
  - Admin 提供功能开关管理 UI。

### 2.6 Admin CMS 管理页与后端端点不匹配（P0）

- **位置**：`talentpro-admin/src/components/CmsTable/`、`talentpro-backend/apps/api/src/modules/cms/cms.controller.ts`
- **证据**：
  - `CmsTable` 期望标准 REST：`POST /xxx`、`PATCH /xxx/:id`、`DELETE /xxx/:id`。
  - 后端 `cms.controller.ts` 中 Products/Industries/Testimonials/Stats/Logos 仅有 GET 和 `POST /product-tabs`/`POST /industries`（无 PATCH/DELETE）；通用内容 `/cms/content/:type` 只有 GET。
- **影响**：Admin 中大量 CMS 模块“有界面无可用接口”，点击编辑/删除会 404。
- **建议**：
  - 方案 A：补齐各 CMS 类型的 PATCH/DELETE（如 `/cms/industries/:id`）。
  - 方案 B：让 `/cms/content/:type` 暴露完整 POST/PATCH/DELETE，统一走 `CmsGenericService`，Admin 统一用 `/cms/content/:type`。

### 2.7 翻译系统未接入后端（P1）

- **位置**：`src/i18n/locales/*.json`；后端 `/cms/translations`
- **影响**：运营无法后台修改文案、无法做 A/B 文案实验；AI 翻译能力无法应用。
- **建议**：i18n 初始化后调用 `cmsApi.getTranslations(locale)` 合并 CMS 覆盖层；Admin 增加翻译管理视图。

### 2.8 站点级 SEO/联系信息硬编码（P1）

- **位置**：`src/i18n/locales/zh-CN.json`、`Footer.vue`、`ChatBot.vue`
- **证据**：`t('footer.copyright')`、`tel:4008888888`、社交链接等。
- **建议**：统一收归 `Setting` 表并通过公开配置端点下发。

---

## 三、AI 辅助内容生成（重点）

### 3.1 当前 AI 模块仅支持客服对话

- **位置**：`talentpro-backend/apps/api/src/modules/ai/ai.controller.ts`、`ai.service.ts`、`ai-openai.service.ts`
- **证据**：仅暴露 `POST /ai/chat` 与 `POST /ai/chat-stream`。
- **影响**：AI 能力未用于运营降本，内容生产仍完全依赖人工。
- **建议**：新增 Admin 权限保护的内容生成 Controller，例如：
  - `POST /ai/generate/blog-excerpt` — 根据正文生成摘要与 SEO meta
  - `POST /ai/generate/translation` — 多语言翻译（博客、产品、行业方案）
  - `POST /ai/generate/product-copy` — 根据关键词生成 tagline、卖点、特性
  - `POST /ai/generate/case-study` — 根据访谈笔记生成 challenge/solution/results/quote
  - `POST /ai/generate/email-template` — 根据主题生成邮件正文
  - `POST /ai/generate/jd` — 根据岗位 brief 生成职位描述
  - `POST /ai/rewrite` — 语气/风格改写

### 3.2 Admin 内容编辑页缺少 AI 辅助按钮（P1）

- **位置**：`talentpro-admin/src/views/BlogManagerView.vue`、`NewsManagerView.vue`、`CaseManagerView.vue`、`EmailTemplateView.vue` 等
- **建议**：
  - 在编辑器工具栏统一封装 `AiAssistButton` 组件。
  - 场景：生成 SEO 标题/描述、润色正文、一键翻译、生成摘要、生成邮件主题。
  - 生成结果作为草稿保存，运营确认后再发布，避免幻觉内容直接上线。

### 3.3 ChatBot 前端未传 reCAPTCHA Token，导致 AI 对话失效（P0）

- **位置**：`src/composables/useChatBot.js:102-105` vs `talentpro-backend/apps/api/src/modules/ai/ai.controller.ts:16-32`
- **证据**：前端 POST body 只有 `{ message, history: [] }`；后端接口使用 `RecaptchaGuard`，要求 `body.recaptchaToken`。
- **影响**：当 `RECAPTCHA_SECRET_KEY` 配置后，ChatBot 请求 400，直接降级到本地规则，AI 对话不可用。
- **建议**：在 `ChatBot.vue`/`useChatBot.js` 中参照 `AuthModal.vue`/`useModal.js` 生成 reCAPTCHA token 后调用 AI 接口。

### 3.4 ChatBot 配置与历史对话未持久化（P1）

- **位置**：`src/composables/useChatBot.js`、`src/components/ui/ChatBot/chatData.js`
- **证据**：本地关键词规则、快捷回复、FAQ 写死在前端；`history` 恒为空数组。
- **建议**：
  - 后端新增 `GET /system/chatbot-config` 返回 intents、keywords、quick replies、fallback copy。
  - 后端新增 `AiChatSession`/`Conversation` 模型持久化多轮对话。

### 3.5 RAG 范围窄且 Prompt 硬编码（P1）

- **位置**：`talentpro-backend/apps/api/src/modules/ai/ai-rag.service.ts:14-31`、`ai-prompt.service.ts:5-11`
- **证据**：仅检索 `products`、`blog_posts`；system prompt 为硬编码中文；`callOpenAI` 返回 `sources: []`。
- **建议**：
  - 扩展 RAG 索引至 `ai_cards`、`industries`、`resources`、`case_studies`、`news`、`pages`。
  - 将 system prompt 迁移到 `Setting` 表（如 `ai.base_prompt`），支持按 locale 覆盖。
  - 让模型返回引用 source slug，回填 `sources`。

### 3.6 OpenAI 集成缺乏工程化（P1）

- **位置**：`talentpro-backend/apps/api/src/modules/ai/ai-openai.service.ts`
- **证据**：使用裸 `fetch`，无 retry/timeout/usage logging；`temperature`、`max_tokens` 硬编码；无多提供商抽象。
- **建议**：
  - 迁移到官方 `openai` SDK 或封装 resilient HTTP client。
  - 模型参数（model、temperature、max_tokens、baseURL）从 `Setting`/env 读取，Admin 可配置。
  - 记录 token 使用量与成本；支持 Azure/OpenRouter/Anthropic 等提供商适配器。

### 3.7 内容审核未使用 AI（P1）

- **位置**：`talentpro-backend/apps/api/src/modules/blog/comment-moderation.service.ts`
- **证据**：仅基于敏感词 + 正则 + 长度启发式规则。
- **建议**：接入 OpenAI Moderation API 或本地分类器，对评论/论坛/评价进行语义风险评分，持久化 `aiRiskScore`/`aiFlags`。

---

## 四、安全性

### 4.1 JWT 双源不一致：后端设 httpOnly Cookie，前端读 localStorage（P1）

- **位置**：`src/api/client.js:17-25`、`src/stores/auth.pinia.js`；后端 `auth-token.service.ts:87-118`
- **影响**：XSS 可窃取 token；后端 cookie 安全设计被绕过。
- **建议**：统一为 httpOnly cookie + `withCredentials: true`，移除 localStorage token 存储；`JwtStrategy` 同时支持 cookie 提取。

### 4.2 Workspace 多租户 schema 与业务逻辑矛盾（P0）

- **位置**：`prisma/schema.prisma:108-146`、`auth-user.service.ts:25-69`、`workspace.service.ts:20-48`
- **证据**：`User` 已改为 `@@unique([email, workspaceId])` 且 `workspaceId` 可空，但注册流程强制创建新 Workspace 并把用户设为 owner；`Workspace.ownerId @unique` 阻止一人拥有多 Workspace。
- **影响**：“一个用户属于多个 Workspace” 的 SaaS 核心场景仍被阻塞。
- **建议**：重构注册流程支持邀请加入现有 Workspace；移除 `Workspace.ownerId @unique`；按 `workspaceId` 查询用户。

### 4.3 PII 字段加密覆盖不全（P1）

- **位置**：`talentpro-backend/apps/api/src/common/prisma/field-encryption.extension.ts:14-17`
- **证据**：仅加密 `User.phone/email`、`DemoBooking.phone/email`。
- **影响**：`DownloadRecord`、`JobApplication`、`AppVendor`、`TeamMember` 等 PII 字段明文存储。
- **建议**：扩展 `ENCRYPTED_FIELDS` 到所有 PII 列；现有明文数据通过后台任务回填。

### 4.4 审计日志信息过少且可手动创建（P1/P2）

- **位置**：`talentpro-backend/apps/api/src/common/interceptors/audit.interceptor.ts`、`system.controller.ts:80-88`
- **证据**：`newValue` 固定为 `{ status: 'success' }`，无 before/after 快照；`POST /system/audit-logs` 允许管理员写入任意审计记录。
- **建议**：捕获关键资源变更前后快照；移除或严格限制手动创建审计日志端点。

### 4.5 IP 过滤信任 `X-Forwarded-For` 且仅 IPv4（P1）

- **位置**：`talentpro-backend/apps/api/src/common/guards/ip-filter.guard.ts`
- **影响**：客户端可伪造 IP 绕过黑白名单；IPv6/CIDR 无法正确匹配。
- **建议**：配置可信代理列表 `TRUSTED_PROXIES`；使用 `ipaddr.js` 或 `net.BlockList` 支持 IPv6。

### 4.6 权限注解不一致（P2）

- **位置**：多个 Controller 写端点仅有 `@Roles`，缺少 `@Permission`
- **影响**：无法创建“仅内容编辑”等细粒度角色。
- **建议**：为所有变更端点补充 `@Permission()`；在 `AGENTS.md` 中维护权限字符串清单。

### 4.7 reCAPTCHA 与公开端点缺乏限流（P1）

- **位置**：`AnalyticsController` 跳过全部限流；`AiController`、`AuthController`、`LeadController` 虽有 RecaptchaGuard 但无专属限流
- **影响**：可被刷量消耗 Google reCAPTCHA 配额、产生大量事件/日志。
- **建议**：Analytics 单独设置宽松限流；含 reCAPTCHA 的端点叠加 `@Throttle`。

---

## 五、可维护性与工程化

### 5.1 环境变量管理不规范

- **`.env.example` 严重缺项**：`APP_PORT`、`APP_ENV`、`APP_FRONTEND_URL`、`APP_CORS_ORIGINS`、`JWT_ACCESS_EXPIRATION`、`JWT_REFRESH_EXPIRATION`、`MEILISEARCH_HOST`、`MEILISEARCH_API_KEY`、`SENTRY_DSN`、`OPENAI_MODEL`、`PII_ENCRYPTION_KEY` 等均未列出。
- **同一概念两个键**：`APP_FRONTEND_URL`（CORS/主流程）与 `FRONTEND_URL`（Payment 模块），`.env.example` 只记录后者。
- **部分模块绕过 ConfigService**：`main.ts` 直接读 `process.env.SENTRY_DSN`；`payment.service.ts` 直接读 `process.env.STRIPE_*`；`prisma.service.ts` 直接读 `process.env.PII_ENCRYPTION_KEY`。
- **ConfigModule Joi 校验缺漏**：未校验 `PII_ENCRYPTION_KEY`、`MEILISEARCH_*`、`JWT_ACCESS/REFRESH_EXPIRATION`、`APP_*`。

### 5.2 限流配置债

- 当前全局 `default`/`strict`/`search`/`lead` 被强制最低兜底值（2000/500/100000/100000），覆盖 `.env.example` 中的 500/100/60/5。
- AnalyticsController 完全跳过限流。
- **建议**：这是为修复 429 采取的临时兜底，后续应改用“全局宽松兜底 + 具体端点 @Throttle”的设计，并修正 `.env.example` 与文档。

### 5.3 缓存与日志

- **Cache-Control 拦截器路径匹配脆弱**：`path.includes('/products')` 会误命中私有路径；上传资源使用 `immutable` 但 URL 无 hash。
- **Redis 缓存键未按环境隔离**：开发/测试/生产共用 Redis 时会污染。
- **Pino 已安装未配置**：`nestjs-pino` 在依赖中，但 `main.ts` 仍用 NestJS 默认 Logger。
- **请求 ID 未写入日志上下文**：排障无法串联前后端日志。

### 5.4 前端工程化

- 前端无 TypeScript（333 文件纯 JS），长期重构风险高。
- 缺少 Vue ErrorBoundary，组件错误可能导致白屏。
- `npm audit` 前端存在 esbuild 高危漏洞。

---

## 六、优先级行动建议

### 🔴 P0 — 本周/下个 Sprint 必须处理

| # | 行动 | 关键文件 | 预期收益 |
|---|------|---------|---------|
| 1 | 关闭 `useCmsData` 的 `preferFallback: true` 默认行为，让 CMS 数据优先 | `src/composables/useCmsData.js`、各 Section | 后台 CMS 修改真正生效 |
| 2 | 补齐 CMS 通用内容类型的 POST/PATCH/DELETE，或对齐 Admin CmsTable 期望的端点 | `cms.controller.ts`、`cms-generic.service.ts` | Admin 能真正维护 CMS |
| 3 | 产品/方案二级页接入 CMS API，扩展 Prisma 字段 | `products/[slug].vue`、`solutions/[slug].vue`、`schema.prisma` | 内容运营不再依赖发版 |
| 4 | 修复 ChatBot reCAPTCHA token 缺失 | `src/composables/useChatBot.js` | AI 客服恢复正常 |
| 5 | 统一前端 API Base URL 为 `NUXT_PUBLIC_API_BASE_URL` | `src/api/baseUrl.js`、`nuxt.config.ts`、`.env.example` | SSG 生产构建正确连接后端 |
| 6 | 修复 Workspace 注册/创建逻辑与多租户 schema 一致 | `auth-user.service.ts`、`workspace.service.ts`、`schema.prisma` | 解锁一人多 Workspace |

### 🟡 P1 — 1-2 个 Sprint

| # | 行动 | 关键文件 |
|---|------|---------|
| 7 | 上线公开配置 API `GET /system/config/public` | `system.controller.ts`、前端 plugin |
| 8 | 导航/页脚/站点设置/翻译接入后端 | `NavBar.vue`、`Footer.vue`、i18n loader |
| 9 | 实现功能开关体系 `useFeatureFlag` | `schema.prisma`、新增 FeatureFlagService |
| 10 | 后端新增 AI 内容生成端点并接入 Admin | `ai.controller.ts`、Admin 各编辑页 |
| 11 | JWT 存储统一为 httpOnly Cookie | `client.js`、`auth.pinia.js`、`auth-token.service.ts` |
| 12 | 扩展 PII 加密到所有 PII 模型 | `field-encryption.extension.ts` |
| 13 | 审计日志捕获 before/after 快照 | `audit.interceptor.ts` |
| 14 | 修复 IP 过滤信任链与 IPv6 支持 | `ip-filter.guard.ts` |
| 15 | 配置 Pino 结构化日志与请求 ID | `main.ts`、日志中间件 |
| 16 | 补齐 `.env.example`、统一 `APP_FRONTEND_URL`、扩展 Joi 校验 | `app.module.ts`、`.env.example` |

### 🟢 P2 — 季度规划

| # | 行动 | 关键文件 |
|---|------|---------|
| 17 | 前端渐进式 TypeScript 迁移 | `src/api/`、`src/stores/`、`src/composables/` 优先 |
| 18 | LLM 多提供商抽象与模型参数后台化 | `ai-openai.service.ts`、新增 provider 接口 |
| 19 | AI 内容审核（Moderation API） | `comment-moderation.service.ts` |
| 20 | 缓存键环境隔离与 Cache-Control 精确匹配 | `cache.interceptor.ts`、`cache-control.interceptor.ts` |
| 21 | 前端 ErrorBoundary 与 CSP 策略 | `App.vue`、`main.ts` |
| 22 | 依赖漏洞治理与 CI `npm audit` 阈值 | `package.json`、GitHub Actions |

---

## 七、附录：关键文件速查

| 用途 | 文件 |
|------|------|
| 后端主配置/启动 | `talentpro-backend/apps/api/src/main.ts` |
| 后端 App 配置 | `talentpro-backend/apps/api/src/config/app.config.ts` |
| 后端模块注册/限流/Guard | `talentpro-backend/apps/api/src/app.module.ts` |
| 系统设置 API | `talentpro-backend/apps/api/src/modules/system/system.controller.ts` |
| CMS 内容 API | `talentpro-backend/apps/api/src/modules/cms/cms.controller.ts` |
| AI 模块 | `talentpro-backend/apps/api/src/modules/ai/ai.controller.ts`、`ai.service.ts`、`ai-openai.service.ts` |
| Prisma 扩展（PII/Workspace/软删） | `talentpro-backend/apps/api/src/common/prisma/*.extension.ts` |
| 前端 CMS 数据封装 | `src/composables/useCmsData.js`、`useCmsPageAsync.js` |
| 前端 API 地址 | `src/api/baseUrl.js`、`nuxt.config.ts` |
| Admin CMS 表格 | `talentpro-admin/src/components/CmsTable/` |

---

*报告生成时间：2026-06-16 | 本次审计未修改任何源代码*
