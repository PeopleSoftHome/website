# TalentPro — AI Agent 会话记忆存档

> **存档时间**: 2026-05-26 13:40 CST
> **当前阶段**: v2.5.0 全部完成 | 前端 113 测试通过 | 后端运行中
> **分支**: `feat/vue3-migration`

---

## 一、项目全景

### 1.1 项目结构

```
talentpro-v2/
├── src/                          # 前端 Vue3 SPA
│   ├── components/               # 全部组件（46 Vue SFCs）
│   │   ├── sections/             # 16 个 Section（含新增 ROI Calculator）
│   │   ├── ui/                   # 原子组件 + 弹窗（DemoModal/SearchModal/VideoModal/ContactModal/ChatBot/CookieBanner）
│   │   └── layout/               # NavBar + Footer
│   ├── composables/              # 12 个自定义 Composables
│   │   ├── useModal.js           # 弹窗状态机（含 API 提交）
│   │   ├── useCookieConsent.js   # Cookie 同意管理
│   │   ├── useABTest.js          # A/B 测试框架
│   │   ├── useRoiCalculator.js   # ROI 计算模型
│   │   ├── useAnalytics.js       # 数据埋点
│   │   ├── useApiData.js         # API 数据获取封装
│   │   └── useSearch.js          # 搜索逻辑
│   ├── stores/                   # provide/inject 状态管理（6 个）
│   ├── api/                      # Axios API 客户端 + 模块（cms/search/lead/blog/forum）
│   ├── i18n/                     # 多语言系统（zh-CN/en/zh-TW，~420 keys）
│   ├── data/                     # 静态数据文件 + 搜索索引
│   ├── pages/HomePage.vue        # 16 个 Section 组装（含 defineAsyncComponent 懒加载）
│   └── main.js                   # Vue3 入口
├── talentpro-backend/            # NestJS 后端
│   ├── apps/api/src/modules/     # 10+ 业务模块（Auth/User/Role/CMS/Lead/Blog/Forum/Search/Media/Analytics/System）
│   ├── prisma/schema.prisma      # 20+ 数据库模型
│   ├── docker/docker-compose.yml # 基础设施编排
│   └── scripts/seed.ts           # 数据种子
├── docs/
│   ├── backend-phase2-plan.md    # Phase2 后端规划
│   ├── project-plan.md           # v2.3~v2.5 产品规划
│   ├── project-spec.md           # 产品规格
│   └── prd.md                    # 需求文档
├── dist/                         # 前端构建产物（PWA + Prerender）
├── package.json                  # 前端依赖
└── vite.config.js                # Vite + PWA 配置
```

### 1.2 技术栈总览

| 层级 | 技术 | 状态 |
|------|------|------|
| 前端框架 | Vue 3.5 + Vite 5 | ✅ |
| 前端测试 | Vitest + @vue/test-utils | ✅ **113/113 通过** |
| 前端构建 | `npm run build` | ✅ 零警告 |
| 后端框架 | NestJS 11 + TypeScript 5 | ✅ 运行中 :4000 |
| ORM | Prisma 6 | ✅ 迁移完成 |
| 数据库 | PostgreSQL 16 | ✅ Docker 运行中 |
| 缓存 | Redis 7 | ✅ Docker 运行中 |
| 搜索 | Meilisearch v1.12 | ✅ Docker 运行中 |
| 对象存储 | MinIO | ✅ Docker 运行中 |
| PWA | vite-plugin-pwa + Workbox | ✅ 已配置 |

---

## 二、已完成工作

### 2.1 v2.3.0 — 体验增强（多语言 + 暗色模式 + 全局搜索）✅

- i18n 架构（3 语言，355+ keys）
- 暗色模式（CSS Token + data-theme）
- 全局搜索（Cmd+K，50 条索引，加权评分）

### 2.2 v2.3.1 — Hotfix（11 个 Bug 修复）✅

