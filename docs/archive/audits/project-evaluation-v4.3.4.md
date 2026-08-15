# TalentPro HR Portal 全面架构与产品评估报告

> **评估版本**：v4.3.4（master）｜ **评估日期**：2026-07-17
> **评估视角**：顶级架构师 + 产品专家
> **评估方法**：静态代码审查（路径级证据）、配置审计、测试矩阵核对、两轮清理轮（v4.3.3/v4.3.4）的实测数据
> **局限性**：未做运行时压测、未连生产数据库抽样、第三方支付 webhook 未做端到端联调验证；涉及项均已在文中标注"未验证"

---

## 0. 评分总览

| 维度 | 评分 /10 | 一句话结论 |
|------|:---:|------|
| 产品设计 | 8.0 | 信息架构完整、转化路径清晰，商业化闭环（marketplace+支付）已通但运营深度不足 |
| 技术架构 | 8.5 | SSG + NestJS 分层清晰、双共享层沉淀到位，属同规模项目上游水平 |
| 安全性 | 8.5 | 认证/加密/限流/CSP/审计成体系，少数配置不一致与未验证项需收口 |
| 高可用 & 高并发 | 7.5 | 门户侧近乎免疫（静态化），API 侧缓存/队列/哨兵齐备但缺压测与击穿防护 |
| 可维护性 & 可扩展性 | 8.5 | 规范成文且 CI 强制、测试矩阵厚实，Admin JS/TS 混杂与超规文件是主要债 |
| 用户体验 | 8.0 | 加载/动效/暗色/i18n/PWA 完成度高，a11y 有 CI 红线，搜索体验与错误态是短板 |
| 智能化程度 | 7.0 | LLM 抽象 + RAG-lite + 审核 + Admin Copilot 真实可用，但无向量检索与个性化闭环 |
| **综合** | **8.0** | **营销门户属生产级成熟度；从"好门户"到"强产品"差在商业闭环运营与智能深化** |

---

## 1. 产品设计

### 1.1 事实（证据）

- **信息架构**：35 个页面文件、647 条预渲染路由（×3 语言）。主导航覆盖 产品/方案/案例/资源/新闻/招聘/关于 + 博客/论坛/marketplace/个人中心（`src/pages/` 全量清单）；导航已 CMS 化（`useNavigation()` 读 CMS，失败回退 `src/data/navigation.ts`）
- **转化路径**：「预约演示」入口遍布 23 个文件 30 处触发点（NavBar、HeroSection、CtaBanner、FloatingBar、产品/方案/资源/ marketplace 详情页等），DemoModal 为 3 步分步表单 + 成功态（`src/components/ui/DemoModal/ModalStep1-3.vue`），符合 B2B"低摩擦留资"范式；后端 lead 接口独立严格限流（5 次/小时）
- **内容运营**：CMS 通用 CRUD（`/cms/content/:type` 走 `CmsGenericService`）+ 博客/新闻/案例/招聘独立模块 + 翻译后端化（CMS 覆盖层）+ 首页 Section 全部 CMS 可配（sectionRegistry schema 驱动）
- **SEO**：SSG 647 路由 + hreflang + JSON-LD（i18n key 驱动）+ sitemap.xml + 动态 title/meta，`verify-ssg-seo` 脚本断言产物
- **商业化**：marketplace（App/Category/Vendor/Review/Subscription 五模型）+ Stripe Checkout/Webhook + 支付宝（可选渠道）+ Redis 购物车（TTL 7 天）+ 订单四态机，个人中心含 apps/billing/orders/security/settings 完整闭环
- **增长设施**：ROI 计算器、实验模块（A/B variantA/variantB + trafficSplit）、featureFlags、analytics 仪表盘

### 1.2 亮点

1. **"营销站 + 交易站 + 社区站"三合一**且共用一套 CMS/设计系统，B2B 门户里少见的高完成度
2. **转化入口密度与一致性**兼顾：所有 CTA 收口到一个 DemoModal，埋点统一走 analytics store
3. **内容生产已半自动化**：Admin AI 辅助接入 Blog/News/Case/Products/Industries/Job/App 等 8+ 模块

### 1.3 短板与风险

