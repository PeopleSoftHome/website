# Sprint 24 计划 — v3.4.0 测试覆盖与工程化打磨

> **状态**: 📋 执行中  
> **周期**: 1 周（建议 2026-06-29 ~ 2026-07-06）  
> **目标**: 补齐后端关键模块测试，提升前端工程化质量  
> **涉及模块**: 后端测试 / 前端工程化 / i18n

---

## 一、背景与动机

v3.3.0 完成后，项目功能和技术债已全部清零。当前测试覆盖：

| 层级 | 现状 | 目标 |
|------|------|------|
| 后端单元测试 | 7 个模块 / 47 测试 | 10+ 模块 / 70+ 测试 |
| 前端单元测试 | 28 文件 / 117 测试 | 维持 |
| E2E | 25 测试 | 维持 |
| 工程化 | 无 pre-commit hooks | 添加 husky + lint-staged |

---

## 二、任务清单

### 模块 A：后端关键模块测试（P1）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T24-A1 | `media.service.spec.ts` | CRUD + upload + delete | 1.5h |
| T24-A2 | `workspace.service.spec.ts` | create + find + update | 1.5h |
| T24-A3 | `analytics.service.spec.ts` | trackPageView + getDashboardStats | 1h |

### 模块 B：前端工程化（P1）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T24-B1 | 安装 husky + lint-staged | pre-commit 时自动 lint + format | 0.5h |
| T24-B2 | `.husky/pre-commit` 配置 | `npm run lint` + `cd talentpro-backend && npm run lint` | 0.5h |

### 模块 C：i18n 完善（P2）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T24-C1 | `api/client.js` 错误消息提取 | "网络请求失败" / "无刷新令牌" → i18n key | 1h |
| T24-C2 | `api/client.js` 注释国际化 | 中文注释 → 英文（保持代码库一致性） | 0.5h |

---

## 三、验收标准

- [ ] 后端新增 3 个 Service 测试套件，全部通过
- [ ] 后端总测试 ≥ 70 个
- [ ] `git commit` 时自动运行前后端 lint
- [ ] `npm run test:run` 117/117 通过
- [ ] `cd talentpro-backend && npm run test` 全部通过

---

*项目经理 Agent 产出 | Sprint 24 计划 | 2026-05-29*
