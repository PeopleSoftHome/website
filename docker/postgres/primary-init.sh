#!/bin/sh
# 主库初始化：创建复制用户与复制槽（仅在首次初始化数据目录时执行）
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER replicator WITH REPLICATION ENCRYPTED PASSWORD '${REPLICATOR_PASSWORD:-replicator_dev}';
  SELECT pg_create_physical_replication_slot('replica_1');
EOSQL

# 允许复制用户从副本节点接入
echo "host replication replicator 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"
