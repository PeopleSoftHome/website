# TalentPro HR Portal 项目整理计划 v4.4.2

> **版本**：v4.4.2  
> **日期**：2026-08-15  
> **目标**：知识沉淀、目录清理、文档整理、性能优化  
> **约束**：不影响现有功能；每阶段可回滚。

---

## 1. 背景

经过 v4.3.x ~ v4.4.2 的多轮迭代，项目已沉淀出前后端双共享层（`src/shared/`、`libs/shared/`），Admin 核心层已完成 TS 迁移，技术债基本清零。本次整理旨在：

1. 把可复用代码与架构进一步显性化；
2. 清理过期文档与归档历史版本资料；
3. 优化构建配置与静态资源；
4. 调整过于严格的行数规范，使其回归“指导性约束”。

---

## 2. 整理范围

| 领域 | 动作 |
|------|------|
| `docs/` | 归档过时评估文档、更新可复用资产/section registry 路径、放宽 AGENTS.md 行数规范 |
| `src/shared/` | 补齐聚合导出（`api/index.ts`、`cms/index.ts`），统一对外接口 |
| `src/api/`、`src/composables/`、`src/utils/` | 保留 Nuxt 自动导入 shim，仅做内部引用归一 |
| `nuxt.config.ts` | 新增 `vendor-markdown` chunk，减少首屏加载 |
| `public/` | 只读审计大文件，输出优化建议 |
| `talentpro-backend/libs/shared/` | 补充 README，说明目录职责 |

---

## 3. 阶段与验收

### 阶段 0：环境准备

- [x] 安装三个子项目依赖
- [x] 创建 `cleanup/v4.4.2-project-tidy` 分支
- [x] 建立空基线 commit

### 阶段 1：文档与规范

- [ ] 将 `docs/project-evaluation-v4.3.4.md` 归档到 `docs/archive/audits/`
- [ ] 更新 `docs/reusable-assets.md` 版本与 Admin 组件路径
- [ ] 更新 `docs/section-registry-sync.md` 版本
- [ ] 放宽 `AGENTS.md` §4.2 行数规范
- [ ] 更新 `README.md` 文档索引
- [ ] 提交 commit

### 阶段 2：共享层聚合

- [ ] 新建/更新 `src/shared/api/index.ts`
- [ ] 新建 `src/shared/cms/index.ts`
- [ ] 核对 `src/shared/composables/index.ts` 与 `src/shared/utils/index.ts`
- [ ] 内部引用归一到 `@/shared/*`（不删除 shim）
- [ ] 提交 commit

### 阶段 3：构建性能优化

- [ ] 在 `nuxt.config.ts` 增加 `vendor-markdown` manual chunk
- [ ] 审计 `public/` 下大于 200KB 的资源
- [ ] 提交 commit

### 阶段 4：Admin/后端文档修正

- [ ] 修正 `docs/admin-components.md` 中 Admin 组件路径
- [ ] 新增/更新 `talentpro-backend/libs/shared/README.md`
- [ ] 复核 `docs/architecture.md` 中 `@/common/*` 引用
- [ ] 提交 commit

### 阶段 5：验证与报告

- [ ] 前端 lint/test/build 全绿
- [ ] Admin lint/test/typecheck/build 全绿
- [ ] 后端 lint/test/build 全绿
- [ ] 生成 `docs/project-cleanup-report-v4.4.2.md`
- [ ] 打 tag `v4.4.2-cleanup`

---

## 4. 行数规范调整

原 `AGENTS.md` §4.2 对 200 行文件强制拆分，实践中造成过度拆分。调整后：

| 类型 | 建议上限 | 强制拆分线 |
|------|----------|-----------|
| Section 组件 | 250 行 | 600 行 |
| 子组件 | 150 行 | 400 行 |
| UI 原子组件 | 150 行 | 300 行 |
| CSS Module | 400 行 | 600 行 |
| Hook / Composable | 150 行 | 300 行 |

豁免项：SVG Sprite、复杂分步表单、状态机密集 composable、静态 fallback 数据文件。

---

## 5. 回滚策略

- 每个阶段独立 commit，失败时 `git reset --hard <阶段起始 commit>`。
- `master` 分支始终不被直接修改。
- 所有改动在 `cleanup/v4.4.2-project-tidy` 分支，可安全合并或丢弃。

---

*TalentPro HR Portal · 项目整理计划 v4.4.2*
