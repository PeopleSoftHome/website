# TalentPro 使用教程

> 本教程覆盖从环境准备到生产部署的完整流程，适用于开发者、运维工程师和系统管理员。

---

## 目录

1. [项目概述](#一项目概述)
2. [环境要求](#二环境要求)
3. [安装与配置](#三安装与配置)
4. [启动开发环境](#四启动开发环境)
5. [数据库与数据种子](#五数据库与数据种子)
6. [权限系统](#六权限系统)
7. [环境变量详解](#七环境变量详解)
8. [Docker 部署](#八docker-部署)
9. [生产部署](#九生产部署)
10. [常见问题](#十常见问题)

---

## 一、项目概述

TalentPro 是一体化 HR SaaS 平台的完整解决方案，包含三个子项目：

| 子项目 | 技术栈 | 端口 | 说明 |
|--------|--------|------|------|
| **营销门户** | Vue 3.5 + Vite 8 | 3000 | 面向客户的营销官网（SPA） |
| **后端 API** | NestJS 11 + Prisma 6 | 4000 | RESTful API + Swagger 文档 |
| **管理后台** | Vue 3 + Vite | 3457 | 管理员运营后台 |

**核心功能**：
- 营销门户：Hero、产品矩阵、AI Family、客户证言、资源中心、博客、论坛
- 后端 API：用户认证、博客/论坛/CMS、线索管理、数据分析、AI 对话
- 管理后台：内容管理、用户管理、数据导出、系统配置

---

## 二、环境要求

### 2.1 基础环境

| 依赖 | 版本 | 说明 |
|------|------|------|
| Node.js | ≥ 18 | 前端 + 后端运行环境 |
| npm | ≥ 9 | 包管理器 |
| PostgreSQL | ≥ 16 | 主数据库 |
| Redis | ≥ 7 | 缓存 + Session + SSE Pub/Sub |

### 2.2 可选依赖

| 依赖 | 版本 | 说明 |
|------|------|------|
| Meilisearch | ≥ 1.6 | 全文搜索（AI RAG + 博客搜索） |
| MinIO | latest | 对象存储（文件上传） |
| Docker | ≥ 24 | 容器化部署 |

### 2.3 验证环境

```bash
# Node.js
node -v   # 应输出 v18+ 
npm -v    # 应输出 9+

# PostgreSQL
psql --version   # 应输出 16+

# Redis
redis-cli --version   # 应输出 7+
```

---

## 三、安装与配置

### 3.1 克隆项目

```bash
git clone <repository-url> talentpro-v2
cd talentpro-v2
```

### 3.2 安装前端依赖

```bash
npm install
```

### 3.3 安装后端依赖

```bash
cd talentpro-backend
npm install
```

### 3.4 安装 Admin 依赖

```bash
cd ../talentpro-admin
npm install
```

---

## 四、启动开发环境

### 4.1 启动基础设施（Docker）

```bash
cd talentpro-backend
npm run docker:up
```

这会启动：PostgreSQL 16、Redis 7、Meilisearch、MinIO。

验证服务状态：
```bash
docker-compose -f docker/docker-compose.yml ps
```

停止基础设施：
```bash
npm run docker:down
```

### 4.2 配置后端环境变量

```bash
cd talentpro-backend
cp .env.example .env
```

编辑 `.env` 文件，至少修改以下关键变量：

```bash
# 必须修改（生产环境）
JWT_SECRET=your-very-long-random-string-at-least-32-characters
PII_ENCRYPTION_KEY=another-very-long-random-string-at-least-32-characters

# 如果使用真实邮件服务
SMTP_PASS=your-real-sendgrid-api-key

# 如果使用 reCAPTCHA
RECAPTCHA_SECRET_KEY=your-recaptcha-secret

# 如果使用 OpenAI
OPENAI_API_KEY=sk-your-openai-key
```

> ⚠️ **安全警告**：`JWT_SECRET` 和 `PII_ENCRYPTION_KEY` 必须使用随机生成的强密码（≥32字符）。使用默认值会导致应用拒绝启动。

### 4.3 初始化数据库

```bash
cd talentpro-backend

# 生成 Prisma Client
npx prisma generate

# 执行数据库迁移
npx prisma migrate dev

# （可选）查看数据库结构
npx prisma studio
```

### 4.4 启动后端开发服务器

```bash
cd talentpro-backend
npm run start:dev
```

服务启动后：
- API 地址：`http://localhost:4000/api/v1`
- Swagger 文档：`http://localhost:4000/api/docs`
- Health 检查：`http://localhost:4000/api/v1/health`

### 4.5 启动前端开发服务器

```bash
# 在项目根目录
cd talentpro-v2
npm run dev
```

前端地址：`http://localhost:3000`

### 4.6 启动 Admin 后台

```bash
cd talentpro-admin
npm run dev
```

Admin 地址：`http://localhost:3457`

### 4.7 一键启动全部（推荐）

```bash
# 在项目根目录
npm run dev:all
```

这会同时启动前端（3000）、后端（4000）、Admin（3457）。

---

## 五、数据库与数据种子

### 5.1 数据种子

```bash
cd talentpro-backend

# 设置管理员密码（必须）
export SEED_ADMIN_PASSWORD=YourSecureAdminPassword123!

# 执行种子脚本
npm run db:seed
```

种子脚本会创建：
- 默认角色：`USER`、`EDITOR`、`ADMIN`、`SUPER_ADMIN`
- 管理员账号：`admin@talentpro.com`（密码来自 `SEED_ADMIN_PASSWORD`）
- 示例数据：博客分类、论坛分类、产品 Tab、行业方案、AI Cards 等

> ⚠️ **安全警告**：`SEED_ADMIN_PASSWORD` 必须从环境变量读取，严禁硬编码在脚本中。

### 5.2 数据库迁移管理

```bash
# 创建新迁移（修改 schema 后）
npx prisma migrate dev --name your_migration_name

# 部署迁移到生产
npx prisma migrate deploy

# 重置数据库（开发环境慎用）
npx prisma migrate reset
```

---

## 六、权限系统

### 6.1 角色体系

| 角色 | 标识 | 权限范围 |
|------|------|---------|
| 普通用户 | `USER` | 访问博客/论坛、个人中心、提交预约演示 |
| 编辑 | `EDITOR` | 内容创作与管理（博客、论坛、页面内容） |
| 管理员 | `ADMIN` | 管理本组织数据（线索、用户、内容） |
| 超级管理员 | `SUPER_ADMIN` | 全系统管理（跨组织数据、系统配置） |

### 6.2 Workspace（工作空间）隔离

- 每个注册用户自动创建一个 Workspace，用户为 `OWNER`
- `ADMIN` 角色只能查看/管理同 Workspace 的数据
- `SUPER_ADMIN` 可以查看所有 Workspace 的数据
- 数据隔离通过 Prisma Client 扩展自动注入 `workspaceId` 过滤

### 6.3 API 端点权限

| 端点 | 权限要求 |
|------|---------|
| `/auth/*` | `@Public()`（除部分需认证） |
| `/blog/*`（列表/详情） | `@Public()` |
| `/forum/*`（列表/详情） | `@Public()` |
| `/ai/*` | `@Public()` + RecaptchaGuard |
| `/admin/export/*` | `ADMIN` / `SUPER_ADMIN` |
| `/admin/users/*` | `ADMIN` / `SUPER_ADMIN` |
| `/metrics` | `ADMIN` / `SUPER_ADMIN` |
| `/users/search` | 需登录（非公开） |

### 6.4 权限装饰器使用

```typescript
// 公开端点
@Public()
@Get('blog/posts')

// 需登录
@Get('users/search')

// 需特定角色
@Roles('ADMIN', 'SUPER_ADMIN')
@Get('admin/export/leads')
```

---

## 七、环境变量详解

### 7.1 数据库

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DATABASE_URL` | `postgresql://talentpro:talentpro_dev@localhost:5432/talentpro?schema=public` | PostgreSQL 连接字符串 |

### 7.2 Redis

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `REDIS_URL` | `redis://localhost:6379` | Redis 连接字符串 |

### 7.3 JWT & 加密（⚠️ 生产必须修改）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `JWT_SECRET` | `change-me-to-a-random-string-at-least-32-chars` | JWT 签名密钥，≥32字符 |
| `PII_ENCRYPTION_KEY` | `change-me-to-another-random-string-at-least-32-chars` | PII 字段加密密钥，≥32字符 |
| `JWT_ACCESS_EXPIRATION` | `15m` | Access Token 过期时间 |
| `JWT_REFRESH_EXPIRATION` | `7d` | Refresh Token 过期时间 |

### 7.4 应用配置

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `APP_PORT` | `4000` | 后端服务端口 |
| `APP_FRONTEND_URL` | `http://localhost:3000` | 前端地址（CORS） |
| `APP_CORS_ORIGINS` | `http://localhost:3000,http://localhost:3457` | CORS 白名单 |

### 7.5 邮件（SMTP）

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `SMTP_HOST` | `smtp.sendgrid.net` | SMTP 服务器 |
| `SMTP_PORT` | `587` | SMTP 端口 |
| `SMTP_USER` | `apikey` | SMTP 用户名 |
| `SMTP_PASS` | `your-sendgrid-api-key` | SMTP 密码/API Key |
| `MAIL_FROM` | `noreply@talentpro.cn` | 发件人地址 |

### 7.6 reCAPTCHA

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `RECAPTCHA_SECRET_KEY` | `your-recaptcha-secret` | Google reCAPTCHA v3 Secret Key |

### 7.7 OpenAI

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `OPENAI_API_KEY` | `sk-your-openai-key` | OpenAI API Key |
| `OPENAI_MODEL` | `gpt-4o-mini` | 使用的模型 |

### 7.8 Meilisearch

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MEILISEARCH_HOST` | `http://localhost:7700` | Meilisearch 地址 |
| `MEILISEARCH_API_KEY` | `talentpro_meili_master_key` | Master Key |

### 7.9 MinIO

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `MINIO_ENDPOINT` | `localhost` | MinIO 主机 |
| `MINIO_PORT` | `9000` | MinIO 端口 |
| `MINIO_USE_SSL` | `false` | 是否使用 SSL |
| `MINIO_ACCESS_KEY` | `talentpro` | Access Key |
| `MINIO_SECRET_KEY` | `talentpro_minio_dev` | Secret Key |
| `MINIO_BUCKET` | `talentpro` | Bucket 名称 |

---

## 八、Docker 部署

### 8.1 开发环境

```bash
cd talentpro-backend
npm run docker:up
```

服务映射：
| 服务 | 容器端口 | 主机端口 |
|------|---------|---------|
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| Meilisearch | 7700 | 7700 |
| MinIO API | 9000 | 9000 |
| MinIO Console | 9001 | 9001 |

### 8.2 生产环境（多阶段构建）

```bash
cd talentpro-backend
docker build -f docker/Dockerfile -t talentpro-api:latest .
docker run -d \
  -p 4000:4000 \
  --env-file .env \
  --name talentpro-api \
  talentpro-api:latest
```

### 8.3 前端静态站点（Nginx）

```bash
# 构建前端
cd talentpro-v2
npm run build

# Nginx 配置（参考项目根目录 nginx.conf）
# 将 dist/ 目录部署到 Nginx
```

Nginx 关键配置：
```nginx
server {
    listen 80;
    server_name talentpro.cn;
    
    # SPA 路由支持
    location / {
        root /var/www/talentpro;
        try_files $uri $uri/ /index.html;
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://localhost:4000;
    }
}
```

---

## 九、生产部署

### 9.1 部署清单

| 步骤 | 操作 | 验证 |
|------|------|------|
| 1 | 修改 `.env` 中所有默认值 | `JWT_SECRET`、`PII_ENCRYPTION_KEY` 已替换 |
| 2 | 执行 `npm audit` | 无漏洞 |
| 3 | 执行 `npm run build` | 构建成功 |
| 4 | 执行 `npm run test` | 全部通过 |
| 5 | 执行数据库迁移 | `npx prisma migrate deploy` |
| 6 | 配置 HTTPS / SSL 证书 | Nginx 已配置 ssl_ciphers |
| 7 | 配置防火墙 | 仅开放 80/443/4000 |
| 8 | 配置日志收集 | 接入结构化日志（nestjs-pino） |

### 9.2 生产环境变量检查

```bash
# 必须修改的变量
grep -E "JWT_SECRET|PII_ENCRYPTION_KEY|SMTP_PASS|RECAPTCHA_SECRET_KEY|OPENAI_API_KEY" .env
# 确认没有使用默认值
```

### 9.3 Health 检查

```bash
# 后端健康检查
curl https://api.talentpro.cn/api/v1/health

# 应返回 {"status":"ok","timestamp":"...","uptime":...}
```

### 9.4 监控与告警

- Prometheus 指标：`/metrics`（需 ADMIN / SUPER_ADMIN 权限）
- Sentry 错误追踪：已在生产环境接入
- 日志收集：使用结构化日志（nestjs-pino），按级别分类输出

---

## 十、常见问题

### Q1: 前端构建报错 `manualChunks is not a function`

**原因**：Vite 8 使用 Rolldown 引擎，不再支持 `manualChunks` 的对象语法。

**解决**：在 `vite.config.js` 中将对象形式改为函数形式：
```js
manualChunks(id) {
  if (id.includes('node_modules/vue') || id.includes('node_modules/vue-router')) {
    return 'vendor';
  }
}
```

### Q2: 后端启动报错 `JWT_SECRET validation failed`

**原因**：使用了 `.env.example` 中的默认值。

**解决**：将 `JWT_SECRET` 改为随机生成的字符串（≥32字符）。

### Q3: 数据库连接失败 `P1001: Can't reach database server`

**原因**：PostgreSQL 未启动或连接字符串错误。

**解决**：
```bash
# 检查 Docker 服务
docker-compose ps

# 或检查本地 PostgreSQL
pg_isready -h localhost -p 5432
```

### Q4: 种子脚本报错 `SEED_ADMIN_PASSWORD is required`

**原因**：未设置管理员密码环境变量。

**解决**：
```bash
export SEED_ADMIN_PASSWORD=YourSecurePassword123!
npx ts-node scripts/seed.ts
```

### Q5: 邮件发送失败

**原因**：SMTP 配置不正确或网络不通。

**解决**：检查 `.env` 中的 SMTP 配置，或使用 SendGrid/Amazon SES 等云邮件服务。

### Q6: 多实例部署时通知推送丢失

**原因**：v3.0.0 前使用内存 Map 存储 SSE Stream，不支持多实例。

**解决**：v3.0.0 已改造为 Redis Pub/Sub，确保所有实例连接同一个 Redis 即可。

### Q7: CSS Module 中 `:deep()` 报错

**原因**：Vite 8 的 LightningCSS 不认识 `:deep()` 伪类。

**解决**：将 `:deep(selector)` 改为普通后代选择器 `selector`。

---

## 附录：常用命令速查

```bash
# === 前端 ===
npm run dev              # 开发服务器
npm run build            # 生产构建
npm run test             # Vitest 单元测试
npm run preview          # 预览生产构建
npx playwright test      # E2E 测试

# === 后端 ===
npm run start:dev        # 开发服务器（热重载）
npm run start:prod       # 生产服务器
npm run build            # NestJS 构建
npm run test             # Jest 单元测试
npm run test:e2e         # E2E 测试
npm run lint             # ESLint 检查
npx prisma migrate dev   # 数据库迁移
npx prisma generate      # 生成 Prisma Client
npx prisma studio        # 数据库可视化
npm run db:seed          # 数据种子

# === Admin ===
npm run dev              # 开发服务器
npm run build            # 生产构建

# === Docker ===
docker-compose up -d     # 启动基础设施
docker-compose down      # 停止基础设施
docker-compose ps        # 查看状态

# === 全量构建 ===
npm run build:all        # 构建前端 + 后端 + Admin
```

---

*TalentPro HR Portal · v3.0.0 · 使用教程*