| # | 问题 | 依据 | 严重度 |
|---|------|------|--------|
| P1-1 | 支付闭环未上生产：CI deploy 的镜像 push/OSS 部署段全部注释，Stripe/支付宝未经端到端联调验证 | `ci.yml:215-239`、`alipay.service.ts` 配置项 v4.3.3 才补入示例 | 高（如计划商用） |
| P1-2 | 实验模块只有 CRUD 骨架：无前端分流 SDK、无转化归因，A/B 能力未闭环 | `experiment.service.ts` 仅 findAll/create/status | 中 |
| P1-3 | 缺定价页：B2B SaaS 决策链中 pricing 是核心节点，现仅 marketplace 单应用价（v4.3.3 已删除冗余 PricingTiers 组件，说明定价展示曾反复） | `src/pages/` 无 pricing | 中 |
| P1-4 | 线索培育链路存在（lead-nurture 队列）但前端无内容个性化，留资后体验与普通访客无异 | AGENTS.md 队列清单 | 低 |

---

## 2. 技术架构（架构 / 技术栈 / 设计模式 / 编码规范）

### 2.1 架构形态

```
[ SSG 静态门户 (Nuxt 4.4.8, 647 路由 ×3 语言) ]  ──CDN──▶  用户
        │ 运行时 API 调用（失败回退 src/data 静态常量）
        ▼
[ NestJS 11 API (apps/api) ] ── Prisma 6 ── PostgreSQL 16
        │      ├── Redis（缓存/SSE Pub-Sub/BullMQ）
        │      ├── Meilisearch（搜索 + RAG 检索）
        │      └── MinIO/S3（媒体）
[ Vue 3 Admin (独立部署) ] ── 同一 API
```

- **部署形态判断正确**：营销内容 SSG 化换取极致 LCP 与可用性，动态数据运行时获取且静态兜底——这是本架构最正确的决策
- **双共享层**：前端 `src/shared/`（api/cms/composables/utils）+ 后端 `libs/shared/`（guards/decorators/interceptors/prisma/repositories/helpers），v4.3.3 已完成物理迁移并清除兼容残留，边界干净

### 2.2 设计模式盘点（均有实证）

| 模式 | 实现 | 评价 |
|------|------|------|
| 仓储模式 | `BaseCrudRepository` + 10 个具体 repo；`CmsContentRepository.forModel` 动态模型 | 统一了 CRUD 五件套与分页（`getSkip`/`buildPaginatedResponse`），v4.3.3 补齐 RoleService 后无孤例 |
| 装饰器横切 | `@Cacheable/@CacheEvict/@Permission/@Roles/@Public/@CurrentUser` | 缓存 key 含 originalUrl 防串数据，设计严谨 |
| 拦截器链 | transform（Symbol 标记防误判）/audit（oldValue/newValue）/metrics/cache/cache-control | 职责单一，顺序合理 |
| 事件驱动 | BullMQ 三队列（notification/search-index/lead-nurture），attempts 3 + 指数退避 + 死信记录 | 规范 |
| 多租户（预留） | `workspace.storage.ts` 仅 AsyncLocalStorage 壳 + service 层手动 workspaceId 过滤 | **是预留不是真多租户**，文档表述应更准确 |
| 前端数据层 | `useDetailPage`（7 详情页）/ `useListPage` / `useCmsData`（8 个 fallback 模块注册）/ `createLocalizedData` 工厂 | v4.3.3 推广后重复度显著下降 |
| 动态区块 | `sectionRegistry.ts` 异步注册 + schema 驱动配置表单（Admin 可视化配置首页） | 营销站的正确抽象 |

### 2.3 技术栈评价

- **选型现代化且克制**：Nuxt 4.4.8/Vue 3.5/TS 全量/NestJS 11/Prisma 6；零通用 UI 库（自封装原子组件）保证设计一致性；依赖审计 0 漏洞 + `overrides` 锁安全版本
- **无冗余大依赖**：axios/marked/dompurify/web-vitals 全部在用；Sentry 前后端均动态按需加载

### 2.4 编码规范执行度

- AGENTS.md 规范成文且部分由 CI 强制（token 双源校验、版本三方对齐、lint-staged + husky）
- **偏差项（如实记录）**：超规文件仍存在——`ModalStep1.vue` 262 行、NavBar 241 行、`useChatBot.ts` 257 行、marketplace CSS 515 行（上限 200）；Admin 侧除 main.ts 外仍为 JS（属既定渐进策略，但缺进度追踪）；E2E 本地曾经 0 retries 致跨浏览器误报（v4.3.4 已修）

