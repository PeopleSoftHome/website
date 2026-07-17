# PostgreSQL / MinIO 高可用运维手册

> 版本：v4.4.0 ｜ 关联资产：`docker/docker-compose.postgres-ha.yml`、`docker/docker-compose.minio-ha.yml`、`docker/postgres/`
> 前置阅读：`docs/redis-meilisearch-ha.md`（Redis/Meilisearch 侧）、`docs/risk-register.md` R-02

## 1. 拓扑总览

```
                ┌──────────────┐   流复制（WAL streaming）   ┌──────────────┐
  API (写) ───▶ │  pg-primary  │ ─────────────────────────▶ │  pg-replica  │ ◀──（可选）只读报表
                └──────────────┘                              └──────────────┘
  API (媒体) ─▶ MinIO 纠删码（EC:2，4 卷） ── 异地容灾：mc mirror 到第二集群
```

- **PostgreSQL**：1 主 1 热备，同步级别默认异步流复制（性能优先）；切换为同步需在主库设置 `synchronous_standby_names = 'replica_1'`（写延迟上升，吞吐下降约 10-20%）
- **MinIO**：纠删码 EC:2——4 卷中任意 2 卷损坏不丢数据；节点级容错需 4 节点分布式（见 §3）

## 2. PostgreSQL 运维

### 2.1 启动与验证

```bash
docker-compose -f docker/docker-compose.postgres-ha.yml up -d
# 主库确认复制状态
docker exec talentpro-pg-primary psql -U talentpro -c "SELECT * FROM pg_stat_replication;"
# 副本确认回放进度
docker exec talentpro-pg-replica psql -U postgres -c "SELECT pg_is_in_recovery(), pg_last_wal_replay_lsn();"
```

### 2.2 应用接入

- 写流量：`DATABASE_URL` 指向 `pg-primary`（5432）
- 读扩展（可选）：报表/导出类查询可配只读连接串指向 `pg-replica`（5433）；Prisma 主连接保持不变

### 2.3 手动故障切换（主库不可用）

```bash
# 1) 提升副本为新主
docker exec talentpro-pg-replica pg_ctl promote -D /var/lib/postgresql/data/pgdata
# 2) 应用侧把 DATABASE_URL 切到 5433 并重启 API
# 3) 旧主恢复后以 standby 身份重新挂回（重建基线，同 replica-entrypoint 流程）
```

### 2.4 与备份的关系

`talentpro-backend/scripts/backup-db.sh`（30 天滚动）继续对主库执行；HA 不替代备份——误删数据会同步到副本，恢复只能靠备份或 PITR。

## 3. MinIO 生产拓扑（4 节点）

```
minio{1..4}.example.com  各挂 1 块数据盘
server http://minio{1...4}/data
```

- 4 节点 × 1 盘 = 默认 EC:2，容忍任意 2 节点离线（读）/ 1 节点离线（写）
- 前置 LB（nginx/ALB）做 9000 轮询；console（9001）单点即可
- 开启版本控制（compose 的 minio-init 已演示）防误删
- 异地容灾：`mc mirror --watch local/talentpro-media dr/talentpro-media` 到第二集群

## 4. 自动故障转移（推荐演进：Patroni）

本仓库资产覆盖"手动切换"。生产若要 RTO < 1min，评估 Patroni + etcd：

- Patroni 管理主备角色与自动 promote；etcd 存集群状态；`pgbouncer` 或 HAProxy 对应用暴露固定写入口
- Prisma 无需改动（连接串指向 pgbouncer）
- 引入前先在预发做 chaos 演练（参照 `docs/redis-bullmq-failover-drill.md` 的演练格式补 PG 版）

## 5. 验收清单（首次部署后）

- [ ] `pg_stat_replication` 可见 replica_1 且 `state=streaming`
- [ ] 主库写入 1 行，副本 5s 内可查
- [ ] `pg_ctl promote` 演练一次并回切
- [ ] MinIO 上传文件后删除 1 卷，读回正常；恢复卷后 `mc admin heal` 完成
- [ ] 备份脚本在新主库上跑通一次
