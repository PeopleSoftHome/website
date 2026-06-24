# Sprint 22 计划 — v3.2.0 性能极致化与文档治理

> **状态**: 📋 执行中  
> **周期**: 1 周（建议 2026-06-15 ~ 2026-06-22）  
> **目标**: 前端性能冲击 Lighthouse 95+，补齐文档债务，清理最后的技术债  
> **涉及模块**: 图片优化 / 文档 / Prisma 迁移

---

## 一、背景与动机

Sprint 21 完成后，剩余未关闭项：

| ID | 待办 | 优先级 | 状态 |
|----|------|--------|------|
| P0-2 | User.email 唯一性约束迁移 | 🔴 P0 | 迁移文件已创建，待执行 |
| P2-1 | PRD 与架构文档滞后 | 🟢 P2 | 未开始 |
| P2-2 | Admin 响应式适配 | 🟢 P2 | ✅ 已存在（LayoutView 已有移动端适配）|
| — | 前端图片 WebP 化 | 🟡 P1 | 未开始 |

v3.2.0 聚焦**性能最后一公里**和**文档债务清理**。

---

## 二、任务清单

### 模块 A：图片 WebP 化（P1）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T22-A1 | StorageService 自动生成 WebP | Sharp 转换，保留原图 | 2h |
| T22-A2 | Media 模型新增 `webpUrl` 字段 | Prisma schema + 迁移 | 1h |
| T22-A3 | 前端 `<picture>` 标签封装 | WebP 优先，原图 fallback | 2h |

### 模块 B：Prisma 迁移执行（P0）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T22-B1 | `users_email_key` → 复合唯一索引 | 迁移文件已创建 | 0.5h |
| T22-B2 | 后端 Service 层 email 唯一性检查 | `createUser` / `register` 容错 | 1h |

### 模块 C：文档重写（P2）

| ID | 任务 | 说明 | 预估 |
|----|------|------|------|
| T22-C1 | `docs/architecture.md` 更新 | 补全 CMS / Workspace / 安全架构 | 2h |
| T22-C2 | `docs/prd.md` 关键章节更新 | v3.0.0 功能列表同步 | 1h |

---

## 三、验收标准

- [ ] 上传图片自动生成 WebP 版本，前端优先使用 WebP
- [ ] Prisma 迁移成功应用，同一 workspace 内 email 唯一
- [ ] Lighthouse Performance ≥ 95（图片优化后）
- [ ] 文档与代码状态一致
- [ ] `npm run test:run` 117/117 通过
- [ ] `cd talentpro-backend && npm run test` 47/47 通过

---

*项目经理 Agent 产出 | Sprint 22 计划 | 2026-05-29*
