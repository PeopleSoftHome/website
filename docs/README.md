# TalentPro 文档中心

> 本文档说明 `docs/` 目录的组织方式与用途。所有活跃文档以 `AGENTS.md v4.2.0` 为权威规范源。

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
├── project-spec.md              # 产品规格与项目管理（待重写）
├── risk-register.md             # 风险登记册（待重写）
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
