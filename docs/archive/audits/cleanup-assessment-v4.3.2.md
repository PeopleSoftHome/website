# 项目整理评估文档 — TalentPro HR Portal（基于 v4.3.2）

> 评估日期：2026-07-17 ｜ 评估范围：前端 `src/`、后端 `talentpro-backend/`、Admin `talentpro-admin/`、文档 `docs/`、脚本与工程化配置
> 硬性约束：① 清理 100% 不影响现有功能（明确优化点除外）；② 全程版本管理，可随时回滚。
> 状态：**待审批**。审批通过后按 §6 分阶段执行。

---

## 1. 总体结论

项目整体健康度**良好**：git 工作区干净、构建产物全部未被跟踪、无 TODO/FIXME 堆积、前后端测试与 CI 链路完整。本轮清理属于**收敛性维护**，不是救火。四路并行审查（前端/后端/Admin/文档脚本）的全部发现均经 grep / git 验证，无猜测项。

主要问题集中在五类：

1. **迁移残留**：v4.3.2 共享层迁移（`src/shared/`、`libs/shared/`）留下的兼容 shim，最大一块是后端 `apps/api/src/common/`（36 个 deprecated re-export 文件，零引用）。
2. **一次性脚本与孤儿文件**：`scripts/` 下 5 个无引用脚本、后端 2 个一次性脚本、1 份重复的 docker-compose。
3. **重复代码未沉淀**：8 个详情页手写同一数据加载模式（而现成的 `useDetailPage` 零采用）、后端收入统计逻辑两处重复、BullMQ 队列重复注册。
4. **文档滞后**：`AGENTS.md` 与 `README.md` 仍标 v4.3.0，`docs/README.md` 索引漏 3 个活跃文档，根目录诊断报告应归档。
5. **性能缺口（少数但明确）**：博客/论坛公开热点 GET 缺缓存、支付收入统计全表拉取应改 `groupBy`。

---

## 2. 发现明细与行动项

### 2.1 知识沉淀 & 代码复用

| # | 发现 | 证据 | 行动 | 风险 |
|---|------|------|------|------|
| R1 | 详情页数据加载模式重复 ×8：`news/blog/products/cases/solutions/careers/resources/marketplace` 的 `[slug].vue` 各自手写 `useAsyncData + API + catch → 静态 fallback + createError(404)`；`src/composables/useDetailPage.ts` 正是为此沉淀却零引用 | grep 全仓 `useDetailPage` 仅命中自身与测试；逐页核对 8 处同构代码（如 `news/[slug].vue:135-149`） | **决策项 A**：推广 `useDetailPage` 到 8 个详情页（消除最大重复点）／删除该 composable／保持现状 | 推广=中（需逐页回归）；删除=低 |
| R2 | 列表页分页模式：`useListPage` 仅 `news/index.vue` 使用，`blog/index.vue`、`forum/index.vue` 手写相同分页逻辑 | 两处各 4 个同构分页变量 | 迁移 blog/forum 到 `useListPage` | 低 |
| R3 | `escapeHtml` 逐字重复实现两处 | `chatUtils.ts:1` 与 `utils/markdown.ts:10` | chatUtils 改为 import，单一实现 | 极低 |
| R4 | 数据入口不统一：`products/[slug].vue:104` 绕过门面直接 import `@/data/products/map`，`cases/[slug].vue:76` 走门面 | grep 对比 | 统一走门面 `@/data/products` | 低 |
| R5 | 后端收入统计重复：`payment.service.ts:302-337` 与 `analytics.service.ts:209-227` 同一查询 + 同一内存聚合 | 逐行核对 | 抽取共享方法（与 P2 的 groupBy 优化合并做） | 中 |
| R6 | 后端 `viewCount` 自增模式 ×4（blog/case/news/forum-topic）均为 `findFirst → update increment` | 4 处同构 | 抽 `incrementViewCount` helper | 低 |
| R7 | `role.service.ts` 手写标准 CRUD 五件套，未走 `BaseCrudRepository`（已有 9 个 repo 正确示范） | 代码对比 | 迁移到基类 | 低-中 |
| R8 | `useFeatureFlag.ts` 零引用，但 AGENTS.md v4.2.0 声称存在该 API | grep 零命中 | **决策项 B**：删除并修正 AGENTS.md／保留作公开 API | 低 |

### 2.2 项目目录清理

