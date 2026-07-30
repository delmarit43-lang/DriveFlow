#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   ./scripts/backup-db.sh
#   DATABASE_URL=postgresql://... ./scripts/backup-db.sh
#
# Creates ./backups/driveflow-YYYYMMDD-HHMMSS.sql.gz

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="${ROOT}/backups"
mkdir -p "$OUT_DIR"

STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="${OUT_DIR}/driveflow-${STAMP}.sql.gz"

if [[ -n "${DATABASE_URL:-}" ]]; then
  echo "Backing up via DATABASE_URL → ${FILE}"
  pg_dump "$DATABASE_URL" | gzip > "$FILE"
elif docker compose ps db --status running >/dev/null 2>&1; then
  echo "Backing up Docker Postgres → ${FILE}"
  docker compose exec -T db pg_dump -U postgres driveflow | gzip > "$FILE"
else
  echo "Set DATABASE_URL or start docker compose db service." >&2
  exit 1
fi

echo "OK: ${FILE}"
ls -lh "$FILE"
