# TalentPro Backend

> TalentPro HR Portal — 企业级后端 API 与运营中台

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | NestJS 11 + TypeScript 5 |
| ORM | Prisma 6 |
| 数据库 | PostgreSQL 16 |
| 缓存 | Redis 7 |
| 搜索 | Meilisearch |
| 认证 | JWT + Passport + bcrypt |
| 文档 | Swagger / OpenAPI |

## 快速开始

### 1. 启动基础设施（Docker）

```bash
npm run docker:up
```

这将启动 PostgreSQL、Redis、Meilisearch、MinIO。

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.example .env
# 按需修改 .env 中的配置
```

### 4. 数据库迁移与种子

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. 启动开发服务器

```bash
npm run start:dev
```

服务启动后：
- API: http://localhost:4000/api/v1
- Swagger 文档: http://localhost:4000/api/docs

## 项目结构

```
talentpro-backend/
├── apps/api/src/
│   ├── modules/
│   │   ├── auth/         # 认证授权
│   │   ├── user/         # 用户管理
│   │   ├── role/         # 角色权限
│   │   ├── cms/          # 内容中台
│   │   ├── lead/         # 线索管理
│   │   ├── blog/         # 博客系统
│   │   ├── forum/        # 论坛系统
│   │   ├── search/       # 全文搜索
│   │   ├── media/        # 媒体库
│   │   ├── analytics/    # 数据分析
│   │   └── system/       # 系统设置
│   ├── common/           # 通用工具、拦截器、过滤器
│   └── config/           # 配置模块
├── prisma/
│   └── schema.prisma     # 数据库模型
├── docker/
│   └── docker-compose.yml
└── scripts/
    └── seed.ts           # 数据种子
```

## 默认账号

| 邮箱 | 密码 | 角色 |
|------|------|------|
| admin@talentpro.com | admin123456 | SUPER_ADMIN |

## API 模块概览

| 模块 | 端点前缀 | 公开接口 |
|------|----------|----------|
| Auth | `/api/v1/auth` | register, login, refresh |
| Users | `/api/v1/users` | — |
| Roles | `/api/v1/roles` | — |
| CMS | `/api/v1/cms` | pages, products, industries, testimonials, resources, navigations, translations |
| Leads | `/api/v1/demo-bookings` | POST (提交预约) |
| Blog | `/api/v1/blog-posts` | list, detail |
| Forum | `/api/v1/forum` | list, detail |
| Search | `/api/v1/search` | search, hot |

## 多 Agent 协作

本项目按照 `docs/backend-phase2-plan.md` 的规划，由多个 Agent 协作完成：

1. **Architect Agent** — 项目脚手架、数据库设计
2. **Auth Agent** — 认证授权
3. **CMS Agent** — 内容中台
4. **Lead Agent** — 线索管理
5. **Blog/Forum Agent** — 博客与论坛
6. **Admin Agent** — 运营后台
7. **Fullstack Agent** — 前后端联调

## 许可证

UNLICENSED
