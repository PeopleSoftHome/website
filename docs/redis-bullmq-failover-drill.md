# Redis Sentinel + BullMQ 故障切换演练

> 来源：`architecture-diagnosis-report-v4.3.0.md` R-02 / R-08 风险闭环  
> 目标：验证 `talentpro-backend` 的 BullMQ Worker 在 Redis 主节点故障、Sentinel 完成 failover 后，能够自动重连新主节点并继续消费任务。

---

## 1. 演练组件

| 文件 | 说明 |
|------|------|
| `docker/docker-compose.redis-sentinel.yml` | Redis 主从 + 3 个 Sentinel 实例的本地 HA 环境 |
| `talentpro-backend/scripts/redis-bullmq-failover-drill.cjs` | 自动化演练脚本 |
| `talentpro-backend/apps/api/src/common/redis/redis.module.ts` | 应用层 Redis 客户端（已支持 single/cluster/sentinel） |
| `talentpro-backend/apps/api/src/modules/queue/queue.module.ts` | BullMQ 连接（已复用 `RedisModule` 的 `REDIS_CLIENT`） |

---

## 2. 前置条件

- Docker Desktop 或 dockerd 已启动。
- 端口 `6379/6380/6381`、`26379/26380/26381` 未被占用。
- 当前目录：`talentpro-backend/`。

---

## 3. 执行演练

```bash
cd talentpro-backend
node scripts/redis-bullmq-failover-drill.cjs
```

脚本会按顺序完成：

1. 启动 Redis Sentinel 高可用栈。
2. 通过 Sentinel 查询当前主节点。
3. 创建 BullMQ `Queue` + `Worker`，消费 3 个任务。
4. `docker stop` 强制停止当前主节点容器，模拟主节点宕机。
5. 等待 Sentinel 选举出新主节点。
6. 再入队 3 个任务，验证 Worker 重连后继续消费。
7. 清理容器并给出通过/失败结论。

---

## 4. 预期结果

```text
✅ Initial master: redis-master:6379
✅ BullMQ Worker is ready
✅ Pre-failover jobs processed
🔴 Stopping master container: talentpro-redis-master
✅ New master after failover: talentpro-redis-replica-1:6379
✅ Post-failover jobs processed
🎉 Failover drill PASSED
```

若出现 `❌ Docker daemon is not running`，请先启动 Docker。

---

## 5. 与代码的关联

- `RedisModule` 根据 `REDIS_MODE` 环境变量构造 `ioredis` 单节点 / `Cluster` / Sentinel 客户端，并作为 `REDIS_CLIENT` 导出。
- `QueueModule` 通过 `BullModule.forRootAsync` 注入 `REDIS_CLIENT`，使 BullMQ 的 `connection` 就是 `RedisModule` 构造的客户端，从而自然继承 Sentinel/Cluster 高可用能力。
- 单元测试 `redis.module.spec.ts` 与 `queue.module.spec.ts` 已覆盖三种模式的连接构造与传递。

---

## 6. 集成到 CI 的建议

在具备 Docker 的 CI runner 中增加一个 job：

```yaml
redis-bullmq-failover:
  steps:
    - uses: actions/checkout@v4
    - run: cd talentpro-backend && npm ci
    - run: node scripts/redis-bullmq-failover-drill.cjs
```

该 job 不需要后端 API/数据库启动，只需要 Docker 与 Node 环境。

---

*TalentPro HR Portal · Redis/BullMQ HA 演练说明 | v4.4.0*