| # | 发现 | 行动 | 风险 |
|---|------|------|------|
| D1 | 后端 `apps/api/src/common/` 整目录 36 个文件均为 `@deprecated` re-export，全仓零业务引用（phase-b 迁移残留） | **删除整目录**，同步更新 `libs/shared/README.md:4` 的"保留兼容 re-export"表述 | 极低（删后跑 build+test 验证） |
| D2 | `scripts/static-server.js`（被 `e2e-server.cjs` 取代）、`scripts/replace-backend-errors.py`（一次性、含硬编码绝对路径） | 删除 | 无 |
| D3 | 后端 `scripts/fix-admin.js`（一次性、**硬编码密码**）、`scripts/refactor-specs.js`（一次性 codemod） | 删除 | 无 |
| D4 | 后端 `docker/redis-ha/` 与根目录 `docker/docker-compose.redis-sentinel.yml` 场景重复且零引用 | 删除（保留根目录版本） | 低 |
| D5 | `scripts/validate-tokens-sync.js`（CI 用）与 `validate-token-sync.cjs`（husky 用）功能重复 | 合并为单一脚本，CI 与 husky 统一引用 | 低 |
| D6 | 孤儿手动脚本 `audit-contrast.mjs`、`generate-icons.js`、`subset-font.mjs` 零引用 | **决策项 C**：删除／保留并在文件头注明手动用途（保留 subset-font 时注意 devDependencies 中的 `subset-font` 包） | 无 |
| D7 | `talentpro-backend/uploads/` 未被 .gitignore 覆盖（当前为空），开发期上传文件会变 untracked 噪音 | backend `.gitignore` 增加 `uploads/` | 无 |
| D8 | 本地残留日志（`admin-dev.log`、backend 若干 `*.log`）未入库、仅本地 | 物理删除本地文件 | 无 |
| D9 | 前端死代码（均 grep 验证零引用）：`ui/PricingTiers/` 目录、`useLazyImage.ts`、`api/ai.ts`、`api/index.ts`（约 450 行） | 删除 | 低 |
| D10 | **反向确认不删**：11 个旧路径 re-export shim 是 Nuxt 自动导入的桥（`imports.dirs` 不含 `shared/`）；Admin 38 views / 17 components 全部现役；`dist` 是指向 `.output/public` 的 symlink 且已 gitignore | 保持 | — |

### 2.3 文档整理

| # | 发现 | 行动 | 风险 |
|---|------|------|------|
| M1 | 根目录 `architecture-diagnosis-report-v4.3.0.md`（38.5KB，一次性诊断，其 v3 前作已归档） | 移至 `docs/archive/audits/`，同步更新 `risk-register.md`、`redis-bullmq-failover-drill.md` 中的引用路径 | 无 |
| M2 | `docs/README.md` 索引漏 `security.md`、`redis-meilisearch-ha.md`、`redis-bullmq-failover-drill.md`，且自称以 AGENTS.md v4.3.0 为权威 | 补索引、更新版本表述 | 无 |
| M3 | `README.md` 多处过时：标 v4.3.0、结构标题写 `talentpro-v2/`、注释写 "Nuxt 3.4.6"、快速开始与 `docs/getting-started.md` 重复 | 修正版本与目录名，快速开始收敛为指向 getting-started 的链接 | 无 |
| M4 | `AGENTS.md` 滞后于 v4.3.2：未收录 `src/shared/`、`libs/shared/` 共享层迁移 | 补充 v4.3.2 条目（共享层、清理结果），版本号随发布升 v4.3.3 | 无 |
| M5 | 本评估文档执行完毕后 | 归档至 `docs/archive/audits/`（沿用既有惯例） | 无 |

### 2.4 性能优化（明确的优化点，需逐项验证）

| # | 发现 | 行动 | 风险 |
|---|------|------|------|
| P1 | 公开热点 GET 缺缓存：`@Cacheable` 仅覆盖 cms/marketplace/system；blog 的 `posts`/`:slug`/`categories`/`tags`/`comments`、forum 的 `categories`/`topics`/`:id` 未覆盖（营销站主流量入口） | 按 marketplace 既有范式补 `@Cacheable({ ttl: 300 })` + 写操作 `@CacheEvict` | 低（有成熟先例，需回归测试） |
| P2 | `payment.service.ts:getRevenueStats` 拉全部 COMPLETED 订单 + 两层 include 做内存聚合；`analytics.service.ts:195` 已示范 `groupBy` 写法 | 复用 groupBy，消除全行拉取，同时完成 R5 去重 | 中（管理仪表盘接口，需对比前后结果一致性） |
| P3 | `cms-page.service.ts:159` 全库唯一手写 `skip` 计算；`:110` 逐条 `tx.navItem.create` | 改用 `getSkip`；逐条 create 改 `createMany` | 低 |
| P4 | 前端性能现状良好：Sentry 动态 import、ChatBot/section 懒加载、无大依赖、无超大资源、字体已 subset | 无行动 | — |

