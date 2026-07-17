# API 负载测试与容量基线

> 目的：为 `THROTTLE_LIMIT` 取值与缓存 TTL 提供容量依据，在每次重大性能变更后更新基线。
> 工具：`talentpro-backend/scripts/load-test.cjs`（零依赖，Node ≥ 18）。

## 1. 环境准备

```bash
# 1) 启动依赖（PG / Redis / Meilisearch / MinIO）
docker-compose -f docker-compose.dev.yml up -d

# 2) 初始化数据库与种子数据
cd talentpro-backend
npx prisma migrate deploy && npx prisma generate
npm run db:seed && npm run db:seed:rich   # rich 数据更接近生产量级

# 3) 启动 API
npm run start:dev   # 或 npm run build && npm run start:prod
```

## 2. 运行

```bash
cd talentpro-backend
npm run test:load                                              # 默认：30s × 20 并发
BASE_URL=http://localhost:4000 DURATION_SEC=60 CONNECTIONS=50 npm run test:load
```

输出：分端点 n / p50 / p95 / p99 / 错误数 / 状态码分布 + 汇总 RPS 与错误率；错误率 >1% 时退出码 1（可接 CI）。

覆盖端点（公开热点 GET，均已加 `@Cacheable`）：`blogs/posts`、`blogs/categories`、`blogs/tags`、`forums/topics`、`forums/categories`、`marketplace/apps`、`marketplace/categories`。

## 3. 限流与压测的关系（重要）

默认限流 `THROTTLE_LIMIT=500` 次/分/IP（约 8.3 RPS/IP）。单 IP 压测超过该值会收到 429：

- **验证限流**：保持默认配置运行，`status` 分布中应观察到 429，且 5xx 为 0；
- **验证容量**：临时调大（如 `THROTTLE_LIMIT=100000`）或使用多源 IP，观察 p95/p99 与 5xx 拐点；
- 缓存有效性对比：同一负载下，`docker-compose` 重启 Redis（清空缓存）前后各跑一次，对比 p95——衡量 `@Cacheable(ttl 300s)` 的实际收益。

## 4. 基线记录

| 日期 | 版本 | 环境（CPU/内存/DB） | 并发 | RPS | p50 | p95 | p99 | 5xx 错误率 | 备注 |
|------|------|--------------------|------|-----|-----|-----|-----|-----------|------|
| _待首次运行_ | v4.3.5 | | | | | | | | |

> 首次运行后请填写本表，并将结果贴到当次 PR 描述中。

## 5. 容量调优指引

- `THROTTLE_LIMIT` 应设为"p95 不劣化前提下单 IP 正常浏览峰值的 3-5 倍"；营销站正常浏览远低于 500 次/分，当前默认值有充足余量；
- 热点 GET 的 p95 在缓存命中时应接近网络 RTT（<20ms）；若远高于此，检查 `CACHE_KEY_PREFIX` 隔离与 Redis 延迟；
- p99 拐点先于 CPU 100% 出现时，优先怀疑 DB 连接池（Prisma 默认）或慢查询，参照 `docs/project-evaluation-v4.3.4.md` §4 H-3。
