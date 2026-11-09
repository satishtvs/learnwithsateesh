#!/bin/bash
# Nightly Postgres dump, keeps 14 days.  Cron (as ubuntu):
#   17 2 * * * /home/ubuntu/learnwithsateesh/lms/deploy/backup.sh >> /var/backups/lws/backup.log 2>&1
set -euo pipefail
DIR=/var/backups/lws
mkdir -p "$DIR"
cd "$(dirname "$0")/.."
docker compose -f docker-compose.prod.yml --env-file .env exec -T db pg_dump -U lws lws | gzip > "$DIR/lws-$(date +%F).sql.gz"
find "$DIR" -name 'lws-*.sql.gz' -mtime +14 -delete
echo "backup ok $(date -Is)"