- 导航下拉、品牌滚动、Stats 后缀、产品矩阵白屏等
- ChatBot 完整实现（14 条 FAQ + 人工接入）

### 2.3 v2.4.0 — 转化提升 ✅

- **ROI 计算器**：5 参数模型，年度节省/ROI/回收期，柱状图对比
- **DemoModal 增强**：手机号格式化、聚焦滚动、进度文字、服务条款、成功摘要
- **智能产品推荐**：Step2 根据已选产品推荐关联 Chips
- **Cookie 同意横幅**：必要/分析/营销三级，偏好中心
- **A/B 测试框架**：哈希分桶，visitor ID 持久化

### 2.4 v2.5.0 — 性能与分发 ✅

- **数据埋点**：14+ 核心事件，Cookie 同意检查，`window.tp_analytics` 队列
- **动态 SEO**：语言切换同步 title/description/lang/hreflang
- **代码分割**：HomePage 全部非首屏 Section 使用 `defineAsyncComponent`
- **PWA**：vite-plugin-pwa 已配置（manifest、Service Worker、字体缓存）

### 2.5 前端 ↔ 后端 API 集成 ✅

- `src/api/client.js`：Axios 实例（auth interceptors）
- `src/api/cms.js`：产品/行业/证言/资源/导航/翻译
- `src/api/search.js`：全文搜索
- `src/api/lead.js`：预约演示提交
- ProductMatrix、IndustrySolution、Testimonial、Resource、Search、DemoModal 已接入 API

---

## 三、环境状态

### 3.1 后端服务

```
API 基地址    → http://localhost:4000/api/v1
Swagger 文档  → http://localhost:4000/api/docs
默认管理员    → admin@talentpro.com / admin123456
```

### 3.2 基础设施端口

| 服务 | 端口 | 状态 |
|------|------|------|
| PostgreSQL 16 | 5432 | ✅ |
| Redis 7 | 6379 | ✅ |
| Meilisearch | 7700 | ✅ |
| MinIO | 9000/9001 | ✅ |
| NestJS API | 4000 | ✅ |
| 前端 Dev | 3000 | ✅ |

### 3.3 常用命令

```bash
# 前端
cd talentpro-v2
npm run dev        # localhost:3000
npm run build      # dist/
npm run preview    # 预览生产构建
npm run test       # Vitest

# 后端
cd talentpro-backend
npm run docker:up
npm run start:dev  # :4000
npx prisma migrate dev
npx prisma db seed
```

---

## 四、下一步（新功能开发）

### 方向 A：Vue3 管理后台（Admin Dashboard）⭐ 推荐

创建 `talentpro-backend/apps/admin/` 运营后台：
- 技术栈: Vue3 + Vite + Element Plus / Ant Design Vue
- 登录页 + JWT 认证
- 仪表盘（线索统计/访问数据/内容概览）
- 各模块 CRUD 管理界面（对接后端 Swagger API）
- 权限控制（根据 RBAC 动态渲染菜单）

### 方向 B：完善后端剩余模块

- Blog/Forum 完整业务逻辑
- Media 上传/缩略图/MinIO
- Analytics 仪表盘 API
- System 设置/审计日志/定时任务

### 方向 C：前端质量加固

- E2E 测试（Playwright）
- 性能优化（字体子集化、图片懒加载）
- Lighthouse 评分优化

---

## 五、关键文件速查

| 文件 | 说明 |
|------|------|
| `AGENTS.md` | 项目规范与编码约定（必看） |
| `docs/project-plan.md` | v2.3~v2.5 完整规划 |
| `talentpro-backend/prisma/schema.prisma` | 数据库模型 |
| `src/App.vue` | 根组件（6 层 Provider + 全局 IO + 埋点） |
| `src/api/client.js` | Axios API 客户端 |
| `src/composables/useAnalytics.js` | 埋点系统 |
| `src/i18n/locales/zh-CN.json` | 主语言包 |

---

*本文件由 Kimi Code CLI 在会话结束时自动生成。*
