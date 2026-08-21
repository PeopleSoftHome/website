#!/usr/bin/env bash
set -euo pipefail

started=$(date +%s)
cleanup() {
  docker rm -f tp-dr-postgres tp-dr-redis tp-dr-redis-replica >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo 'Starting isolated DR drill...'
docker run -d --name tp-dr-postgres -e POSTGRES_USER=talentpro -e POSTGRES_PASSWORD=talentpro -e POSTGRES_DB=talentpro postgres:16-alpine >/dev/null
docker run -d --name tp-dr-redis redis:7-alpine >/dev/null
for i in {1..30}; do
  docker exec tp-dr-postgres pg_isready -U talentpro >/dev/null 2>&1 && break
  sleep 1
done

docker exec tp-dr-postgres psql -U talentpro -d talentpro -c 'create table dr_probe(id serial primary key, value text not null); insert into dr_probe(value) values (\'before-failover\');' >/dev/null
mkdir -p /tmp/dr-drill
docker exec tp-dr-postgres pg_dump -U talentpro -d talentpro > /tmp/dr-drill/backup.sql

docker exec tp-dr-postgres psql -U talentpro -d postgres -c 'drop database talentpro;' >/dev/null
docker exec tp-dr-postgres psql -U talentpro -d postgres -c 'create database talentpro;' >/dev/null
docker exec -i tp-dr-postgres psql -U talentpro -d talentpro < /tmp/dr-drill/backup.sql >/dev/null
restored=$(docker exec tp-dr-postgres psql -U talentpro -d talentpro -tAc 'select value from dr_probe limit 1')
test "$restored" = 'before-failover'

docker run -d --name tp-dr-redis-replica --link tp-dr-redis:primary redis:7-alpine redis-server --replicaof primary 6379 >/dev/null
sleep 2
docker exec tp-dr-redis redis-cli SET dr_probe ok >/dev/null
docker rm -f tp-dr-redis >/dev/null
sleep 1
docker exec tp-dr-redis-replica redis-cli replicaof no one >/dev/null
recovered=$(docker exec tp-dr-redis-replica redis-cli GET dr_probe)
test "$recovered" = 'ok'

elapsed=$(( $(date +%s) - started ))
echo "DR drill passed: DB restore + Redis failover/recovery in ${elapsed}s"
test "$elapsed" -le 180
