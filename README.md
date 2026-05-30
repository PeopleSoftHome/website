# TalentPro HR Portal

> 面向中大型企业的一体化 HR SaaS 平台官方营销门户 + 管理后台 + NestJS 后端
> **当前版本**：v3.0.0
> **技术栈**：Vue 3.5 + Vite 8 + CSS Modules + Vue Router 5 + NestJS 11 + Prisma 6 + PostgreSQL + Redis

---

## 项目结构

```
talentpro-v2/
├── index.html                    # 入口 HTML
├── package.json                  # Vue 3.5 + Vite 5
├── vite.config.js                # 前端构建配置
├── src/                          # 前端营销门户
│   ├── main.js                   # Vue 挂载入口
│   ├── App.vue                   # 根组件
│   ├── api/                      # 后端 API 封装
│   ├── components/               # 组件（layout / sections / ui）
│   ├── composables/              # 组合式函数
│   ├── data/                     # 静态业务数据
│   ├── i18n/                     # 多语言（zh / en / zh-TW）
│   ├── pages/                    # 页面（Home / Blog / Forum）
│   ├── router/                   # Vue Router
│   ├── stores/                   # 全局状态
│   ├── styles/                   # 全局 CSS + 动画
│   └── test/                     # Vitest 测试
├── e2e/                          # Playwright E2E 测试
├── talentpro-backend/            # NestJS 后端 API
│   ├── apps/api/src/             # 业务模块（auth / cms / blog / forum / ai ...）
│   ├── prisma/                   # Prisma Schema + Migrations
│   ├── docker/                   # Dockerfile + docker-compose
│   └── scripts/                  # 备份脚本等
└── talentpro-admin/              # Vue 3 Admin 后台
    ├── src/
    └── vite.config.js
```

---

## 快速开始

### 前端营销门户

```bash
cd talentpro-v2
npm install
npm run dev      # → http://localhost:3000
npm run build    # → dist/
npm run test     # Vitest 单元测试
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
cd talentpro-backend/docker
docker-compose up -d   # 拉起 postgres + redis + meilisearch + minio + api
```

**环境要求**：Node.js ≥ 18，npm ≥ 9，PostgreSQL ≥ 16，Redis ≥ 7

---

## 文档索引

| 文档 | 路径 | 说明 |
|------|------|------|
| **使用教程** | `docs/getting-started.md` | **完整部署指南、环境配置、权限设置** |
| 修复报告 | `docs/v3.0.0-fix-report.md` | v3.0.0 全维度修复报告 |
| 产品需求文档 | `docs/prd.md` | 完整 PRD，含用户故事 |
| 项目规格 | `docs/project-spec.md` | 技术规格与验收标准 |
| 技术架构 | `docs/architecture.md` | 组件树、数据流、Hook 设计 |
| 设计系统 | `docs/design-system.md` | Token、色板、组件规范 |
| 项目计划 | `docs/project-plan.md` | 路线图、Sprint 计划 |
| 风险登记册 | `docs/risk-register.md` | 技术与业务风险 |
| 测试计划 | `docs/test-plan.md` | 测试策略与用例框架 |
| 变更记录 | `CHANGELOG.md` | 所有版本变更历史 |
| AI 助手指南 | `AGENTS.md` | 编码规范与项目约定 |

---

*TalentPro HR Portal · Vue 3.5 + NestJS 11 + Prisma 6 · v3.0.0*
