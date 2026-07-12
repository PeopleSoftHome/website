# 环境变量总表

> **版本**：v4.3.0  
> **说明**：汇总 TalentPro 三个子项目（门户、后端、Admin）所需环境变量，本地开发与生产部署均以 `.env.example` 为权威参考。

---

## 根项目（前端门户）

文件：`.env.example`

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `NUXT_PUBLIC_API_BASE_URL` | 是 | `http://localhost:4000/api/v1` | 后端 API 基础地址 |
| `NUXT_PUBLIC_SENTRY_DSN` | 否 | - | 前端 Sentry DSN |
| `NUXT_PUBLIC_GA_ID` | 否 | - | Google Analytics / GTM ID |
| `NUXT_PUBLIC_RECAPTCHA_SITE_KEY` | 否 | - | reCAPTCHA v3 site key |

> 运行时通过 `runtimeConfig.public` 读取，SSR 与 CSR 均可访问。

---

## 后端 API（`talentpro-backend/.env.example`）

### 应用核心

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `APP_PORT` | 否 | `4000` | 后端监听端口 |
| `APP_ENV` | 否 | `development` | development / staging / production |
| `APP_FRONTEND_URL` | 否 | `http://localhost:3000` | 主前端地址 |
| `APP_CORS_ORIGINS` | 否 | `http://localhost:3000,http://localhost:8080` | CORS 白名单，逗号分隔 |
| `TRUSTED_PROXIES` | 否 | - | 可信代理 IP/CIDR，影响 `IpFilterGuard` |

### 数据库与缓存

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `DATABASE_URL` | 是 | - | PostgreSQL 连接串 |
| `REDIS_URL` | 是 | - | Redis 连接串 |
| `REDIS_MODE` | 否 | `single` | single / cluster / sentinel |

### 安全

| 变量 | 必填 | 说明 |
|------|------|------|
| `JWT_SECRET` | 是 | ≥32 位，禁止用 placeholder |
| `JWT_ACCESS_EXPIRATION` | 否 | 默认 `15m` |
| `JWT_REFRESH_EXPIRATION` | 否 | 默认 `7d` |
| `PII_ENCRYPTION_KEY` | 是 | ≥32 位，AES-256-GCM 加密 |
| `PII_HMAC_KEY` | 否 | 未配置时回退到 `PII_ENCRYPTION_KEY` |

### 外部服务

| 变量 | 必填 | 说明 |
|------|------|------|
| `MEILISEARCH_HOST` | 否 | Meilisearch 地址 |
| `MEILISEARCH_API_KEY` | 否 | Master / Search API Key |
| `MINIO_ENDPOINT` | 否 | MinIO 服务 host |
| `MINIO_PORT` | 否 | 默认 `9000` |
| `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` | 否 | MinIO 凭据 |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | 否 | 支付相关 |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | 否 | AI 生成 |
| `ANTHROPIC_API_KEY` / `AZURE_OPENAI_API_KEY` | 否 | 其它 LLM Provider |

---

## Admin（`talentpro-admin/.env.example`）

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `VITE_API_BASE_URL` | 是 | `http://localhost:4000/api/v1` | 后端 API 地址 |
| `VITE_RECAPTCHA_SITE_KEY` | 否 | - | 登录页 reCAPTCHA |

---

## Docker 开发环境

`docker-compose.dev.yml` 已内置大部分变量，只需确保：

- `JWT_SECRET` 与 `PII_ENCRYPTION_KEY` 长度 ≥32
- 宿主机 `.env` 中的 `DATABASE_URL` / `REDIS_URL` 与容器网络一致

---

## 变更记录

| 版本 | 变更 |
|------|------|
| v4.3.0 | 新增 `PII_HMAC_KEY`、`TRUSTED_PROXIES`、`APP_CORS_ORIGINS` |
| v4.3.1 | 补充 Admin 与 Docker 变量，整理为单一总表 |
