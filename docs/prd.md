# TalentPro HR Portal — 产品需求文档 (PRD)

> **版本**：v4.3.0
> **状态**：已同步最新实现
> **最后更新**：2026-07-05
> **唯一真相来源**：本文档与实现代码必须保持同步

---

## 版本历史

| 版本 | 日期 | 作者 | 变更说明 |
|------|------|------|---------|
| v0.1.0 | 2026-03-15 | 项目经理 Agent | 文档框架初始化 |
| v3.0.0 | 2026-05-28 | 开发 Agent | 重写核心章节，同步 v3.0.0 全部功能 |
| v4.1.0 | 2026-06-15 | 开发 Agent | 新增 Marketplace / Payment / Cart，同步 Admin 能力，调整部署产物路径 |
| v4.3.0 | 2026-07-05 | 开发 Agent | Admin 配置智能化、AI 图片生成、门户 Hero 配置化、Marketplace 深化、站点配置/翻译/ChatBot 后端化、JWT Cookie-only、PII 加密扩展、审计日志、功能开关 |

---

## 1. 产品概述

TalentPro HR Portal 是面向中大型企业的一体化 HR SaaS 平台官方营销门户。它是一个以「预约演示」为核心转化目标的 B2B 企业级营销门户（Marketing Portal），由 15 个页面 Section 组成，覆盖产品展示、行业方案、客户证言、资源中心等完整营销链路。

- **产品定位**：B2B 企业级 HR SaaS 营销门户
- **核心转化目标**：预约产品演示（Demo Booking）
- **目标用户**：企业 HR、CHRO、IT 采购决策者
- **部署形态**：Nuxt SSG 静态站点（`.output/public/` 目录直推 CDN / Nginx / Vercel）

---

## 2. 核心功能清单

### 2.1 营销门户（前端 SPA）

15 个核心 Section 组成首页及二级页面：

| Section | 说明 |
|---------|------|
| Hero | 主视觉区，含 IDC 徽章、标题、CTA、Dashboard 装饰图 |
| 品牌滚动 | 客户 Logo 无限滚动（marquee） |
| 统计 | 6 大核心数据指标（数字递增动画） |
| 产品矩阵 | 4 Tab × 20 产品的矩阵展示 |
| AI Family | AI 专区（深色背景，玻璃态卡片） |
| 行业方案 | 5 大行业（制造/零售/互联网/央国企/金融）方案 |
| 客户证言 | 4 条证言轮播（自动播放 + hover 暂停） |
| Logo 墙 | 12 个客户 Logo + 6 行业筛选 |
| 为什么选我们 | 3 Tab 对比 + 6 项指标 |
| 资源中心 | 8 类资源（白皮书/案例/视频/报告等） |
| CTA 通栏 | 转化引导条 |
| 页脚 | 品牌信息 + 链接矩阵 |

二级页面体系：产品列表/详情、解决方案列表/详情、客户案例列表/详情、资源中心列表/详情、新闻列表/详情、招聘（校园/社会/职位详情）、了解我们（团队/合作伙伴/联系我们）、博客、论坛、个人中心。

### 2.2 博客系统

- 文章列表（分类 + 分页）
- 文章详情（Markdown 渲染）
- 分类与标签体系
- 评论系统（登录用户可评论）
- 文章搜索（Meilisearch 全文索引）

### 2.3 论坛系统

- 话题列表（分类 + 置顶/锁定状态）
- 话题详情 + 回复（分页）
- 话题置顶/锁定（管理员）
- 分类管理

### 2.4 用户认证

- 注册（邮箱/手机号）
- 登录（密码 + JWT）
- JWT Access Token（15m）+ Refresh Token（7d）轮转
- 角色权限控制（SUPER_ADMIN / ADMIN / USER / EDITOR）
- JWT 黑名单（logout 时失效 Token）
- reCAPTCHA 人机验证

### 2.5 线索管理（Lead）

- 预约演示表单（3 步骤弹窗）
- 线索状态流转（NEW → CONTACTED → QUALIFIED → CONVERTED / LOST）
- 跟进记录（Follow-up Notes）
- 线索 nurture 自动化（BullMQ 队列）

### 2.6 A/B 测试

- 实验管理（创建/编辑/启停）
- 流量分配（按权重分桶）
- 实验效果追踪（埋点联动）

### 2.7 数据分析