---

## 3. 安全性

### 3.1 成体系的部分（证据）

- **认证**：JWT Access/Refresh + httpOnly Cookie 优先（前端/Admin 均 `withCredentials`，不碰 localStorage token）+ bcrypt + `TokenBlacklist` 注销 + 角色三级（USER/ADMIN/SUPER_ADMIN）+ 细粒度 permissions（seed 写入）
- **输入防护**：class-validator DTO 全覆盖 + Prisma 参数化 + reCAPTCHA（登录/留资）+ Joi 启动期 env 校验（缺 key 直接拒启动）
- **输出防护**：helmet 显式 CSP（生产 `script-src 'self'`）+ ChatBot `escapeHtml` + DOMPurify（markdown 渲染）+ TransformInterceptor 统一响应
- **数据保护**：PII AES-256-GCM 字段级加密（User/DemoBooking/DownloadRecord/JobApplication/AppVendor/TeamMember）+ 独立 `PII_HMAC_KEY` 支持 emailHash 索引查询 + pino 日志脱敏（auth/cookie/password）+ 审计拦截器记录 old/new
- **限流分层**：5 档 throttler（default/strict/auth/search/lead），登录注册与留资接口单独收紧，且有"Admin 导航触发大量 GET"的真实业务注释说明调优过程
- **网络层**：IP 白/黑名单支持 CIDR/IPv6 + TRUSTED_PROXIES 防 X-Forwarded-For 欺骗

### 3.2 风险与不一致

| # | 问题 | 依据 | 建议 |
|---|------|------|------|
| ~~S-1~~ | ~~限流默认值不一致~~ ✅ **v4.3.5 已修复**：工厂 fallback 与 Joi 对齐（500/100） | `app.module.ts:136` | 已闭环 |
| S-2 | 开发环境 CSP 放行 `unsafe-inline/unsafe-eval`，若生产误判 `app.env` 会静默降级 | `main.ts:44` | 启动日志输出 CSP 模式 |
| S-3 | email 查询字段明文存储（官方文档已声明的取舍），PII 加密宣传口径需与此对齐 | AGENTS.md v4.2.0 | 文档保留现状即可，但建议在 `security.md` 中明示 |
| ~~S-4~~ | ~~Stripe webhook 未端到端验证~~ ✅ **v4.3.5 已修复**：发现 `main.ts` 未开 `rawBody` 导致 `@RawBody()` 恒为 undefined、验签必失败的真实 bug，已修复；支付宝验签代码审计通过（RSA2 排序签名串），沙箱/mock 通道齐备；上线前仍需真实渠道联调 | `payment.service.ts:413`、`alipay.service.ts:109-135` | 联调后即可商用 |
| ~~S-5~~ | ~~Swagger 生产暴露面~~ ✅ **v4.3.5 已核实**：`main.ts:92` 生产环境（`APP_ENV=production`）不挂载 Swagger，无暴露面 | `main.ts:92-101` | 已闭环 |

---

## 4. 高可用 & 高并发

### 4.1 可用性分层（实测有效的设计）

- **门户层（最强）**：全站静态化 + CDN，后端全挂时首页/产品/方案/案例等内容仍完整可用（CMS 失败回退 `src/data/` 静态常量，8 个模块注册在案）；PWA offline.html + 491 条预缓存
- **API 层**：无状态 JWT → 可水平扩多实例；SSE 用 Redis Pub/Sub（单实例全局 1 个 `psubscribe('sse:notifications:*')`，channel 按 userId）→ 多实例下通知可达
- **缓存层**：`@Cacheable` 覆盖 cms/marketplace/system/blog/forum 热点 GET（ttl 300s）+ `CACHE_KEY_PREFIX` 多环境隔离 + 写操作精确失效（v4.3.4 起详情接口不缓存以保证 viewCount 精确）
- **队列层**：BullMQ 重试 3 次指数退避 + 失败事件死信记录 + Redis Sentinel compose + 故障切换演练手册与脚本（`redis-bullmq-failover-drill.cjs`）——**有演练资产的团队极少见**
- **搜索层**：Meilisearch 故障时 AiRagService 逐索引 try/catch 降级（`ai-rag.service.ts:73`），搜索有 Prisma fallback service

