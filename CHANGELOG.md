# Changelog

## [v3.0.0] - 2026-05-27

### 🔴 P0 — 核心功能修复

- **CMS 动态化**：StatsSection / LogoWallSection / WhyUsSection / AiFamilySection 全面接入 CMS API，支持运营后台配置化运营
- **Workspace 数据隔离**：Prisma `$use` 中间件自动注入 `workspaceId` 过滤 + `WorkspaceGuard` + `WorkspaceInterceptor` 全局注册
- **JWT 黑名单**：新增 `TokenBlacklist` 模型，logout 后 Access Token 立即失效
- **限流全局生效**：`ThrottlerGuard` 作为全局 Guard 注册，所有 API 端点默认受保护
- **ChatBot XSS 防护**：`formatMessage` 增加 HTML 转义，防止 AI 返回内容中的脚本注入

### 🟡 P1 — 高价值功能迭代

- **资源下载留资**：前端新增 DownloadGate 弹窗（姓名/邮箱/公司），后端 `DownloadModule` + `DownloadRecord` 模型，自动邮件发送资料
- **邮件自动化培育**：`LeadNurtureProcessor` 支持 Day3/Day7/Day14 延迟邮件队列（BullMQ）
- **AI 内容审核**：评论创建时自动敏感词检测 + 正则启发式 + 长度异常检测，输出 `aiRiskScore` / `aiFlags`，低分自动通过
- **搜索建议**：`SearchService.suggest()` 多索引聚合，前端 SearchModal 实时建议列表
- **A/B 测试框架**：`Experiment` / `ExperimentEvent` 模型 + 一致性哈希分流 + impression/conversion 追踪
- **热力图 + 滚动深度**：`useAnalytics` 新增 `initHeatmap`（点击坐标追踪）+ `initScrollDepth`（25/50/75/90% 里程碑）
- **ChatBot 流式输出**：`AiService.streamOpenAI` 真正 SSE 流式，前端 `EventSource` 实时打字机效果
- **动态 SEO**：BlogDetailView / ForumTopicView 加载后动态更新 `document.title` + `meta description`
- **Redis 缓存生效**：CMS 公开 GET 接口（products/industries/stats/logos 等）全部添加 `@Cacheable`
- **密码复杂度**：注册密码要求 8 位以上 + 大小写 + 数字 + 特殊字符
- **BullMQ 重试 + 死信监听**：Processor 配置 `attempts: 3` + `exponential backoff`，`@OnWorkerEvent('failed')` 记录永久失败
- **健康检查**：`/health`、`/health/ready`、`/health/live` 端点（Terminus）
- **生产 Dockerfile**：多阶段构建 + Prisma generate + HEALTHCHECK
- **CI/CD 流水线**：GitHub Actions 工作流（前端构建 + 单元测试 + 后端 E2E + Admin 构建）

### 🟢 Admin 后台增强

- **评论审核**：新增 AI 风险分数 / 标记标签展示列
- **A/B 测试管理**：ExperimentView（实验列表 / 新建 / 状态控制 / 转化统计）
- **下载留资记录**：DownloadRecordView（筛选 / CSV 导出）
- **敏感词管理**：SensitiveWordView（词库 CRUD / 内容检测模拟器）

### 🗄 数据库变更

- 新增模型：`Stat`、`ClientLogo`、`WhyUsTab`、`AiCard`、`DownloadRecord`、`Experiment`、`ExperimentEvent`、`SensitiveWord`、`TokenBlacklist`
- `Resource` 新增 `requiresLeadInfo` 字段
- `Comment` 新增 `aiRiskScore`、`aiFlags` 字段
- `User` 新增 `abVariant` 字段
