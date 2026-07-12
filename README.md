# TalentPro HR Portal

> 面向中大型企业的一体化 HR SaaS 平台官方营销门户 + 管理后台 + NestJS 后端
> **当前版本**：v4.3.0
> **技术栈**：Nuxt 4.4.8 + Nitro 2.13.4 + Vue 3.5 + Vite 7.3.5 + Pinia + @nuxtjs/i18n + NestJS 11 + Prisma 6 + PostgreSQL + Redis

---

## 项目结构

```
talentpro-v2/
├── nuxt.config.ts                  # Nuxt 3 主配置（模块、SSR、Nitro、i18n、PWA）
├── package.json                    # Nuxt 3.4.6 + Vue 3.5 + Vite 7.3.5
├── src/                            # 前端营销门户（Nuxt 自动挂载）
│   ├── app.vue                     # 根组件：Provider + NuxtLayout + NuxtPage
│   ├── api/                        # 后端 API 封装（Axios + 统一响应拦截器）
│   ├── components/                 # 组件（layout / sections / ui）
│   ├── composables/                # 组合式函数（22 个，自动全局导入）
│   ├── data/                       # 静态业务数据（营销门户纯 JS 常量）
│   ├── i18n/                       # 多语言（zh / en / zh-TW，~772 keys）
│   ├── layouts/                    # Nuxt 布局
│   ├── middleware/                 # Nuxt 全局路由中间件（认证守卫 + Meta 同步）
│   ├── pages/                      # Nuxt 文件路由（自动生成的 20+ 条路由）
│   ├── stores/                     # Pinia 全局状态（自动全局导入）
│   ├── styles/                     # 全局 CSS + 动画
│   └── test/                       # Vitest 测试配置 + setup
├── e2e/                            # Playwright E2E 测试
├── public/                         # 静态资源（favicon、字体、PWA 图标等）
├── docker/
│   └── Dockerfile.frontend         # 多阶段构建（Nuxt SSG → Nginx）
├── talentpro-backend/              # NestJS 后端 API
│   ├── apps/api/src/               # 业务模块（auth / cms / blog / forum / marketplace / payment / cart ...）
│   ├── prisma/                     # Prisma Schema + Migrations
│   ├── docker/                     # Dockerfile + docker-compose
│   └── scripts/                    # 种子数据等
└── talentpro-admin/                # Vue 3 + Vite + Element Plus 管理后台
    ├── src/
    └── vite.config.js
```

---

## 快速开始

### 前端营销门户

```bash
cd talentpro-v2
npm install
npm run dev      # → http://localhost:8080（SPA 开发模式）
npm run build    # → .output/public/（SSG 静态生成）
npm run test:run # Vitest 单元测试
npx playwright test  # E2E 测试
```

### 后端 API

```bash
cd talentpro-backend
npm install
cp .env.example .env
npx prisma migrate dev
npx prisma generate
npm run start:dev   # → http://localhost:4000/api/v1
```

### Admin 后台

```bash
cd talentpro-admin
npm install
npm run dev      # → http://localhost:3457
```

### Docker 一键部署

```bash
docker-compose -f docker-compose.dev.yml up -d
# 拉起 postgres + redis + meilisearch + minio + api
```

**环境要求**：Node.js ≥ 18，npm ≥ 9，PostgreSQL ≥ 16，Redis ≥ 7

---

## 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| **使用教程** | `docs/getting-started.md` | **完整部署指南、环境配置、权限设置** |
| 产品需求文档 | `docs/prd.md` | 完整 PRD，含用户故事 |
| 项目规格 | `docs/project-spec.md` | 技术规格与验收标准 |
| 技术架构 | `docs/architecture.md` | 组件树、数据流、Composables 设计 |
| 设计系统 | `docs/design-system.md` | Token、色板、组件规范 |
| 项目计划 | `docs/project-plan.md` | 路线图、Sprint 计划 |
| 风险登记册 | `docs/risk-register.md` | 技术与业务风险 |
| 测试计划 | `docs/test-plan.md` | 测试策略与用例框架 |
| 变更记录 | `CHANGELOG.md` | 所有版本变更历史 |
| AI 助手指南 | `AGENTS.md` | 编码规范与项目约定 |

---

*TalentPro HR Portal · Nuxt 4.4.8 + Vue 3.5 + NestJS 11 + Prisma 6 · v4.3.0*