### 2.5 工程化补强（顺手项）

| # | 行动 | 风险 |
|---|------|------|
| E1 | CI 补两处调用：`validate:versions`（当前 CI/husky 均未调用）、admin `npm run test`（build-admin job 只 build 不测试） | 低 |
| E2 | `.env.example` 补 6 个 `ALIPAY_*` key；统一 `SMTP_FROM`（代码读取）vs `MAIL_FROM_*`（示例提供，实际不生效） | 低 |
| E3 | 修正 `module-registry.ts:7` 指向不存在文件的注释 | 无 |
| E4 | package.json 补 `"test:e2e": "playwright test"` | 无 |

### 2.6 明确不做（避免范围蔓延）

- 超规文件拆分（NavBar 241 行、ModalStep1 262 行、marketplace CSS 515 行、`useChatBot` 257 行等）：属长期收敛项，改动面大、回归成本高，本轮不动，仅在 AGENTS.md 记录。
- data 常量中的品牌色 hex（logos/industries 等约 128 处）：第三方品牌色，token 无法表达，保持。
- Admin JS→TS 迁移：按 AGENTS.md 既定节奏"按模块推进"，本轮不扩大。
- CI deploy job 被注释的 push 段：保留占位，不动。

---

## 3. 版本管理与回滚策略

1. **执行前打快照标签**：`git tag v4.3.2-pre-cleanup`（指向当前 master `d560785`），任何阶段失败可 `git reset --hard v4.3.2-pre-cleanup` 一键回滚。
2. **独立分支执行**：`chore/project-cleanup-v4.3.3`，按 §6 分阶段提交，每阶段一个 commit（沿用 v4.3.2 清理轮的 phase 提交风格），单阶段可独立 revert。
3. **发布后收尾**：全部验证通过后合并回 master，三项目版本号统一升 **v4.3.3**（`validate:versions` 校验），打 tag `v4.3.3`，CHANGELOG 新增条目。

## 4. 验证方案（每阶段必过）

- 前端：`npm run build`（SSG 预渲染通过）+ `npm run test:run` + `npx playwright test`
- 后端：`cd talentpro-backend && npm run build && npm run test`
- Admin：`cd talentpro-admin && npm run build && npm run test`
- 手动抽查（P1/P2 性能项额外要求）：首页 Section 可见、博客/论坛列表与详情正常、Admin 仪表盘收入数字与改动前一致
- 涉及 AGENTS.md 约定变更的，同步更新 AGENTS.md

## 5. 待决策项汇总（审批时请逐项确认）

| 项 | 问题 | 建议 |
|---|------|------|
| A | `useDetailPage`：推广到 8 个详情页，还是删除？ | **推广**（R1 是前端最大重复点，该 composable 本为此设计且带测试） |
| B | `useFeatureFlag`：删除还是保留？ | **保留**（AGENTS.md 公开承诺的 API，删除属功能收窄） |
| C | 3 个孤儿手动脚本（audit-contrast/generate-icons/subset-font）：删除还是保留？ | **保留并加文件头注释**（audit-contrast 补 npm script） |
| D | 性能项 P1/P2（缓存与 groupBy）本轮是否执行？ | **执行**，但作为独立阶段最后做、单独 commit，便于独立回滚 |

## 6. 分阶段执行计划

| 阶段 | 内容 | 对应项 | 风险 |
|------|------|--------|------|
| Phase A 零风险删除 | D1 D2 D3 D4 D7 D8 D9、E3 | 死代码与残留 | 极低 |
| Phase B 文档与归档 | M1 M2 M3（M4/M5 在发布阶段完成） | 文档 | 无 |
| Phase C 工程化 | D5 D6 E1 E2 E4 | 配置与 CI | 低 |
| Phase D 复用沉淀 | R1(按决策) R2 R3 R4 R6 R7 | 前端+后端重构 | 低-中 |
| Phase E 性能优化 | P1 P2 P3、R5 | 后端性能 | 中 |
| Phase F 发布 | 全量验证、版本升 v4.3.3、CHANGELOG、AGENTS.md 更新、合并+tag、本文档归档 | 收尾 | — |