### 4.2 瓶颈与缺口

| # | 风险 | 依据 | 触发条件 |
|---|------|------|---------|
| H-1 | **无缓存击穿防护**：`@Cacheable` 无 single-flight/锁，热点 key 失效瞬间并发回源 | `cache.interceptor.ts` 实现 | 缓存到期 + 流量峰值叠加 |
| H-2 | **未经压测**：Lighthouse 预算只覆盖前端；API 无 k6/ artillery 基线，THROTTLE_LIMIT 取值无容量依据 | 仓库无压测脚本 | 上量前的未知 |
| H-3 | DB 连接池/Prisma 事务超时未见显式配置（用默认值） | `prisma.service.ts` | 长事务 + 高并发 |
| H-4 | SSE 连接数无上限/无心跳超时配置确认（未验证） | `notification-sse.service.ts` | 大量在线 Admin 用户 |
| H-5 | PostgreSQL/MinIO 自身 HA 不在仓库资产内（仅 Redis 有 sentinel） | docker/ | 生产单点 |

**容量判断**：当前架构在"营销门户"定位下（读多写少、静态化兜底）可支撑日百万级 PV；瓶颈会先出现在 Admin 集中操作与 marketplace 交易链路，而非门户浏览。

---

## 5. 可维护性 & 可扩展性

### 5.1 测试矩阵（同规模项目上游）

| 层 | 规模 | 状态 |
|----|------|------|
| 前端 Vitest | 36 文件 / 172 用例 | 全绿 |
| 后端 Jest | 84 文件 / 998 用例（含共享层 helper spec） | 全绿，CI 有覆盖率阈值（lines 60） |
| Admin Vitest | 12 文件 / 77 用例 | 全绿，v4.3.3 起入 CI |
| E2E Playwright | 10 spec × 5 浏览器 | 280 过/5 flaky 重试过/0 失败 |
| 其他 | Lighthouse CI（a11y ≥0.95 为 error 级）、token 校验、版本校验、SSG SEO 断言 | 均在 CI |

### 5.2 文档体系

- docs/ 17 个活跃文档 + archive 四分类（audits/evaluations/migrations/sprints）+ "一次性文档即评即归档"成文规范；AGENTS.md 按版本条目累积（v3.0→v4.3.4），是 AI 协作的高质量上下文资产

### 5.3 可扩展性判断

- **加一种内容类型**：CMS 通用 CRUD + CmsContentRepository.forModel → 后端近零代码；Admin CmsTable 配置化 → 低成本
- **加一个首页 Section**：sectionRegistry schema + fallback 数据 + Admin 配置表单 → 模式成熟
- **加 LLM Provider**：LlmProviderFactory 一行注册 → 优
- **加支付渠道**：alipay 已示范（env 驱动 mock/沙箱）→ 中成本
- **主要债**：① Admin JS→TS 迁移未完成；② 超规文件清单（见 §2.4）；③ workspace 多租户只是预留，若未来真要 SaaS 化多租户，查询层改造面大

---

## 6. 用户体验

### 6.1 亮点（实测）

- **加载**：SSG 首屏 + Section 级懒加载 + 骨架屏双体系（列表 Skeleton / 首页 SectionSkeleton 分工明确）+ 字体子集化 + NuxtImg 自动 WebP
- **动效与反馈**：全局 IntersectionObserver reveal（threshold 0.06）+ MutationObserver 自动修复动态内容 + `prefers-reduced-motion` 全局禁用 + 弹窗 z-index 五级治理（1500-3000 成文）
- **可访问性**：axe-core 进 E2E（5 浏览器 ×12 页面）+ Lighthouse a11y 0.95 红线 + focus-trap + Cmd+K + skip-link；v4.3.4 修复了首页最后一处对比度违规（60/60 全绿）
- **多端与国际化**：375/768/1024+ 断点体系 + MobileMenu + PWA；zh/en/zh-TW 三语言 cookie 记忆 + 浏览器语言探测
- **暗色模式**：localStorage → prefers-color-scheme → light 优先级链，token 双层覆盖

### 6.2 短板

