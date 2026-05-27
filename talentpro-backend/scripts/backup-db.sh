#!/bin/bash
# TalentPro 数据库备份脚本
# 保留策略：最近 30 天滚动备份

set -euo pipefail

# 配置
DB_NAME="${DB_NAME:-talentpro}"
DB_USER="${DB_USER:-talentpro}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/talentpro}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
DATE_STR=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/talentpro_${DATE_STR}.sql"

# 创建备份目录
mkdir -p "${BACKUP_DIR}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup: ${BACKUP_FILE}"

# 执行 pg_dump（自定义格式，含压缩）
pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  -Fc \
  -f "${BACKUP_FILE}"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed: ${BACKUP_FILE}"

# 清理超过保留期的旧备份
DELETED=$(find "${BACKUP_DIR}" -name 'talentpro_*.sql' -type f -mtime +${RETENTION_DAYS} | wc -l)
find "${BACKUP_DIR}" -name 'talentpro_*.sql' -type f -mtime +${RETENTION_DAYS} -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cleaned up ${DELETED} old backups (>${RETENTION_DAYS} days)"

# 可选：上传至对象存储（若配置了 MINIO / S3）
if command -v mc &> /dev/null && [ -n "${MINIO_ALIAS:-}" ]; then
  mc cp "${BACKUP_FILE}" "${MINIO_ALIAS}/talentpro-backups/"
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Uploaded to MinIO"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup job finished successfully"
