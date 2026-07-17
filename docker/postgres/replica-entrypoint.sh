#!/bin/sh
# 副本节点入口：首次启动用 pg_basebackup 从主库拉取基线，之后以 standby 模式运行
set -e

if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "[replica] 初始化：从 $PRIMARY_HOST 拉取基础备份..."
  until pg_isready -h "$PRIMARY_HOST" -U postgres; do sleep 2; done
  rm -rf "$PGDATA"/*
  pg_basebackup -h "$PRIMARY_HOST" -U replicator -p 5432 -D "$PGDATA" \
    -Fp -Xs -P -R -S replica_1 \
    --wal-method=stream \
    --write-recovery-conf
  # -R 已生成 standby.signal 与 primary_conninfo；补密码
  echo "primary_conninfo = 'host=$PRIMARY_HOST port=5432 user=replicator password=$REPLICATOR_PASSWORD'" \
    >> "$PGDATA/postgresql.auto.conf"
  # 去除 pg_basebackup 可能写入的空密码行重复
fi

exec docker-entrypoint.sh postgres -c hot_standby=on