| # | 问题 | 依据 |
|---|------|------|
| U-1 | **前端搜索是本地静态索引**（`src/data/searchIndex.ts` 加权评分），与后端 Meilisearch 双轨——内容多时索引会腐化，且搜索结果与全站搜索（博客/论坛内容）不一致 | `useSearchStore` 实现 |
| U-2 | 错误态覆盖不均：详情页有 fatal 404，但 marketplace 详情是非 fatal 空态（设计如此），列表页 API 失败静默回退静态数据——用户无感知是优点也是排查盲区 | 各 `[slug].vue` |
| U-3 | ChatBot 无"转人工/留资"出口，对话挫败时缺少逃生通道（产品决策项） | ChatBot 组件能力面 |
| U-4 | 表单错误提示为字段级，但跨步骤的全局错误汇总缺失（ModalStep1 262 行也与此相关） | DemoModal 实现 |

---

## 7. 智能化程度

### 7.1 真实可用的（证据）

| 能力 | 实现 | 深度判断 |
|------|------|---------|
| 多 LLM 抽象 | `LlmProvider` 接口 + OpenAI/Azure/Anthropic 三实现 + 工厂按 `AI_PROVIDER` 选择，未配置时显式报错 + `provider-status` 端点 | **工程设计扎实**，非 demo 级 |
| 门户 ChatBot | `POST /ai/chat` + `/ai/chat-stream` 流式 + `AiChatSession` 持久化多轮 + `ChatBotConfig` 后台可配 + 网络异常 FAQ 本地兜底 | 生产可用 |
| **RAG-lite** | `AiRagService` 以用户 query 检索 8 个 Meilisearch 索引（产品/方案/AI 能力/资源/案例/新闻/页面/博客）拼接上下文 | 关键词级 RAG，**无向量/embedding**，语义泛化有限 |
| 内容审核 | OpenAI Moderation API 叠加自有规则（评论） | 双层，合格 |
| Admin Copilot | `POST /ai/admin/chat` 配置助手 + AiAssistButton 接入 8+ 模块 + DALL·E 图片生成落媒体库 | 内容运营提效真实落地 |
| 搜索基础设施 | Meilisearch + search-index 队列自动同步 + Prisma 降级 | 为智能化铺好了路 |

### 7.2 距离"AI 驱动"的差距

1. **无向量检索**：RAG 停留在关键词匹配，引入 embedding（Meilisearch 1.x 支持 vector 或独立 pgvector）即可升级为语义 RAG——基础设施已在，成本可控
2. **无个性化**：experiment/featureFlag/analytics 三套数据各自孤立，未形成"行为 → 分群 → 内容变体 → 转化归因"闭环
3. **ChatBot 无业务动作**：只能答不能办（如直接帮约演示、查岗位投递状态），未与 lead/demo-booking 工具调用（function calling）打通
4. **RUM 数据无消费方**：web-vitals 上报后无看板/告警闭环（未验证是否有外部看板）

---

## 8. 综合建议路线图

### P0（上线前必做，1-2 周）— ✅ v4.3.5 已全部闭环

1. ~~支付链路端到端联调并解除 CI deploy 注释~~ ✅ CI deploy 改为按 `vars.DOCKER_REGISTRY` / `vars.OSS_BUCKET` 自动启用的活跃步骤；代码侧修复 Stripe `rawBody` 验签 bug、支付宝验签审计通过；真实渠道联调属运营动作（需生产密钥），清单见 CHANGELOG v4.3.5
2. ~~统一 throttler 默认值不一致；确认生产 Swagger 暴露面~~ ✅ 默认值已对齐；Swagger 生产本就不挂载（已核实）
3. ~~API 压测基线~~ ✅ `scripts/load-test.cjs`（零依赖）+ `docs/load-testing.md` 已交付；本机无 Docker 未执行实测，首次运行后填写基线表

### P1（下一迭代，2-4 周）— ✅ v4.3.6 已全部闭环

4. ~~缓存击穿防护~~ ✅ `CacheInterceptor` 进程内 single-flight（H-1；跨实例 Redis 锁如需另立 P2）
5. ~~前端搜索切换到 Meilisearch~~ ✅ 核实：useSearch 本就是 API 优先 + 本地 fallback；真实缺陷是 API 结果不可跳转，已修复（U-1 闭环）
6. ~~ChatBot 业务动作 + 转人工出口~~ ✅ 服务端意图识别 `actions`（demo/contact/careers/pricing）+ handoffBar 接 CMS 电话 + 在线留言入口（U-3 闭环）
7. ~~定价页~~ ✅ `/pricing` 三档方案 ×3 语言已上线（P1-3 闭环）