- 页面浏览（PV）统计
- 自定义事件埋点（14+ 核心事件）
- 转化漏斗分析
- 热力图/滚动深度（基础）
- Cookie 同意控制（偏好中心）

### 2.8 多语言

- 3 种语言：简体中文（zh）、English（en）、繁體中文（zh-TW）
- ~772 个 i18n key，支持 `{var}` 插值
- 语言偏好持久化（localStorage）

### 2.9 暗色模式

- 跟随系统 / 手动切换
- 主题偏好持久化（localStorage）
- 全部 Section 暗色覆盖（无硬编码色值残留）

### 2.10 全局搜索

- `Cmd+K` / `Ctrl+K` 全局触发
- 前端本地检索 50 条索引
- 加权评分（标题 > tags > 描述）
- 键盘导航（↑↓/Enter/Esc）

### 2.11 CMS 内容管理

- 首页 Section 配置化：`src/utils/sectionRegistry.ts` 注册 `defaultConfig` + `configSchema`，CMS 无配置时按默认顺序渲染
- 门户 Hero 配置化：支持 CMS 覆盖背景图、标题、副标题、CTA 文案、Dashboard 开关，未配置时回退 i18n
- Admin `SectionConfigForm.vue` 按 schema 动态渲染 `input`/`textarea`/`switch`/`image-upload`
- 页面 Section 排序、启停、批量更新
- 内容区块 CRUD + 通用内容类型 `/cms/content/:type`
- 发布/草稿状态
- 翻译后端化：`/cms/translations` 支持 Admin 管理并按 locale/context 覆盖前端 i18n

### 2.12 多租户 Workspace

- Workspace 隔离（数据级别）
- Prisma 扩展自动注入 workspaceId
- WorkspaceInterceptor 上下文传递
- 跨 Workspace 数据隔离

### 2.13 通知系统（SSE）

- Server-Sent Events 实时推送
- Redis Pub/Sub 支持多实例集群
- 用户级频道：`sse:notifications:{userId}`
- 全局仅 1 个 Redis psubscribe 连接

### 2.14 应用广场、支付与购物车（v4.1.0 → v4.3.0 深化）

- **应用广场（Marketplace）**：App 列表 / 分类 / 供应商 / 评分 / 精选推荐 / 应用安装（创建试用订阅）
- **购物车（Cart）**：Redis 存储，TTL 7 天，支持增删改查
- **支付（Payment）**：Stripe + 支付宝 收银台，Webhook/异步通知处理订单生命周期，支持发票申请
- **订阅管理**：Workspace 订阅列表、状态流转、Admin 订阅审核
- **收入分析**：`GET /payments/analytics/revenue` 按天聚合收入/订单/退款，Admin `RevenueAnalyticsView` 可视化
- **管理后台**：App / Category / Vendor / Review / Subscription / Order / RevenueAnalytics 管理

### 2.15 AI 能力（v4.3.0）

- **AI 内容生成**：`POST /ai/generate` 支持 `blog`/`product`/`seo`/`translate`/`moderate`，生成草稿供运营确认
- **AI 图片生成**：`POST /ai/generate-image`（ADMIN/SUPER_ADMIN，权限 `ai:generate-image`），DALL·E 生成后落入媒体库
- **Admin 配置助手**：`POST /ai/admin/chat`（权限 `ai:chat`），为 PageConfig / 内容运营提供文案与图片建议
- **ChatBot 后端化**：`ChatBotConfig` + `AiChatSession` 模型；`GET /system/chatbot-config` 公开配置；`POST /ai/chat` 多轮对话持久化

### 2.16 站点治理与安全（v4.3.0）

- **站点配置后端化**：`GET /system/config/public` 统一返回 `sitePhone`/`copyright`/`featureFlags`/`hotTags`/`socialLinks`/`siteTitle`/`siteDescription`/`recaptchaSiteKey`/`sentryDsn`
- **功能开关**：后端 Setting 维护 `featureFlags`，前端 `useFeatureFlag(key)` 按 key 灰度启停模块
- **JWT Cookie-only**：登录/刷新写入 httpOnly Cookie，前端 `withCredentials`，不再读写 `localStorage` token
- **PII 加密扩展**：AES-256-GCM Prisma 扩展，覆盖 User / DemoBooking / JobApplication / AppVendor / TeamMember 等 phone/email/contact/resumeUrl 字段
- **审计日志**：`AuditInterceptor` 全局记录已认证用户 POST/PATCH/PUT/DELETE，包含 oldValue/newValue，敏感字段自动脱敏

