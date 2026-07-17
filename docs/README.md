# TalentPro 文档中心

> 本文档说明 `docs/` 目录的组织方式与用途。所有活跃文档以 `AGENTS.md`（当前 v4.3.4）为权威规范源。

## 目录结构

```
docs/
├── README.md                    # 本文档
├── prd.md                       # 产品需求文档（活跃）
├── architecture.md              # 技术架构文档（活跃）
├── design-system.md             # 设计系统 / Design Tokens（活跃）
├── project-plan.md              # 产品路线图与迭代计划（活跃）
├── test-plan.md                 # 测试策略与自动化矩阵（活跃）
├── getting-started.md           # 本地开发、Docker 与部署入门（活跃）
├── project-spec.md              # 产品规格与项目管理（活跃）
├── risk-register.md             # 风险登记册（活跃）
├── environment-variables.md     # 三项目环境变量总表（活跃）
├── admin-components.md          # Admin 可复用组件 API（活跃）
├── reusable-assets.md           # 前后端可复用资产清单（活跃）
├── section-registry-sync.md     # Section Registry 同步指南（活跃）
├── i18n-guide.md                # 国际化贡献指南（活跃）
├── security.md                  # 安全白皮书（活跃）
├── redis-meilisearch-ha.md      # Redis / Meilisearch 高可用运维指南（活跃）
├── redis-bullmq-failover-drill.md # Redis-BullMQ 故障切换演练手册（活跃）
└── archive/                     # 历史归档（只读参考）
    ├── migrations/              # 技术迁移计划与状态
    ├── evaluations/             # 技术选型评估报告
    ├── audits/                  # 架构/技术债/配置审计报告
    └── sprints/                 # 历史 Sprint 计划与验收报告
```

## 活跃文档速查

| 文档 | 用途 | 维护频率 |
|------|------|---------|
| `prd.md` | 产品需求、用户故事、功能边界 | 每次大版本迭代 |
| `architecture.md` | 组件树、数据流、构建部署、技术决策 | 架构变更时 |
| `design-system.md` | Token、色板、字体、间距、动效、组件规范 | 设计系统变更时 |
| `project-plan.md` | 路线图、Sprint 规划、功能清单 | 每轮规划 |
| `test-plan.md` | 测试策略、覆盖率阈值、CI 矩阵 | 测试策略变更时 |
| `getting-started.md` | 环境搭建、本地开发、常见问题 | 构建/部署流程变更时 |
| `environment-variables.md` | 根/backend/Admin 环境变量总表 | 新增/变更 env 时 |
| `admin-components.md` | Admin 可复用组件 API | 新增/变更 Admin 组件时 |
| `reusable-assets.md` | 前后端可复用模块清单 | 提取/迁移 shared 层时 |
| `section-registry-sync.md` | Admin 与 Portal Section 同步规则 | 新增 Section 时 |
| `i18n-guide.md` | 新增 key、三语言对齐、Admin locale | 新增用户可见文本时 |
| `security.md` | 安全模型、认证、加密、CSP | 安全策略变更时 |
| `redis-meilisearch-ha.md` | Redis Sentinel / Meilisearch 高可用运维 | 基础设施变更时 |
| `redis-bullmq-failover-drill.md` | 故障切换演练步骤与验收 | 演练或队列配置变更时 |

## 归档文档

`archive/` 下的文档均为**历史决策参考**，不再主动维护。如需了解：
- 为何从 React 迁移到 Vue 3 / Nuxt 3 → `archive/migrations/`
- 为何选择 Nuxt SSG、放弃微前端、保留 Meilisearch → `archive/evaluations/`
- 历史架构诊断、技术债审计 → `archive/audits/`
- 已完成 Sprint 计划与验收 → `archive/sprints/`

## 新增文档规范

1. 新增活跃文档时，请同步更新本 README 的目录结构与速查表。
2. 新增一次性评估/审计/迁移文档时，评估完成后应及时移入 `archive/` 对应子目录。
3. 文档版本号应与 `AGENTS.md` 及 `package.json` 保持一致。
