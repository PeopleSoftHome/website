# 生产激活清单（Go-Live Checklist）

> 用途：汇总散落在各文档/CHANGELOG 中的"环境激活型"动作。代码侧已全部就绪，按本清单顺序执行即可上线。
> 版本：v4.4.2 ｜ 关联：`docs/project-evaluation-v4.3.4.md` §10.2

## 0. 前置检查（5 分钟）

- [ ] `APP_ENV=production`、`JWT_SECRET`（≥32 位随机）、`PII_ENCRYPTION_KEY` 与 `PII_HMAC_KEY` 均已独立设置
- [ ] 启动日志确认 `[Security] CSP mode: production (strict script-src)`
- [ ] 生产域名写入 `APP_CORS_ORIGINS`（逗号分隔，无 localhost）
- [ ] Swagger 已自动关闭（生产不挂载 `/api/docs`，无需操作）

## 1. 支付渠道（约 10 分钟/渠道）

### Stripe

- [ ] 配置 `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- [ ] `stripe listen --forward-to https://<domain>/api/v1/payments/stripe/webhook`
- [ ] 完成一笔 test checkout → 订单 `PENDING → COMPLETED`、订阅 `ACTIVE`、收入统计出现该笔
- [ ] Webhook 重放（stripe CLI `events resend`）→ 幂等不重复入账

### 支付宝

- [ ] `ALIPAY_SANDBOX=true` + 沙箱三件套（`ALIPAY_APP_ID/PRIVATE_KEY/PUBLIC_KEY`）
- [ ] 沙箱 APP 支付一笔 → 验签通过 → 订单状态机同上
- [ ] 切正式：`ALIPAY_SANDBOX=false` + 正式密钥 + `ALIPAY_GATEWAY` 默认即可
- [ ] 回归 mock 通道：`ALIPAY_MOCK=true` 下 `verifyMockPayment` 全流程

## 2. CI/CD 部署启用（约 15 分钟）

- [ ] GitHub 仓库 `Settings → Variables`：`DOCKER_REGISTRY`（如 `registry.example.com`）
- [ ] Secrets：`DOCKER_USERNAME` / `DOCKER_PASSWORD`
- [ ] 静态站部署（可选）：Variables `OSS_BUCKET` / `OSS_ADMIN_BUCKET` + Secrets `OSS_ACCESS_KEY_ID/SECRET`
- [ ] push 到 master 触发 CI，确认 deploy job 的 push/OSS 步骤被执行（未配置时自动跳过）

## 3. 性能基线（约 30 分钟）

- [ ] `docker-compose -f docker-compose.dev.yml up -d` + `db:seed:rich`
- [ ] `cd talentpro-backend && npm run test:load`（容量模式：`THROTTLE_LIMIT=100000`）
- [ ] 填写 `docs/load-testing.md` §4 基线表（RPS/p50/p95/p99/错误率）
- [ ] 限流验证：恢复默认 `THROTTLE_LIMIT=500` 复跑，应见 429 且 5xx=0

## 4. 语义 RAG（可选，约 20 分钟）

- [ ] 数据库启用 pgvector：`npx prisma migrate deploy`（含 `20260718000000_semantic_rag_embeddings`）
- [ ] `AI_EMBEDDING_ENABLED=true` + `OPENAI_API_KEY`
- [ ] `npm run ai:embed` 重建索引，确认各类型计数
- [ ] ChatBot 提问长尾语义问题，对比启用前后回答相关性

## 5. 基础设施 HA（可选，按规模）

- [ ] PG：`docker-compose -f docker/docker-compose.postgres-ha.yml up -d`，按 `docs/postgres-minio-ha.md` §5 验收
- [ ] MinIO：`docker-compose -f docker/docker-compose.minio-ha.yml up -d`，应用 `STORAGE_TYPE=s3` 指向该集群
- [ ] Redis Sentinel：`docker/docker-compose.redis-sentinel.yml` + 故障切换演练（`docs/redis-bullmq-failover-drill.md`）

## 6. 上线后 24h 观察

- [ ] Sentry（前后端）无新增 error 峰值
- [ ] p95 延迟与缓存命中率符合 §3 基线
- [ ] 通知 SSE 心跳正常（连接 >25s 不断）
- [ ] 预约演示全链路提交一次（生产冒烟）