---

## 3. 用户角色

| 角色 | 权限范围 |
|------|---------|
| SUPER_ADMIN | 系统级全部权限：用户/角色/Workspace/系统配置/IP 黑白名单 |
| ADMIN | 内容管理：CMS/博客/论坛/线索/用户/分析数据 |
| EDITOR | 内容编辑：博客/论坛/新闻/案例/资源的增删改查 |
| USER | 普通用户：评论、论坛回复、个人中心、预约演示 |

---

## 4. 技术栈

### 4.1 前端营销门户

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Nuxt | 4.4.8 |
| 底层框架 | Vue | 3.5 |
| 构建工具 | Vite | 8.0.14 |
| 路由 | Nuxt 文件路由（自动生成）| — |
| 样式 | CSS Modules + CSS 自定义属性 | 原生 |
| 语言 | TypeScript | ES Module |

### 4.2 后端 API

| 类别 | 技术 | 版本 |
|------|------|------|
| 运行时 | Node.js | ≥ 20 |
| 框架 | NestJS | 11 |
| ORM | Prisma | 6 |
| 数据库 | PostgreSQL | 16 |
| 缓存 | Redis | 7 |
| 搜索 | Meilisearch | — |
| 存储 | MinIO / Local | — |
| 认证 | JWT + bcrypt + httpOnly Cookie | — |
| 队列 | BullMQ | — |
| 监控 | Sentry + nestjs-pino | — |

### 4.3 Admin 管理后台

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue | 3.5 |
| 构建工具 | Vite | 8 |
| 语言 | TypeScript | ES Module |
| UI 库 | Element Plus | 2.8 |
| 状态管理 | Pinia | 3.x |
| 路由 | Vue Router | 4.4 |

---

## 5. 非功能性需求

### 5.1 SEO

- 动态 title / meta description（博客/论坛详情页）
- JSON-LD 结构化数据（Organization + Product）
- Sitemap.xml + robots.txt
- 构建时 Prerender（预渲染静态 HTML）

### 5.2 PWA

- vite-plugin-pwa + Workbox
- Web App Manifest（192×192 / 512×512 图标）
- Service Worker（App Shell CacheFirst）
- 离线页面支持

### 5.3 性能

- Vue / Vue Router 代码分割（独立 vendor chunk）
- 非首屏组件 `defineAsyncComponent` 懒加载
- IntersectionObserver 驱动动画（无 scroll 监听）
- `prefers-reduced-motion` 禁用动效
- 图片懒加载 + `max-width: 100%`

### 5.4 安全

- PII 字段级加密（AES-256-GCM，Prisma 扩展自动处理 User/DemoBooking/JobApplication/AppVendor/TeamMember 的 phone/email/contact/resumeUrl）
- 全局限流（ThrottlerGuard，默认 500/min，认证 10/min，搜索 30/min）
- CORS 白名单控制
- Helmet 安全响应头 + CSP
- IP 黑白名单（IpFilterGuard）
- reCAPTCHA v3 后端校验
- JWT Cookie-only（httpOnly, sameSite lax, secure 生产）+ JWT 黑名单（logout 失效）
- 审计日志（AuditInterceptor，写操作全记录，oldValue/newValue + 敏感字段脱敏）
- Sentry 错误监控

---

## 6. 设计规范

*见 `docs/design-system.md`*

### 6.1 设计令牌（Design Tokens）

*见 `src/tokens/index.js`*

### 6.2 组件规范

*见 `docs/architecture.md` §8*

---

## 7. 技术架构

*见 `docs/architecture.md`*

---

## 8. 迭代计划

*见 `docs/project-plan.md` + `docs/sprints/`*

---

## 9. 测试策略

| 类型 | 工具 | 命令 |
|------|------|------|
| 前端单元测试 | Vitest | `npm run test` |
| 前端 E2E | Playwright | `npx playwright test` |
| 后端单元测试 | Jest | `cd talentpro-backend && npm run test` |
| 后端 E2E | Jest | `cd talentpro-backend && npm run test:e2e` |

---

*TalentPro HR Portal · PRD v4.3.0 · 2026-07-05*
