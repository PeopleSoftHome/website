# ADR-001：多租户策略 — 保持预留，暂不激活查询层改造

> 状态：**已决策** ｜ 日期：2026-07-18 ｜ 版本：v4.3.6
> 关联：`docs/project-evaluation-v4.3.4.md` §2.2 / §5.3-③

## 背景

代码库中存在多租户痕迹：`libs/shared/src/prisma/workspace.storage.ts`（AsyncLocalStorage 壳）、部分模型含 `workspaceId` 字段、若干 service 方法签名带 `workspaceId` 参数做手动过滤。当前实际部署形态是**单租户**（一套实例服务一个品牌门户），`workspaceId` 仅在少数写路径（blog/marketplace/forum 的 create/update/delete）传递，查询层无统一强制过滤。

## 决策

**保持预留，不启动查询层多租户改造。**

- `workspace.storage.ts` 与 `workspaceId` 字段作为未来 SaaS 化的**结构预留**保留，不删除、不扩展；
- 不在 Prisma 扩展层增加自动租户过滤（现在做只会引入隐性约束与测试负担，而无真实需求）；
- 文档口径统一为"单租户部署，workspaceId 为预留字段"，不再宣传"多租户"。

## 理由

1. **无需求驱动**：当前商业形态是单品牌 B2B 营销门户 + 单实例 Admin，无多企业入驻场景；marketplace 的"多 vendor"是内容维度而非租户隔离维度。
2. **改造成本高**：真多租户要求 ① 所有查询经租户过滤（Prisma 扩展或 RLS）② 唯一索引加租户维度 ③ 缓存 key 加租户维度 ④ 测试矩阵 ×2。在无用户的情况下做这些是负资产。
3. **预留已足够**：`workspaceId` 列已存在于关键模型，未来激活时不需要数据迁移，只需查询层改造。

## 激活条件（满足任一即重开本 ADR）

- 出现第二个品牌/企业需要共用一套实例的真实需求；
- marketplace 开放第三方 vendor 自助入驻并要求数据隔离；
- 监管/客户合同明确要求租户级数据隔离。

## 激活时的技术路径（备忘）

1. 优先评估 **PostgreSQL Row-Level Security**（策略即真理，应用层零改动面）；
2. 次选 Prisma 扩展层强制注入 `workspaceId` where 条件（参照现有 `soft-delete.extension.ts` 模式）；
3. 缓存 key 规范升级为 `{prefix}:{tenant}:{key}`；SSE channel 升级为 `sse:notifications:{tenant}:{userId}`；
4. 唯一约束复核（如 `slug` → `@@unique([workspaceId, slug])`）。

## 影响

- `libs/shared/README.md` 与 AGENTS.md 的口径更新为"预留"（本版本完成）；
- 不向 `workspaceStorage` 写入新能力，也不新增依赖它的代码。