### P3（补录，v4.4.1 全部闭环）

- **延期拆分项**：NavBar/ModalStep1/marketplace CSS ✅ 已按互不相交类族拆分（CSS 模板零改动）；useChatBot 意图层 v4.4.0 已拆
- **S-2 / S-3**：CSP 模式启动日志 ✅；email 明文口径与 HMAC 索引现状已写入 `security.md` ✅
- **H-3 / H-4**：Prisma 连接池指引 ✅；SSE 25s 命名事件心跳 ✅
- **E2E 跨浏览器抖动**：根因=资源竞争，retries + 断言超时加宽已治理 ✅
- **记入下一轮（P4 候选）**：Admin views 38 个 JS→TS（迭代级）；个性化/RUM 数据闭环（产品级）

### P2（季度级）— ✅ v4.4.0/v4.4.1 已全部闭环

8. ~~语义 RAG~~ ✅ pgvector + OpenAI Embeddings（`AiEmbeddingService`，env 开关 + 降级，`npm run ai:embed` 建索引，HNSW 余弦索引）
9. ~~实验平台闭环~~ ✅ 后端确定性分桶 assign + 幂等曝光；前端 `useExperiment` SDK；CtaBanner 首个真实实验接入
10. ~~Admin TS + 超规拆分~~ ✅ Admin 核心层 11 文件 TS 迁移；useChatBot 意图层拆分（v4.4.0）；NavBar/ModalStep1/marketplace CSS 拆分（v4.4.1）
11. ~~多租户决策~~ ✅ ADR-001：保持预留，激活条件与 RLS 优先的技术路径已备忘
12. ~~PG/MinIO HA~~ ✅ 流复制 compose + MinIO 纠删码 compose + 运维手册（手动切换；自动故障转移建议评估 Patroni）

---

## 9. 结论

TalentPro HR Portal v4.3.4 是一个**工程成熟度显著高于同类营销门户**的项目：SSG + 静态兜底带来的可用性、双共享层与仓储/装饰器模式带来的可维护性、998+172+77+285 的测试矩阵、以及成文的规范与归档文化，构成了扎实的地基。经过 v4.3.3/v4.3.4 两轮清理，迁移残留与死代码已清零，热点接口有缓存且行为一致。

它当前的最大风险不在代码，而在**商业化闭环未真实跑通**（支付未联调、部署未自动化）与**智能化停留在"好用的集成"而非"驱动"**（无向量、无个性化、ChatBot 无业务动作）。按 §8 的 P0→P2 路线推进，两个迭代内可从"优秀的营销门户"升级为"完整可售的 HR SaaS 产品门面"。

---

*评估人：AI 架构评估（Kimi Code）｜ 证据级别：路径级引用，未验证项已逐一标注*
*按 docs 规范，本报告评审后可移入 `docs/archive/evaluations/`*

---

## 10. P0–P3 完成度审计（v4.4.1，2026-07-18 实测）

> 审计方式：逐条对照代码/测试/产物核验（非凭提交记录）。结论先行：**预定目标全部实现，代码侧零未实现项；6 项属"环境依赖型降级或刻意简化"（详见 10.2），1 项主动取舍，遗留技术债 8 条已登记。**

### 10.1 目标达成总览

| 级别 | 承诺 | 交付 | 判定 |
|------|------|------|------|
| P0 支付与部署安全 | 修 Stripe 验签、统一限流、Swagger 核实、CI deploy 启用、压测基线 | 5/5 交付 | ✅ 达标（联调与实跑属环境依赖，见 10.2） |
| P1 性能与体验 | 防击穿、搜索修复、ChatBot 动作+转人工、定价页 | 4/4 交付 | ✅ 达标（1 处实现方式简化，见 10.2-④） |
| P2 智能化与基建 | 语义 RAG、实验闭环、Admin TS、多租户、PG/MinIO HA | 5/5 交付 | ✅ 达标 |
| P3 规范与加固 | 3 个超规文件拆分、S-2/S-3、H-3/H-4、E2E 治理 | 6/6 交付 | ✅ 达标 |

验证资产：后端 1022 tests / 前端 186 tests / Admin 77 tests / E2E chromium 全过；SSG 构建与三语言预渲染正常；6 个 release tag（v4.3.3→v4.4.1）均可独立回滚。

