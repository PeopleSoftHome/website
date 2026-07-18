# TalentPro HR Portal 安全白皮书

> 版本：v4.3.0  
> 范围：营销门户（Nuxt SSG）、管理后台（Vue3 Admin）、NestJS API

## 1. 安全目标

- 保护用户（企业与求职者）PII 与敏感数据。
- 防止未授权访问管理后台与业务接口。
- 确保支付、演示预约等关键业务流程的完整性与可追溯性。
- 满足 B2B SaaS 常见安全审计要求。

## 2. 认证与会话

### 2.1 JWT Cookie-only

- 门户与 Admin 均使用 `withCredentials: true`，由后端 `httpOnly` Cookie 下发 Access/Refresh Token。
- 前端不再读写 `localStorage` token，降低 XSS 窃取风险。
- Cookie 属性：`httpOnly: true`、`sameSite: 'lax'`、生产环境 `secure: true`。

### 2.2 Token 生命周期与吊销

- Access Token TTL 较短（默认 15 分钟）。
- Refresh Token 可配置 TTL。
- 注销与刷新时，旧 Access/Refresh Token 写入 `TokenBlacklist`，后端 `JwtAuthGuard` 校验黑名单。

### 2.3 权限模型

- 角色：`USER`、`ADMIN`、`SUPER_ADMIN`。
- 权限粒度为 `resource:action`，由后端 `PermissionGuard` 全局控制。
- Admin 前端 `v-permission` 指令无权限时从 DOM 移除元素，避免仅隐藏带来的信息泄露。

## 3. 数据保护

### 3.1 PII 字段加密

使用 AES-256-GCM 字段级加密，覆盖：

- `User.phone`
- `DemoBooking.phone/email`
- `JobApplication.email/phone/resumeUrl`
- `AppVendor` 联系方式
- `TeamMember` 联系方式

### 3.2 Email 查询

`User.email`、`WorkspaceInvite.email` 当前为明文存储以支持等值查询，这是明确的取舍（非疏漏）。
已落地缓解：`PII_HMAC_KEY` 独立的 HMAC-SHA256 哈希索引（`emailHash` 列）用于查询匹配，密钥与加密密钥分离；未配置时回退 `PII_ENCRYPTION_KEY`，生产环境必须独立设置。
后续可选演进：全面转密文 + 仅走 HMAC 索引查询。

### 3.3 密码策略

- 后端强制：≥ 8 位，包含大小写字母、数字、特殊字符。
- bcrypt 哈希存储，cost factor 可配置。

## 4. 输入与输出安全

- 全局启用 `ValidationPipe`：`whitelist`、`forbidNonWhitelisted`、`transform`。
- 文件上传限制类型与大小，媒体库存储隔离。
- ChatBot 输出经 `escapeHtml` 处理后 `v-html`，防止 XSS。

## 5. 接口安全

- `ThrottlerGuard` 全局限流，登录/注册/Demo 预约/AI 生成等接口单独收紧。
- Swagger 文档在生产环境自动关闭。
- Helmet CSP 显式配置，前端 CSP meta 按运行环境动态生成 `connect-src`。

## 6. 支付安全

- Stripe Webhook 使用官方 SDK 验证签名。
- 支付宝 RSA2/RSA 验签，mock 模式仅在 `ALIPAY_MOCK=true` 或密钥未配置时启用。
- 订单、订阅、退款状态机在后端维护，不接受前端直接修改状态。

## 7. 审计与日志

- `AuditInterceptor` 记录关键写操作旧值/新值。
- `nestjs-pino` 记录请求日志，自动脱敏 auth/cookie/password。
- 响应头返回 `X-Request-Id`，支持全链路追踪。

## 8. 部署与基础设施

- 生产强制 HTTPS。
- Redis/BullMQ 支持单节点、Sentinel、Cluster 三种拓扑。
- 数据库连接使用最小权限账号，Prisma migration 纳入版本控制。

## 9. 依赖安全

- 定期执行 `npm audit`，当前仓库目标为 0 高危漏洞。
- 关键依赖版本通过 `overrides` 锁定安全版本。

## 10. 事件响应

发现安全事件时的 checklist：

1. 立即吊销相关会话（写入 `TokenBlacklist`）。
2. 通过 `X-Request-Id` 定位审计日志。
3. 检查 `TokenBlacklist`、`AuditLog` 与 Pino 日志。
4. 评估是否轮换 `JWT_SECRET`、`PII_ENCRYPTION_KEY`。
5. 修复后更新本白皮书与 `docs/risk-register.md`。

---

*TalentPro Security Guide | v4.3.0*
