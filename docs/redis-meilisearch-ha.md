# Redis / Meilisearch 高可用配置指南

> 本文档面向运维与后端开发，说明 TalentPro 后端如何配置 Redis 与 Meilisearch 的高可用部署形态。
> **适用范围**：`talentpro-backend`（NestJS API）

---

## 1. 总体架构

| 组件 | 用途 | 高可用形态 | 默认地址 |
|------|------|-----------|---------|
| Redis | 会话缓存、应用缓存、限流、BullMQ 队列、购物车、SSE Pub/Sub | Single / Cluster / Sentinel | `redis://localhost:6379` |
| Meilisearch | 博客 / 论坛 / 产品 / 资源等全文搜索 | 单机 + 主从复制 / 多实例负载 | `http://localhost:7700` |

---

## 2. Redis 高可用配置

### 2.1 单节点模式（开发 / 轻量生产）

```bash
REDIS_URL=redis://localhost:6379
REDIS_MODE=single
```

> 单节点模式无自动故障转移，仅推荐开发环境或业务量较小的生产环境使用。生产建议至少启用 Sentinel 或 Cluster。

### 2.2 Redis Cluster 模式（推荐：数据分片 + 自动故障转移）

**前置条件**：至少 6 个节点（3 主 3 从），或 3 主节点最小集群。

```bash
REDIS_MODE=cluster
REDIS_CLUSTER_NODES=10.0.0.11:6379,10.0.0.12:6379,10.0.0.13:6379
```

**应用侧行为**：

- `ioredis` 自动识别主从拓扑并路由请求。
- 集群模式下默认启用 `enableReadyCheck: true`。
- `maxRetriesPerRequest: null` 以兼容 BullMQ 要求。

**部署建议**：

- 每个主节点至少配置 1 个从节点，避免单点故障。
- 使用 `redis-cli --cluster create` 创建集群时指定 `--cluster-replicas 1`。
- 跨可用区部署主从，避免同区故障同时影响主从。

### 2.3 Redis Sentinel 模式（推荐：故障自动转移，无分片需求时）

**前置条件**：1 主 1 从 + 至少 3 个 Sentinel 节点。

```bash
REDIS_MODE=sentinel
REDIS_SENTINEL_NODES=10.0.0.21:26379,10.0.0.22:26379,10.0.0.23:26379
REDIS_SENTINEL_MASTER_NAME=mymaster
# REDIS_URL 在 sentinel 模式下仅作为 fallback，通常无需配置
```

**应用侧行为**：

- `ioredis` 通过 Sentinel 自动发现当前 Master。
- 主节点故障时，Sentinel 自动完成故障转移，应用无需重启。

**部署建议**：

- Sentinel 节点数必须为奇数（3 / 5 / 7），保证仲裁有效。
- Sentinel 与 Redis 实例分离部署，避免同机器故障导致脑裂。
- 设置合理的 `down-after-milliseconds` 与 `failover-timeout`。

### 2.4 环境变量汇总

| 变量 | 必填 | 说明 |
|------|------|------|
| `REDIS_URL` | 单节点必填 | Redis 连接字符串，如 `redis://localhost:6379` |
| `REDIS_MODE` | 否 | `single`（默认）/ `cluster` / `sentinel` |
| `REDIS_CLUSTER_NODES` | cluster 必填 | 集群节点列表，逗号分隔 `host:port` |
| `REDIS_SENTINEL_NODES` | sentinel 必填 | Sentinel 节点列表，逗号分隔 `host:port` |
| `REDIS_SENTINEL_MASTER_NAME` | sentinel 必填 | Sentinel 监控的 Master 名称，默认 `mymaster` |
| `CACHE_KEY_PREFIX` | 否 | 缓存键前缀，建议按环境隔离，如 `prod:` |

### 2.5 验证命令