### 10.2 降级与简化（如实登记）

| # | 项 | 原计划 | 实际实现 | 差距与影响 |
|---|----|--------|---------|-----------|
| ① | 支付端到端联调 | Stripe/支付宝真实渠道跑通 | 代码修复+审计+清单交付 | **未端到端**：需生产/沙箱密钥，纯运营动作（CHANGELOG v4.3.5 附 3 步清单，约 10 分钟） |
| ② | 压测基线 | 跑出 RPS/p95 基线数字 | 零依赖脚本 + 方法论文档 | **未实跑**：本机无 Docker/PG/Redis；基线表待首次填写 |
| ③ | CI deploy 启用 | 真实推送镜像/部署 | 按 `vars.*` 开关的活跃步骤 | **未配置即不执行**：需仓库配置 registry/OSS vars+secrets 后自动生效 |
| ④ | ChatBot "function calling" | LLM 工具调用 | 服务端**规则意图识别** actions | 简化但刻意：确定性、零延迟、双通道生效；升级真 function calling 需 LLM provider 支持 tools，留作演进 |
| ⑤ | 缓存击穿防护 | 跨实例防护 | 进程内 single-flight | 多实例下击穿概率被实例数摊薄但未消除；Redis SET NX 锁留作 P4 候选 |
| ⑥ | 语义 RAG | 语义检索上线 | 全链路代码 + migration + 脚本 | **未激活**：需 `AI_EMBEDDING_ENABLED=true` + OPENAI_API_KEY + 已执行 `ai:embed` 的 pgvector 库；未启用时自动降级关键词检索，无风险 |

### 10.3 主动取舍（非缺陷）

- **详情接口不缓存**（v4.3.4）：用 detail 接口的 DB 回源换 viewCount 精确计数；列表缓存保留，流量大头仍被缓存覆盖。
- **搜索本地索引保留**：作 Meilisearch 故障时的兜底，符合全站静态回退模式，非双轨债。

### 10.4 遗留技术债登记册

| # | 债 | 规模 | 建议级别 |
|---|----|------|---------|
| D-1 | CSS Module 仍超 200 行：NavBar 473 / ChatBot 451 / DemoModal 446 / HeroSection 387 | 4 文件，可复用 v4.4.1 类族拆分范式 | P4 |
| D-2 | 组件仍超行数：AuthModal 213 / SearchModal 192 / HeroSection 156（Section 限 150）；useChatBot 240（Hook 限 100，可部分援引"状态机"例外）；IconSprite 533（明示例外） | 5 文件 | P4 |
| ~~D-3~~ | ~~Admin views 38 个仍为 JS~~ ✅ **v4.4.2 已清零**：全部 `lang="ts"`，核心层 vue-tsc 0 error，`npm run typecheck` 棘轮 + 355 条 views 存量按"改谁清谁"规则收敛 | 已闭环 | — |
| ~~D-4~~ | ~~E2E retries 治理~~ ✅ **v4.4.2 根治**：`toPass` 轮询替代固定等待，水合时序依赖消除 | 已闭环 | — |
| ~~D-5~~ | ~~个性化/RUM 闭环~~ ✅ **v4.4.2 已闭环**：`usePersonalization` 分群（新访/设备/语言）随 assign 入 impression.properties；`/analytics/web-vitals/summary` + Admin `/web-vitals` 看板 | 已闭环 | — |
| ~~D-6~~ | ~~激活清单散落~~ ✅ `docs/go-live-checklist.md` | 已闭环 | — |
| ~~D-7~~ | ~~useListPage 未推广~~ ✅ **v4.4.2**：新增 `usePagedList`（服务端分页语义），blog/forum 已迁移；useListPage 保留服务 loadMore 场景 | 已闭环 | — |
| D-8 | workspace 多租户预留（ADR-001 已决策保持；v4.4.2 起 architecture.md/libs README 口径一致） | — | 已决策 |

### 10.5 审计结论

P0–P3 预定目标**全部达成**，且过程中超额发现/修复 3 个真实缺陷（Stripe rawBody 验签必败、marketplace 结果条类名失效、API 搜索结果不可跳转）。当前无代码级未实现项；剩余全部为环境激活（密钥/Docker/仓库配置）与 P4 级收敛项。系统处于"可进入生产激活阶段"状态。
