# TalentPro HR Portal — 风险登记册

> **版本**：v4.3.0 | **负责角色**：项目经理 Agent | **状态**：✅ 已同步最新实现
> **最后更新**：2026-07-05
> **输入依据**：`docs/archive/audits/architecture-diagnosis-report-v4.3.0.md` §10 核心问题清单与 §11 改进建议、`CHANGELOG.md` v4.3.0、实际代码库

---

## 风险矩阵

| ID | 风险描述 | 概率 | 影响 | 风险等级 | 缓解策略 | 状态 | 负责人 |
|----|---------|------|------|---------|---------|------|--------|
| R-01 | **SSR/SSG 名存实亡**：`ssr: false` 导致 `nuxt generate` 产物 `<div id="__nuxt"></div>` 为空壳，无真实页面正文、`<title>`、OG 标签与 JSON-LD，搜索引擎与社交爬虫无法抓取有效内容 | 低 | 极高 | 🔴 P0 | 恢复 SSR/SSG 真实预渲染；CI 增加"原始 HTTP 响应级"SEO 回归测试（非 Playwright JS 水合后断言）；验证 `crawlLinks` 与 `prerender.routes` 覆盖全部动态详情页 | 已修复（持续监控）| 前端架构团队 |
| R-02 | **BullMQ Redis HA 与文档不符**：Cluster 模式仅连接第一个节点，Sentinel 模式无独立分支，故障切换后队列子系统可能失联或任务积压，与 `docs/redis-meilisearch-ha.md` 验收清单冲突 | 低 | 高 | 🔴 P0 | 为 BullMQ 提供真正的 Cluster/Sentinel 连接配置（复用 `RedisModule` 已验证的连接构造逻辑）；执行真实 Redis 故障切换演练，验证 Worker 消费不中断 | 已修复（演练脚本 `talentpro-backend/scripts/redis-bullmq-failover-drill.cjs` + `docker/docker-compose.redis-sentinel.yml` 已提供；需在 Docker daemon 运行环境中执行验证）| 后端架构团队 |
| R-03 | **LlmProvider 静默降级**：`LlmProviderFactory` 对 `azure`/`anthropic`/`openrouter` 预留分支实际全部返回 OpenAI 实现，企业客户若出于合规选择 Azure OpenAI 可能在不知情下调用公有 OpenAI | 中 | 中 | 🟡 P1 | 未实现 Provider 分支显式抛错或打印明确 warning 日志；在 Admin 配置页面增加 Provider 可用性提示；接入真实多 Provider SDK 时补充集成测试 | 已修复 | AI 工程团队 |
| R-04 | **Admin 测试覆盖不足**：38 个管理视图仅 3 个测试文件，角色权限、审计日志、CMS 配置等高敏感操作缺乏自动化保障 | 中 | 高 | 🟡 P1 | 优先补齐 `RoleManagerView` / `AuditLogView` / `CmsManagerView` 单元/集成测试；为 `CmsTable` 声明式生成器补充通用渲染与权限测试；Admin 测试纳入 CI 门禁 | 已缓解（核心视图已补齐）| 前端测试团队 |
| R-05 | **文档滞后于迭代节奏**：`architecture.md` / `prd.md` 等活跃文档在 07-04 新增 AI 图片生成、Admin 配置智能化后仍未完全同步 | 中 | 中 | 🟡 P1 | 建立"打 tag 时文档同步检查清单"；将 `docs/risk-register.md`、`docs/project-spec.md` 纳入版本发布必更项；活跃文档与归档文档生命周期由 `docs/README.md` 统一管控 | 已同步（持续维护）| 项目经理 Agent |
| R-06 | **无障碍色彩对比度不达标**：`@axe-core/playwright` 测试中禁用 `color-contrast` 规则，浅灰次要文字、Tag、暗色背景文字等违反 WCAG 2.1 AA | 高 | 中 | 🟡 P1 | 已实施分批次整改：调整 `--tag-blue-text`、`--error-dark` 等 Token，修复 WhyUs 暗色区、Products/Solutions Badge、Resources Tag、CookieBanner、Forum Tag、Careers 错误提示等对比度；E2E 已重新启用 color-contrast 规则并通过全项目（60/60） | 已修复 | 设计团队 |
| R-07 | **Admin 其他高敏感视图测试仍需扩展**：除角色权限与审计日志外，Marketplace 订单/订阅/分账、敏感词管理、A/B 实验、Feature Flag 等视图仍缺少自动化测试 | 中 | 中 | 🟡 P1 | 按模块优先级滚动补齐测试；为支付/订阅相关视图补充边界与异常流程用例；建立 Admin 测试覆盖率基线 | 已缓解（RolesView / AuditLogView / PageConfigView / FeatureFlagView / SensitiveWordView / ExperimentView / OrderManagerView / SubscriptionManagerView / RevenueAnalyticsView 均已补测试；Admin 测试从 3 个文件扩展到 12 个文件 / 77 个用例）| 前端测试团队 |
| R-08 | **Docker daemon 未运行导致 Redis 故障切换演练未实际执行**：本地/CI 环境中若 Docker 未启动，队列与 Redis HA 验证将流于形式 | 中 | 中 | 🟡 P1 | 将 Redis HA 与 BullMQ 故障切换演练写入 `docker-compose.dev.yml` 配套脚本；CI 增加容器健康检查；演练报告归档至 `docs/archive/audits/` | 已缓解（自动化演练脚本 `talentpro-backend/scripts/redis-bullmq-failover-drill.cjs` 与 `docker/docker-compose.redis-sentinel.yml` 已提供；当前环境 Docker daemon 未启动，未能实际执行，需在 CI/本地启动 Docker 后运行验证并归档报告）| 运维团队 |
| R-09 | **版本号治理依赖手动脚本**：根目录、`talentpro-backend`、`talentpro-admin` 三处 `package.json` 版本号互不一致且落后于 CHANGELOG/提交信息，版本号目前仅为叙事标签而非单一可信来源 | 中 | 低 | 🟢 P2 | 编写 `scripts/validate-version-sync.cjs` 并在 `package.json` 增加 `validate:versions` 脚本；发布流程绑定 `package.json`、`CHANGELOG.md`、Git tag 三者一致性 | 已修复 | 工程效能团队 |
| R-10 | **Marketplace 复杂度超出营销门户范畴**：应用市场、支付、购物车、订阅与分账体系使产品从"获客型营销站"演化为"营销 + 自助交易"混合形态，可能稀释核心转化目标并引入电商级合规与对账风险 | 中 | 高 | 🟡 P1 | 明确 Marketplace 与主站北极星指标关系；建立交易/退款/对账 SOP；关键支付链路接入对账告警与人工复核 | 已缓解（已补充运营 SOP 草案：主站北极星指标仍为「预约演示」转化数，Marketplace GMV 作为二级指标；支付Webhook 已做真实签名验证；Stripe/支付宝订单状态机完整；Admin 已提供订单/订阅/营收视图与测试；建议生产环境接入每日对账任务与退款人工复核工单）| 产品团队 |
| R-11 | **多 LLM Provider 真实接入**：当前仅 OpenAI 一条真实通路，未来接入 Azure / Anthropic / OpenRouter 时需处理不同模型能力、计费、合规区域与故障切换 | 中 | 中 | 🟡 P1 | 为 Azure OpenAI / Anthropic 提供真实 Provider 实现；LlmProviderFactory 按配置选择真实 Provider 或显式报错；Admin 页面展示 Provider 可用性提示 | 已缓解（Azure OpenAI / Anthropic 已接入；openrouter 显式报错；Admin `AiAssistantView` 已展示 Provider 状态）| AI 工程团队 |
| R-12 | **向量检索升级**：ChatBot RAG 当前基于 Meilisearch 关键词检索，内容量增长后语义相似度不足，可能引入向量数据库与嵌入模型运维成本 | 中 | 低 | 🟢 P2 | 评估 Meilisearch 混合搜索或专用向量库方案；建立检索效果评测集；升级前保持关键词检索 + 人工审核兜底 | 已跟踪（当前内容规模下关键词检索性价比合理；触发升级条件：① Meilisearch 索引文档 > 10 万 或 ② 用户反馈语义不匹配率 > 15%；升级前需先建立包含 500+ 问答对的评测集并跑通 Meilisearch 混合搜索 POC）| AI 工程团队 |
| R-13 | **Meilisearch HA 依赖运维层**：应用代码不感知 Meilisearch 拓扑，高可用依赖反向代理/多实例代理配置，若运维层未正确部署则搜索服务单点 | 中 | 中 | 🟡 P1 | 在 `docs/redis-meilisearch-ha.md` 明确标注"应用层不感知 Meilisearch 拓扑，HA 依赖基础设施层"；运维层配置纳入部署检查清单 | 已缓解（文档已明确应用层不感知 Meilisearch 拓扑，并补充部署检查清单）| 运维团队 |
| R-14 | **PII 字段加密与查询冲突**：User / DemoBooking 等模型的 phone / email 已 AES-256-GCM 加密，但按 email 查询时仍为明文，未来数据量增长后可能影响查询性能与合规审计 | 低 | 中 | 🟢 P2 | 评估可搜索加密或哈希索引方案；审计日志完整记录敏感字段访问；定期进行数据合规评审 | 已跟踪（已实施：① 敏感字段访问通过 `AuditInterceptor` 记录 oldValue/newValue；② `TokenBlacklist` 与 JWT 刷新机制保障注销安全；③ 生产环境建议对 email 增加确定性哈希索引（HMAC-SHA256）用于精确查询，phone 保持加密；④ 每季度执行数据合规评审）| 后端安全团队 |

---

## 风险等级说明

| 等级 | 定义 | 处理时效 |
|------|------|---------|
| 🔴 P0 | 架构级缺陷，直接威胁核心商业目标或生产可用性 | 本迭代周期内启动 |
| 🟡 P1 | 高影响质量/合规/运营风险，需纳入近期计划 | 未来 1–2 个迭代 |
| 🟢 P2 | 可管理的技术债或未来扩展风险，需持续跟踪 | 中长期规划 |

---

## 变更记录

| 日期 | 版本 | 变更内容 |
|------|------|---------|
| 2026-07-05 | v4.3.0 | 基于 `docs/archive/audits/architecture-diagnosis-report-v4.3.0.md` 全面重建；删除 React/v1.2.0 历史条目；新增 P0/P1/P2 真实风险 14 条 |
| 2026-03-15 | v0.1.0 | 初始版本，记录 Vue 迁移前 React 重构风险（已归档） |

---

*TalentPro HR Portal — 风险登记册 v4.3.0 | 2026-07-05*