```bash
# 进入后端目录
cd talentpro-backend

# 启动后端后检查日志是否输出预期模式
npm run start:dev
# 预期输出类似：
# [RedisModule] Redis Cluster mode: 3 nodes
# [RedisModule] Redis Sentinel mode: 3 sentinels
# [RedisModule] Redis Single mode: redis://localhost:6379

# 验证缓存读写（需先启动后端及 Redis）
npx ts-node -e "
import { NestFactory } from '@nestjs/core';
import { AppModule } from './apps/api/src/app.module';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
(async () => {
  const app = await NestFactory.createApplicationContext(AppModule);
  const cache = app.get<Cache>(CACHE_MANAGER);
  await cache.set('ha:health', 'ok', 10);
  console.log(await cache.get('ha:health'));
  await app.close();
})();
"
```

### 2.6 故障切换检查清单

- [ ] Redis 主节点宕机后，Sentinel / Cluster 能在 10 秒内完成故障转移。
- [ ] 应用日志无 `Redis connection lost` 持续报错。
- [ ] BullMQ Worker 队列消费未因切换而中断。
- [ ] 缓存命中率在切换前后波动 < 5%。
- [ ] 购物车在 TTL 周期内数据保持一致。

### 2.7 Sentinel 故障切换自动化演练

项目已提供本地一键演练环境，用于验证 BullMQ 在 Redis 主从切换时队列消费不中断。

**启动演练环境**：

```bash
cd talentpro-backend
docker compose -f ../docker/docker-compose.redis-sentinel.yml up -d
```

**运行演练脚本**：

```bash
node scripts/redis-bullmq-failover-drill.cjs
```

脚本行为：

1. 通过 Sentinel 连接 Redis 并启动 BullMQ Worker；
2. 投递前半段任务；
3. 停止 `redis-master` 容器触发故障转移；
4. 等待 Sentinel 选举新主节点；
5. 投递后半段任务；
6. 验证全部任务被消费，无丢失。

**预期结果**：

```text
✅ Redis/BullMQ failover drill passed: all jobs processed without data loss.
```

**清理环境**：

```bash
docker compose -f ../docker/docker-compose.redis-sentinel.yml down
```

---

## 3. Meilisearch 高可用配置

> **重要提示**：与 Redis 不同，应用代码**不感知 Meilisearch 拓扑**。Meilisearch 的高可用完全依赖基础设施层（反向代理、主从复制、多实例负载、快照备份）实现。以下方案均为运维层配置建议，应用侧仅通过单一 `MEILISEARCH_HOST` 接入，由基础设施负责路由与故障转移。

### 3.1 部署形态

Meilisearch 官方目前为**单进程 + 单写**架构，应用代码不内置集群发现或多实例路由能力。高可用通常通过以下方式实现：

| 方案 | 说明 | 适用场景 |
|------|------|---------|
| 主从复制 | 一个主实例负责写入，多个只读副本负责查询 | 读多写少，可接受分钟级 RPO |
| 反向代理 + 多实例 | 多个独立 Meilisearch 实例，通过索引同步保持数据一致 | 高可用读取、地理多活 |
| 快照 + 定时备份 | 通过 `--snapshot-dir` 与 `--schedule-snapshot` 定时落盘 | 灾难恢复 |

### 3.2 主从配置示例

**主实例（写入 + 查询）**：

```bash
./meilisearch --http-addr 0.0.0.0:7700 --master-key talentpro_meili_master_key --db-path /data/meili-primary
```

**从实例（只读查询）**：

```bash
# 方式 1：文件级复制（rsync / 云盘快照）
# 方式 2：使用 Meilisearch 的 dump 机制周期性同步
./meilisearch --http-addr 0.0.0.0:7701 --master-key talentpro_meili_master_key --db-path /data/meili-replica --import-dump /backups/latest.dump
```

**应用侧配置**（单主写入）：

```bash
MEILISEARCH_HOST=http://meili-primary:7700
MEILISEARCH_API_KEY=talentpro_meili_master_key
```

> 若读压力大，可在应用层或网关层将搜索查询路由到从实例，写入/索引同步仍指向主实例。

### 3.3 索引同步与备份

TalentPro 通过 `SearchIndexProcessor`（BullMQ）异步同步搜索索引。高可用场景下建议：

