# TalentPro Phase 2 — 后端全栈与运营中台规划

> **版本**：v1.0.0 | **状态**：规划草案 | **日期**：2026-05-26
>
> **目标**：为 TalentPro 营销门户构建企业级后端 + 运营中台，实现从「静态展示」到「动态运营」的跃迁

---

## 目录

1. [执行摘要](#1-执行摘要)
2. [对标分析](#2-对标分析)
3. [功能模块全景](#3-功能模块全景)
4. [技术架构设计](#4-技术架构设计)
5. [数据库模型设计](#5-数据库模型设计)
6. [API 设计规范](#6-api-设计规范)
7. [多 Agent 协作体系](#7-多-agent-协作体系)
8. [实施路线图](#8-实施路线图)
9. [非功能需求](#9-非功能需求)
10. [风险登记与缓解](#10-风险登记与缓解)

---

## 1. 执行摘要

### 1.1 当前状态

Phase 1（前端重构）已完成：Vue 3 + Vite 单页应用，15 个 Section 全部静态数据驱动，零后端依赖。当前前端承载 **1,026 行**静态业务数据，分布在 11 个 JS 常量文件中。

### 1.2 核心痛点

| 痛点 | 影响 | 优先级 |
|------|------|--------|
| 预约演示表单是「假提交」 | 运营无法获取真实线索 | P0 |
| 所有内容（产品、案例、资源）需改代码上线 | 运营迭代周期以天计 | P0 |
| 无用户体系 | 无法沉淀访客、无法做个性化 | P0 |
| 无论坛/博客 | 缺乏内容生态与SEO流量入口 | P1 |
| 搜索纯前端本地检索 | 无法支持大数据量、无搜索分析 | P1 |
| 无数据分析 | 无法追踪转化漏斗 | P1 |

### 1.3 Phase 2 目标

> **一句话**：构建一个「**NestJS + PostgreSQL + Prisma**」企业级后端，配套「**Vue3 管理后台**」，让运营团队通过配置化方式运营门户网站，同时补齐用户系统、论坛、博客、数据分析等企业门户必备能力。

### 1.4 关键成果物 (Deliverables)

1. **Backend API** — RESTful API，Swagger 文档，覆盖全部业务模块
2. **Admin Dashboard** — Vue3 运营后台，支持所有内容的 CRUD
3. **用户中心** — 注册/登录/JWT/OAuth2/角色权限
4. **内容中台** — CMS（页面/产品/行业方案/资源/证言）+ 博客 + 论坛
5. **线索管理** — 预约演示真实提交 + 线索分配 + 跟进状态
6. **数据分析** — 访问统计 + 转化漏斗 + 热门搜索分析

---

## 2. 对标分析

### 2.1 顶尖企业门户参考

| 企业 | 核心特征 | 可借鉴点 |
|------|----------|----------|
| **Apple 企业官网** | 极简设计 + 强产品叙事 + 无缝预约体验 | 产品矩阵的可配置化展示、Hero 区的 A/B 测试支持 |
| **华为企业业务** | 行业解决方案深度定制 + 客户案例丰富 | 行业方案的参数化配置、客户证言的审批工作流 |
| **Google Cloud** | 技术博客生态 + 开发者社区 | 技术博客的 Markdown 编辑器、代码高亮、评论系统 |
| **Salesforce** | 强大的线索管理 + 资源中心 | 预约演示的智能路由、资源下载的 gating 策略 |
| **Workday** | 客户成功故事 + 分析师报告 | 白皮书/报告的版本管理、下载留资 |

### 2.2 开源方案参考

| 方案 | 类型 | 优点 | 缺点 | 本项目的借鉴方式 |
|------|------|------|------|------------------|
| **Strapi** | Headless CMS | 生态成熟、插件丰富 | 定制性受限、迁移困难 | 参考其 Content-Type 设计，不自用 |
| **Directus** | Headless CMS | 数据库优先、SQL原生 | 扩展学习成本高 | 参考其字段系统与权限模型 |
| **PayloadCMS** | Code-first CMS | TypeScript原生、Next.js友好 | 生态较新、社区小 | 参考其 Collection/Block 设计模式 |
| **Ghost** | 博客平台 | 写作体验极佳、SEO强 | 仅博客，非全功能CMS | 博客编辑器的写作体验 |
| **Discourse** | 论坛 | 现代论坛标杆、SEO友好 | Ruby栈、部署重 | 论坛的帖子/分类/信任等级模型 |

### 2.3 架构决策结论

**不自用现成 Headless CMS**，原因：
1. 需要深度定制（论坛、线索管理、多语言工作流）
2. 需要与前端 Vue3 SPA 深度集成（非 Next.js 生态）
3. 需要自建 Admin Dashboard 匹配品牌设计系统
4. 团队技术栈统一为 Node.js/TypeScript

**采用「自建 NestJS 后端 + 自建 Vue3 Admin」方案**，参考 Strapi/Directus 的 Content-Type 设计思想，但完全掌控。

---

## 3. 功能模块全景

### 3.1 模块地图

```
TalentPro Backend (Phase 2)
│
├── 🏠 门户内容中台 (CMS Core)
│   ├── 页面配置 (Page / Section)
│   ├── 产品矩阵 (Product / ProductTab)
│   ├── 行业方案 (Industry / IndustryFeature / Screenshot)
│   ├── 客户证言 (Testimonial)
│   ├── 资源中心 (Resource / ResourceCategory)
│   ├── Logo墙 (ClientLogo)
│   ├── 导航菜单 (Navigation / MenuItem)
│   ├── 页脚配置 (FooterConfig)
│   └── 多语言 (Translation / Locale)
│
├── 👤 用户与权限 (Identity)
│   ├── 用户管理 (User)
│   ├── 角色管理 (Role)
│   ├── 权限管理 (Permission)
│   ├── 注册/登录 (Auth / JWT / OAuth2)
│   ├── 个人中心 (Profile)
│   └── 用户行为 (UserActivity)
│
├── ✍️ 内容创作 (Content)
│   ├── 技术博客 (BlogPost / BlogCategory / BlogTag)
│   ├── 论坛 (ForumCategory / ForumTopic / ForumPost)
│   ├── 评论系统 (Comment)
│   └── 媒体库 (Media / FileStorage)
│
├── 🎯 线索与转化 (Lead)
│   ├── 预约演示 (DemoBooking)
│   ├── 线索分配 (LeadAssignment)
│   ├── 跟进记录 (FollowUp)
│   └── 资源下载留资 (DownloadGate)
│
├── 🔍 搜索与发现 (Search)
│   ├── 全文搜索 (Meilisearch)
│   ├── 搜索分析 (SearchAnalytics)
│   └── 热门搜索 (HotSearch)
│
├── 📊 数据分析 (Analytics)
│   ├── 页面访问 (PageView)
│   ├── 事件追踪 (EventTrack)
│   ├── 转化漏斗 (ConversionFunnel)
│   └── 实时看板 (RealtimeDashboard)
│
├── ⚙️ 系统管理 (System)
│   ├── 系统设置 (Setting)
│   ├── 邮件模板 (EmailTemplate)
│   ├── 审计日志 (AuditLog)
│   └── 计划任务 (ScheduledJob)
│
└── 🖥️ 管理后台 (Admin Dashboard)
    ├── 登录页
    ├── 仪表盘 (Dashboard)
    ├── 内容管理 (各模块 CRUD)
    ├── 用户管理
    ├── 线索管理
    ├── 数据分析
    └── 系统设置
```

### 3.2 功能优先级矩阵

| 模块 | P0 (MVP) | P1 (V1.1) | P2 (V1.2) |
|------|----------|-----------|-----------|
| CMS 核心 | ✅ 页面/产品/行业/资源/证言/导航 | 版本历史、审批流 | A/B 测试、个性化推荐 |
| 用户系统 | ✅ 注册/登录/JWT/RBAC | OAuth2/SSO、企业微信 | 多租户、组织架构同步 |
| 博客 | ✅ CRUD + Markdown + 分类/标签 | SEO分析、订阅推送 | 协作编辑、AI辅助写作 |
| 论坛 | ✅ 分类/主题/帖子/评论 | 信任等级、徽章系统 | 实时通知、积分商城 |
| 线索管理 | ✅ 预约提交 + 列表 + 状态 | 自动分配、邮件提醒 | CRM对接、智能评分 |
| 搜索 | ✅ Meilisearch全文搜索 | 搜索建议、纠错 | AI语义搜索 |
| 分析 | ✅ 页面访问 + 事件追踪 | 转化漏斗、热力图 | 用户画像、预测分析 |
| 媒体库 | ✅ 上传/管理/缩略图 | CDN集成、图片处理 | 视频转码 |
| Admin | ✅ 全模块CRUD仪表盘 | 权限细化到字段级 | 自定义报表、低代码配置 |

---

## 4. 技术架构设计

### 4.1 技术栈选型

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| **运行时** | Node.js | 22.x LTS | 与前端统一技术栈，生态丰富 |
| **框架** | NestJS | 11.x | 企业级、模块化、TypeScript原生、依赖注入 |
| **语言** | TypeScript | 5.7+ | 类型安全、IDE友好、团队统一 |
| **ORM** | Prisma | 6.x | 类型安全、自动迁移、查询优化、生态成熟 |
| **数据库** | PostgreSQL | 16 | 关系型、JSONB支持、全文搜索、成熟稳定 |
| **缓存** | Redis | 7.x | 会话、热点数据、限流、BullMQ任务队列 |
| **搜索引擎** | Meilisearch | 1.x | 轻量、毫秒级响应、中文支持好、自托管 |
| **文件存储** | MinIO (dev) / 阿里云OSS (prod) | latest | S3兼容、私有化部署 |
| **认证** | Passport + JWT + bcrypt | latest | Nest官方支持、策略灵活 |
| **邮件** | Nodemailer + 阿里云邮件推送 | latest | 国内送达率高 |
| **队列** | BullMQ (Redis) | latest | 延迟任务、重试机制、监控UI |
| **日志** | Pino | latest | 高性能、结构化日志、JSON输出 |
| **API文档** | Swagger/OpenAPI | latest | 自动生成、前端可直接生成Client |
| **测试** | Jest + Supertest | latest | Nest原生集成 |
| **管理后台** | Vue3 + Vite + Element Plus / Ant Design Vue | latest | 复用团队Vue3能力 |
| **容器** | Docker + Docker Compose | latest | 开发环境一致性 |

### 4.2 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              客户端层                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │  门户前端     │  │  管理后台     │  │  论坛/博客   │  │   移动端    │  │
│  │  (Vue3 SPA)  │  │  (Vue3 SPA)  │  │  (Vue3 SPA)  │  │  (H5/PWA)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘  │
└─────────┼─────────────────┼─────────────────┼─────────────────┼─────────┘
          │                 │                 │                 │
          └─────────────────┴────────┬────────┴─────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             网关层 (Nginx)                               │
│         静态资源托管 / 反向代理 / 负载均衡 / HTTPS / 限流                    │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                             API 服务层 (NestJS)                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Auth模块  │ │ CMS模块   │ │ Lead模块  │ │ Blog模块  │ │ Forum模块     │   │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├──────────┤ ├──────────────┤   │
│  │  Guard   │ │  Service │ │  Service │ │  Service │ │  Service     │   │
│  │  JWT     │ │  Controller│ │  Controller│ │  Controller│ │  Controller  │   │
│  │  RBAC    │ │  DTO/Validation│ │  DTO/Validation│ │  DTO/Validation│ │  DTO/Validation│   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │
│                                                                         │
│  横切关注点：Interceptor / Filter / Pipe / Middleware / Exception Handler   │
└─────────────────────────────────────────────────────────────────────────┘
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           ▼                         ▼                         ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   PostgreSQL    │      │     Redis       │      │   Meilisearch   │
│   (主数据库)      │      │   (缓存/会话)    │      │   (全文搜索)     │
│                 │      │                 │      │                 │
│  • 业务数据      │      │  • JWT黑名单     │      │  • 内容索引      │
│  • 关系模型      │      │  • 热点缓存      │      │  • 搜索分析      │
│  • JSONB字段    │      │  • 限流计数      │      │  • 同义词库      │
│  • 全文索引      │      │  • 任务队列      │      │                 │
└─────────────────┘      └─────────────────┘      └─────────────────┘
           │
           ▼
┌─────────────────┐
│  MinIO / OSS    │
│  (文件存储)      │
│                 │
│  • 图片/白皮书   │
│  • 缩略图       │
│  • CDN分发      │
└─────────────────┘
```

### 4.3 项目目录结构

```
talentpro-backend/
├── apps/
│   ├── api/                    # 主 API 服务 (NestJS)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # 认证授权
│   │   │   │   ├── user/       # 用户管理
│   │   │   │   ├── role/       # 角色权限
│   │   │   │   ├── cms/        # 内容中台
│   │   │   │   ├── blog/       # 博客系统
│   │   │   │   ├── forum/      # 论坛系统
│   │   │   │   ├── lead/       # 线索管理
│   │   │   │   ├── search/     # 搜索服务
│   │   │   │   ├── analytics/  # 数据分析
│   │   │   │   ├── media/      # 媒体库
│   │   │   │   └── system/     # 系统设置
│   │   │   ├── common/         # 通用工具、装饰器、拦截器
│   │   │   ├── config/         # 配置模块
│   │   │   └── main.ts         # 入口
│   │   └── test/               # E2E 测试
│   └── admin/                  # 管理后台 (Vue3 SPA)
│       ├── src/
│       ├── public/
│       └── vite.config.ts
├── packages/
│   ├── shared/                 # 共享类型、常量、工具
│   └── sdk/                    # 自动生成的 API Client
├── prisma/
│   ├── schema.prisma           # 数据库模型
│   └── migrations/             # 迁移文件
├── docker/
│   ├── docker-compose.yml      # 开发环境
│   └── Dockerfile              # 生产构建
└── scripts/
    └── seed.ts                 # 数据初始化
```

### 4.4 核心设计原则

1. **API First**：所有功能先定义 OpenAPI 规范，再实现
2. **Schema as Code**：数据库模型用 Prisma Schema 定义，版本化管理
3. **Event-Driven**：模块间通过 EventEmitter 解耦（如预约提交后触发邮件通知）
4. **CQRS for Analytics**：写操作走 PostgreSQL，分析查询走只读副本或物化视图
5. **Defensive Programming**：所有输入校验、权限检查、速率限制前置

---

## 5. 数据库模型设计

### 5.1 核心 ER 关系图

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │       │    Role     │       │ Permission  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │◄──────│ id (PK)     │
│ email       │  │    │ name        │       │ resource    │
│ password    │  │    │ description │       │ action      │
│ status      │  └────┤ users       │       │ description │
│ roleId (FK) │       └─────────────┘       └─────────────┘
└─────────────┘              │
                             │
                             ▼
                      ┌─────────────┐
                      │ RolePermission │
                      │ (junction)  │
                      └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Page      │       │  Section    │       │ Translation │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ id (PK)     │       │ id (PK)     │
│ slug        │       │ pageId (FK) │       │ locale      │
│ title       │       │ type        │       │ key         │
│ meta        │       │ sortOrder   │       │ value       │
│ isPublished │       │ config(JSON)│       │ context     │
└─────────────┘       └─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Product   │       │ ProductTab  │       │   Industry  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)     │       │ id (PK)     │
│ name        │  └───►│ label       │       │ name        │
│ tagline     │       │ sortOrder   │       │ label       │
│ icon        │       └─────────────┘       │ icon        │
│ tabId (FK)  │                             │ features[]  │
└─────────────┘                             └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ BlogPost    │       │ BlogCategory│       │    Tag      │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ title       │       │ name        │       │ name        │
│ slug        │       │ slug        │       │ slug        │
│ content     │       │ description │       └──────┬──────┘
│ status      │       └─────────────┘              │
│ authorId(FK)│                                    │
│ categoryId  │       ┌─────────────┐              │
│ tags        │──────►│ PostTag     │◄─────────────┘
└─────────────┘       │ (junction)  │
                      └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ForumCategory│       │ ForumTopic  │       │ ForumPost   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │◄──────│ id (PK)     │◄──────│ id (PK)     │
│ name        │       │ categoryId  │       │ topicId(FK) │
│ description │       │ authorId    │       │ authorId    │
│ sortOrder   │       │ title       │       │ content     │
└─────────────┘       │ isPinned    │       │ isSolution  │
                      │ viewCount   │       └─────────────┘
                      └─────────────┘

┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│DemoBooking  │       │   Media     │       │  Comment    │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)     │       │ id (PK)     │
│ name        │       │ filename    │       │ entityType  │
│ company     │       │ url         │       │ entityId    │
│ phone       │       │ mimeType    │       │ authorId    │
│ products[]  │       │ size        │       │ content     │
│ scale       │       │ width       │       │ parentId    │
│ status      │       │ height      │       │ status      │
│ assignedTo  │       └─────────────┘       └─────────────┘
└─────────────┘
```

### 5.2 Prisma Schema 核心模型（精简版）

```prisma
// ===== 用户与权限 =====
model User {
  id          String   @id @default(uuid())
  email       String   @unique
  password    String   // bcrypt hash
  name        String?
  avatar      String?
  phone       String?
  status      UserStatus @default(ACTIVE)
  roleId      String
  role        Role     @relation(fields: [roleId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  posts       BlogPost[]
  topics      ForumTopic[]
  replies     ForumPost[]
  comments    Comment[]
  bookings    DemoBooking[]
  activities  UserActivity[]
}

model Role {
  id          String   @id @default(uuid())
  name        String   @unique // SUPER_ADMIN / ADMIN / EDITOR / USER
  description String?
  permissions Permission[]
  users       User[]
}

model Permission {
  id        String   @id @default(uuid())
  resource  String   // e.g. "blog_post"
  action    String   // e.g. "create", "read", "update", "delete"
  roles     Role[]
}

// ===== CMS 核心 =====
model Page {
  id          String   @id @default(uuid())
  slug        String   @unique // "home", "product", "industry"
  title       String
  metaTitle   String?
  metaDesc    String?
  isPublished Boolean  @default(false)
  sections    Section[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Section {
  id        String   @id @default(uuid())
  pageId    String
  page      Page     @relation(fields: [pageId], references: [id])
  type      String   // "hero", "products", "testimonials", "resources"
  sortOrder Int      @default(0)
  config    Json     // 灵活的 JSON 配置
  isActive  Boolean  @default(true)
}

model Translation {
  id      String @id @default(uuid())
  locale  String // "zh-CN", "en", "zh-TW"
  key     String
  value   String @db.Text
  context String? // 用于分组，如 "hero", "nav"

  @@unique([locale, key])
  @@index([locale, context])
}

// ===== 产品 =====
model ProductTab {
  id       String    @id @default(uuid())
  label    String
  slug     String    @unique
  icon     String?   // icon name
  iconColor String?
  iconBg   String?
  sortOrder Int      @default(0)
  products Product[]
}

model Product {
  id          String     @id @default(uuid())
  tabId       String
  tab         ProductTab @relation(fields: [tabId], references: [id])
  slug        String     @unique
  name        String
  tagline     String
  description String?    @db.Text
  icon        String?
  features    Json?      // [{ title, desc }]
  isPublished Boolean    @default(true)
  sortOrder   Int        @default(0)
}

// ===== 行业方案 =====
model Industry {
  id          String   @id @default(uuid())
  slug        String   @unique
  label       String
  icon        String?
  features    Json?    // [{ badge, title, desc }]
  screenshot  Json?    // { type, title, data }
  isPublished Boolean  @default(true)
  sortOrder   Int      @default(0)
}

// ===== 博客 =====
model BlogCategory {
  id          String     @id @default(uuid())
  name        String
  slug        String     @unique
  description String?
  sortOrder   Int        @default(0)
  posts       BlogPost[]
}

model BlogPost {
  id          String       @id @default(uuid())
  title       String
  slug        String       @unique
  excerpt     String?
  content     String       @db.Text
  coverImage  String?
  status      PostStatus   @default(DRAFT)
  viewCount   Int          @default(0)
  publishedAt DateTime?
  authorId    String
  author      User         @relation(fields: [authorId], references: [id])
  categoryId  String
  category    BlogCategory @relation(fields: [categoryId], references: [id])
  tags        Tag[]
  comments    Comment[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([status, publishedAt])
  @@index([slug])
}

model Tag {
  id    String     @id @default(uuid())
  name  String     @unique
  slug  String     @unique
  posts BlogPost[]
}

// ===== 论坛 =====
model ForumCategory {
  id          String       @id @default(uuid())
  name        String
  description String?
  sortOrder   Int          @default(0)
  topics      ForumTopic[]
}

model ForumTopic {
  id          String        @id @default(uuid())
  categoryId  String
  category    ForumCategory @relation(fields: [categoryId], references: [id])
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
  title       String
  content     String        @db.Text
  isPinned    Boolean       @default(false)
  isLocked    Boolean       @default(false)
  viewCount   Int           @default(0)
  replyCount  Int           @default(0)
  posts       ForumPost[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model ForumPost {
  id         String     @id @default(uuid())
  topicId    String
  topic      ForumTopic @relation(fields: [topicId], references: [id])
  authorId   String
  author     User       @relation(fields: [authorId], references: [id])
  content    String     @db.Text
  isSolution Boolean    @default(false)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

// ===== 评论（通用） =====
model Comment {
  id         String   @id @default(uuid())
  entityType String   // "blog_post", "forum_topic", "resource"
  entityId   String
  authorId   String
  author     User     @relation(fields: [authorId], references: [id])
  content    String   @db.Text
  parentId   String?
  parent     Comment? @relation("CommentReplies", fields: [parentId], references: [id])
  replies    Comment[] @relation("CommentReplies")
  status     CommentStatus @default(PENDING)
  createdAt  DateTime @default(now())
}

// ===== 线索 =====
model DemoBooking {
  id          String      @id @default(uuid())
  name        String
  company     String
  phone       String
  email       String?
  products    String[]    // 感兴趣的模块
  scale       String      // 企业规模
  status      LeadStatus  @default(NEW)
  source      String      @default("website") // 来源渠道
  assignedTo  String?     // 分配给哪位销售
  notes       String?     @db.Text
  followUps   FollowUp[]
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model FollowUp {
  id          String   @id @default(uuid())
  bookingId   String
  booking     DemoBooking @relation(fields: [bookingId], references: [id])
  type        String   // "call", "email", "meeting", "note"
  content     String   @db.Text
  createdBy   String
  createdAt   DateTime @default(now())
}

// ===== 媒体 =====
model Media {
  id        String   @id @default(uuid())
  filename  String
  originalName String
  url       String
  mimeType  String
  size      Int
  width     Int?
  height    Int?
  alt       String?
  createdBy String
  createdAt DateTime @default(now())
}

// ===== 分析 =====
model PageView {
  id        String   @id @default(uuid())
  path      String
  referrer  String?
  userAgent String?
  ipAddress String?
  userId    String?
  sessionId String
  duration  Int?     // 停留时长(秒)
  createdAt DateTime @default(now())

  @@index([path, createdAt])
  @@index([sessionId])
}

model EventTrack {
  id        String   @id @default(uuid())
  event     String   // "click_cta", "open_modal", "download_resource"
  properties Json?   // { target: "demo_btn", section: "hero" }
  userId    String?
  sessionId String
  createdAt DateTime @default(now())

  @@index([event, createdAt])
}

// ===== 枚举 =====
enum UserStatus { ACTIVE INACTIVE BANNED PENDING }
enum PostStatus { DRAFT PUBLISHED ARCHIVED }
enum CommentStatus { PENDING APPROVED REJECTED }
enum LeadStatus { NEW CONTACTED QUALIFIED DEMOED NEGOTIATION WON LOST }
```

---

## 6. API 设计规范

### 6.1 路由命名规范

```
/api/v1/
├── POST   /auth/register          # 注册
├── POST   /auth/login             # 登录
├── POST   /auth/refresh           # 刷新 Token
├── POST   /auth/logout            # 登出
├── GET    /auth/me                # 当前用户
│
├── GET    /users                  # 用户列表 (Admin)
├── GET    /users/:id              # 用户详情
├── PATCH  /users/:id              # 更新用户
│
├── GET    /pages                  # 页面列表
├── GET    /pages/:slug            # 页面详情 (by slug)
├── POST   /pages                  # 创建页面 (Admin)
├── PATCH  /pages/:id              # 更新页面 (Admin)
│
├── GET    /products               # 产品列表
├── GET    /products/:slug         # 产品详情
├── GET    /product-tabs           # 产品标签页
│
├── GET    /industries             # 行业方案列表
├── GET    /industries/:slug       # 行业方案详情
│
├── GET    /blog-posts             # 博客文章列表
├── GET    /blog-posts/:slug       # 博客文章详情
├── GET    /blog-categories        # 博客分类
├── GET    /tags                   # 标签云
│
├── GET    /forum/categories       # 论坛分类
├── GET    /forum/topics           # 主题列表
├── POST   /forum/topics           # 发布主题
├── GET    /forum/topics/:id       # 主题详情
├── POST   /forum/topics/:id/posts # 回复帖子
│
├── GET    /testimonials           # 客户证言
├── GET    /resources              # 资源中心
├── GET    /resources/:slug/download # 下载资源
│
├── POST   /demo-bookings          # 提交预约演示
├── GET    /demo-bookings          # 线索列表 (Admin)
├── PATCH  /demo-bookings/:id      # 更新线索状态 (Admin)
│
├── GET    /search                 # 全文搜索 ?q=keyword&type=
├── GET    /search/hot             # 热门搜索
│
├── POST   /analytics/pageview     # 上报页面访问
├── POST   /analytics/event        # 上报事件
├── GET    /analytics/dashboard    # 仪表盘数据 (Admin)
│
├── POST   /media/upload           # 上传文件
├── GET    /media                  # 媒体列表
│
├── GET    /translations           # 获取多语言 ?locale=zh-CN
└── GET    /settings               # 系统设置
```

### 6.2 统一响应格式

```typescript
// 成功响应
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5
  }
}

// 错误响应
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "请求参数校验失败",
    "details": [
      { "field": "email", "message": "邮箱格式不正确" }
    ]
  }
}
```

### 6.3 分页规范

```
GET /api/v1/blog-posts?page=1&pageSize=20&sort=-publishedAt&filter[status]=published
```

| 参数 | 说明 |
|------|------|
| `page` | 页码，默认 1 |
| `pageSize` | 每页条数，默认 20，最大 100 |
| `sort` | 排序字段，`+field` 升序，`-field` 降序 |
| `filter[field]` | 字段过滤，支持 `eq`, `ne`, `gt`, `lt`, `contains`, `in` |
| `search` | 全文搜索关键词 |

---

## 7. 多 Agent 协作体系

### 7.1 Agent 角色定义

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         TalentPro Phase 2 Agent 体系                     │
│                                                                         │
│  ┌─────────────────┐                                                    │
│  │  PM Agent       │─── 需求确认、优先级排序、验收标准                    │
│  │  (产品经理)      │                                                    │
│  └────────┬────────┘                                                    │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐   │
│  │ Architect Agent │────►│   DevOps Agent  │     │  QA Agent       │   │
│  │  (架构师)        │     │  (部署运维)      │     │  (测试验收)      │   │
│  │                 │     │                 │     │                 │   │
│  │ • 数据库设计     │     │ • Docker Compose│     │ • 单元测试       │   │
│  │ • API 规范      │     │ • CI/CD 流水线   │     │ • E2E 测试       │   │
│  │ • 项目脚手架     │     │ • Nginx 配置    │     │ • API 测试       │   │
│  │ • 模块边界      │     │ • 环境搭建      │     │ • 性能测试       │   │
│  └────────┬────────┘     └─────────────────┘     └─────────────────┘   │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Feature Agents (并行开发)                      │   │
│  │                                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │ Auth Agent  │  │ CMS Agent   │  │ Lead Agent  │             │   │
│  │  │ 认证授权     │  │ 内容中台     │  │ 线索管理     │             │   │
│  │  │             │  │             │  │             │             │   │
│  │  │ • 注册/登录  │  │ • 页面/产品  │  │ • 预约表单   │             │   │
│  │  │ • JWT/RBAC  │  │ • 行业/资源  │  │ • 状态流转   │             │   │
│  │  │ • OAuth2    │  │ • 导航/多语言│  │ • 邮件通知   │             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  │                                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │   │
│  │  │ Blog Agent  │  │ Forum Agent │  │ Search Agent│             │   │
│  │  │ 博客系统     │  │ 论坛系统     │  │ 搜索服务     │             │   │
│  │  │             │  │             │  │             │             │   │
│  │  │ • Markdown  │  │ • 分类/主题  │  │ • Meilisearch│            │   │
│  │  │ • 分类/标签  │  │ • 帖子/回复  │  │ • 索引同步   │             │   │
│  │  │ • 评论系统   │  │ • 信任等级   │  │ • 搜索分析   │             │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘             │   │
│  │                                                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐                              │   │
│  │  │ Media Agent │  │ Analytics   │                              │   │
│  │  │ 媒体库       │  │ Agent       │                              │   │
│  │  │             │  │ 数据分析     │                              │   │
│  │  │ • 上传/管理  │  │             │                              │   │
│  │  │ • 缩略图生成 │  │ • 页面访问   │                              │   │
│  │  │ • CDN集成   │  │ • 转化漏斗   │                              │   │
│  │  └─────────────┘  └─────────────┘                              │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│           │                                                             │
│           ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │              Frontend Agents (前端集成层)                         │   │
│  │                                                                  │   │
│  │  ┌─────────────────┐        ┌─────────────────┐                │   │
│  │  │ Admin Agent     │        │ Fullstack Agent │                │   │
│  │  │ 运营后台前端     │◄──────►│ 前后端联调      │                │   │
│  │  │                 │        │                 │                │   │
│  │  │ • Vue3 Dashboard│        │ • API Client封装│                │   │
│  │  │ • 各模块CRUD页  │        │ • 前端数据接入  │                │   │
│  │  │ • 仪表盘/图表   │        │ • SSR/SSG优化   │                │   │
│  │  │ • 权限控制UI    │        │ • 类型同步      │                │   │
│  │  └─────────────────┘        └─────────────────┘                │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Agent 协作契约

| 契约项 | 规范 |
|--------|------|
| **接口契约** | 所有 Agent 遵循 Architect Agent 定义的 Prisma Schema + OpenAPI 规范 |
| **代码规范** | ESLint + Prettier + NestJS 官方风格 + 本项目的 `AGENTS.md` |
| **分支策略** | 每个 Agent 在 `feat/agent-{name}/{module}` 分支开发，PR 合并到 `feat/phase2-backend` |
| **测试门槛** | 模块单元测试覆盖率 ≥ 80%，E2E 测试覆盖核心流程 |
| **文档同步** | 代码变更必须同步更新 API 文档 (Swagger 自动生成) + 本规划文档 |
| **数据种子** | 每个模块提供 `seed.ts` 初始化数据，便于其他 Agent 联调 |

### 7.3 执行顺序建议

```
Wave 1 (Week 1-2): 基础设施
├── Architect Agent: 项目脚手架、Prisma Schema、Docker Compose
├── DevOps Agent: CI/CD、环境配置、Nginx
└── Auth Agent: 用户/角色/权限/登录注册

Wave 2 (Week 3-4): 核心业务
├── CMS Agent: 页面/产品/行业/资源/证言/导航/多语言
├── Lead Agent: 预约演示/线索管理/邮件通知
├── Media Agent: 文件上传/媒体库
└── Search Agent: Meilisearch 集成/索引同步

Wave 3 (Week 5-6): 内容生态
├── Blog Agent: 博客/分类/标签/评论
├── Forum Agent: 论坛/主题/帖子/回复
└── Analytics Agent: 访问统计/事件追踪

Wave 4 (Week 7-8): 运营后台 + 联调
├── Admin Agent: Vue3 管理后台全模块 CRUD
├── Fullstack Agent: API Client/前端数据接入
└── QA Agent: 全链路测试/性能优化/安全审计
```

---

## 8. 实施路线图

### 8.1 Sprint 计划

| Sprint | 周期 | 主题 | 核心交付 | Agent |
|--------|------|------|----------|-------|
| **S0** | Week 1 | **架构奠基** | Prisma Schema、NestJS 脚手架、Docker Compose、CI/CD 流水线 | Architect + DevOps |
| **S1** | Week 1-2 | **身份体系** | 注册/登录/JWT/RBAC/用户管理 API + 测试 | Auth |
| **S2** | Week 2-3 | **内容中台** | CMS核心（页面/产品/行业/资源/证言/导航）CRUD API + 多语言 | CMS |
| **S3** | Week 3-4 | **转化引擎** | 预约演示提交/线索管理/邮件通知/资源下载留资 API | Lead |
| **S4** | Week 4-5 | **搜索与媒体** | Meilisearch集成/媒体上传/缩略图/全文搜索API | Search + Media |
| **S5** | Week 5-6 | **内容生态** | 博客系统（Markdown/分类/标签）+ 论坛系统（主题/帖子/回复）| Blog + Forum |
| **S6** | Week 6-7 | **数据分析** | 页面访问统计/事件追踪/转化漏斗/仪表盘 API | Analytics |
| **S7** | Week 7-8 | **运营后台** | Vue3 Admin Dashboard 全模块 CRUD + 仪表盘可视化 | Admin |
| **S8** | Week 8-9 | **前后端联调** | API Client封装/前端数据流重构/SSG优化 | Fullstack |
| **S9** | Week 9-10 | **质量加固** | E2E测试/性能测试/安全审计/压力测试/文档补全 | QA |
| **S10**| Week 10 | **上线部署** | 生产环境部署/监控配置/数据迁移/灰度发布 | DevOps |

### 8.2 里程碑

| 里程碑 | 日期 | 验收标准 |
|--------|------|----------|
| **M1: API Ready** | Week 4 | 全部 P0 API 可调用，Swagger 文档完整，Postman Collection 可用 |
| **M2: Admin Ready** | Week 8 | 运营后台可独立管理所有 P0 内容，运营人员可上手操作 |
| **M3: Integration Done** | Week 9 | 前端不再读取任何静态数据文件，全部走 API |
| **M4: Go Live** | Week 10 | 生产环境部署，99.9%可用性SLA，监控告警就绪 |

---

## 9. 非功能需求

### 9.1 性能目标

| 指标 | 目标 | 测试方法 |
|------|------|----------|
| API 响应时间 (P95) | < 200ms | k6 压力测试 |
| 数据库查询 (P95) | < 50ms | Prisma Logger + 慢查询日志 |
| 搜索响应 | < 100ms | Meilisearch 内置监控 |
| 并发用户 | 5,000 QPS | k6 渐进式加压 |
| 前端首屏 | < 1.5s (SSR) | Lighthouse |

### 9.2 安全要求

- **认证**: JWT + Refresh Token 轮转，Access Token 15分钟过期
- **密码**: bcrypt 12轮，强制复杂度策略
- **传输**: 全站 HTTPS，HSTS 头部
- **API**: 速率限制 (100 req/min 匿名，1000 req/min 认证用户)
- **注入**: 所有输入 Prisma 参数化查询，禁止裸 SQL
- **上传**: 文件类型白名单，大小限制，病毒扫描 (ClamAV)
- **审计**: 所有 Admin 操作记录 AuditLog，保留 180 天
- **CORS**: 白名单机制，生产环境严格限制

### 9.3 可扩展性

- **水平扩展**: 无状态 API 服务，支持多实例 + 负载均衡
- **数据库**: 读写分离，只读副本用于分析查询
- **缓存**: Redis Cluster，热点数据 TTL 策略
- **文件存储**: 云对象存储 + CDN，支持无限扩展
- **搜索**: Meilisearch 支持分片和分布式部署

---

## 10. 风险登记与缓解

| 风险ID | 风险描述 | 可能性 | 影响 | 缓解措施 |
|--------|----------|--------|------|----------|
| R1 | Prisma 复杂查询性能不足 | 中 | 高 | 关键路径准备原生 SQL 备选；物化视图；Redis缓存 |
| R2 | Meilisearch 中文分词效果差 | 中 | 中 | 预留 Elasticsearch/OpenSearch 迁移路径；配置自定义分词器 |
| R3 | Agent 并行开发接口冲突 | 高 | 中 | Architect Agent 先行定义 Schema 和 DTO；每日接口同步会 |
| R4 | 前端数据接入改动量大 | 高 | 高 | Fullstack Agent 统一封装 API Client；保留 fallback 机制 |
| R5 | 管理后台开发周期长 | 中 | 高 | 采用 Element Plus Pro / Vben Admin 模板基座，复用组件 |
| R6 | 多语言内容迁移复杂 | 中 | 中 | 编写迁移脚本，保留静态 JSON 作为 fallback，灰度切换 |
| R7 | 上线后数据迁移失败 | 低 | 高 | 备份策略；迁移脚本在 staging 环境跑 3 轮；回滚方案 |

---

## 附录

### A. 参考资源

- [NestJS Official Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Meilisearch Docs](https://www.meilisearch.com/docs)
- [BullMQ Docs](https://docs.bullmq.io/)
- [Apple Enterprise](https://www.apple.com/business/)
- [Huawei Enterprise](https://e.huawei.com/)
- [Google Cloud Blog](https://cloud.google.com/blog)

### B. 术语表

| 术语 | 说明 |
|------|------|
| CMS | Content Management System，内容管理系统 |
| Headless CMS | 无头CMS，仅提供API的内容管理后台 |
| RBAC | Role-Based Access Control，基于角色的访问控制 |
| CQRS | Command Query Responsibility Segregation，命令查询职责分离 |
| SSR | Server-Side Rendering，服务端渲染 |
| SSG | Static Site Generation，静态站点生成 |
| SEO | Search Engine Optimization，搜索引擎优化 |
| CTA | Call To Action，行动号召按钮 |
| Lead | 销售线索 |
| QPS | Queries Per Second，每秒查询数 |