- 索引任务进入 `search-index` 队列，持久化到 Redis，避免任务丢失。
- 定期生成 Meilisearch dump：

```bash
# 创建 dump
curl -X POST 'http://localhost:7700/dumps' -H 'Authorization: Bearer talentpro_meili_master_key'

# 查看 dump 状态
curl 'http://localhost:7700/dumps/{dumpUid}/status' -H 'Authorization: Bearer talentpro_meili_master_key'
```

- 配置 `--schedule-snapshot 86400` 每日生成快照到 `--snapshot-dir`。

### 3.4 环境变量汇总

| 变量 | 必填 | 说明 |
|------|------|------|
| `MEILISEARCH_HOST` | 是 | Meilisearch HTTP 地址 |
| `MEILISEARCH_API_KEY` | 是 | Master Key 或具备足够权限的 API Key |

### 3.5 验证命令

```bash
# 检查 Meilisearch 健康状态
curl -s 'http://localhost:7700/health' | jq .
# 预期：{ "status": "available" }

# 列出索引
curl -s 'http://localhost:7700/indexes' -H 'Authorization: Bearer talentpro_meili_master_key' | jq .

# 验证搜索
curl -s 'http://localhost:7700/indexes/blog_posts/search' \
  -H 'Authorization: Bearer talentpro_meili_master_key' \
  -H 'Content-Type: application/json' \
  -d '{"q":"TalentPro"}' | jq .
```

### 3.6 故障切换检查清单

- [ ] 主实例宕机后，可在 5 分钟内通过备份 / 从实例恢复服务。
- [ ] 索引同步队列无大量堆积（`search-index` 队列长度 < 100）。
- [ ] 搜索接口在切换到从实例后仍返回正确结果。
- [ ] 每日快照 / dump 任务成功执行并有异地副本。
- [ ] API Key 权限最小化，禁止在只读副本上使用 Master Key。

---

## 4. 容器化部署示例

### 4.1 Docker Compose（开发验证）

```yaml
services:
  redis-sentinel:
    image: bitnami/redis-sentinel:7.2
    environment:
      - REDIS_MASTER_HOST=redis
      - REDIS_MASTER_PORT_NUMBER=6379
      - REDIS_SENTINEL_QUORUM=2
    ports:
      - "26379:26379"

  meilisearch:
    image: getmeili/meilisearch:v1.8
    environment:
      - MEILI_MASTER_KEY=talentpro_meili_master_key
    volumes:
      - meili_data:/meili_data
    ports:
      - "7700:7700"
    command: ["meilisearch", "--schedule-snapshot", "86400"]

volumes:
  meili_data:
```

> 生产环境请使用 Kubernetes StatefulSet / Helm 部署 Redis Cluster/Sentinel 与 Meilisearch，并配置持久化存储、资源限制、PodDisruptionBudget 和监控告警。

---

## 5. 监控与告警

| 指标 | 告警阈值建议 | 工具 |
|------|-------------|------|
| Redis 内存使用率 | > 80% | Redis INFO / Prometheus exporter |
| Redis 连接数 | > 80% maxclients | Redis INFO |
| Meilisearch CPU | > 80% 持续 5 分钟 | 容器 / 主机监控 |
| Meilisearch 磁盘使用 | > 80% | 主机监控 |
| 索引同步队列长度 | > 100 持续 5 分钟 | BullMQ dashboard / Prometheus |
| 搜索接口 P99 延迟 | > 500ms | APM / Nginx 日志 |

---

## 6. 相关文件

- `talentpro-backend/.env.example` — 环境变量模板
- `talentpro-backend/apps/api/src/common/redis/redis.module.ts` — Redis 客户端初始化
- `talentpro-backend/apps/api/src/modules/meilisearch/meilisearch.module.ts` — Meilisearch 客户端初始化
- `talentpro-backend/apps/api/src/modules/search/search-index.service.ts` — 索引同步服务
- `talentpro-backend/apps/api/src/modules/search/search-meilisearch.service.ts` — Meilisearch 搜索服务
