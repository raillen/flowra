#!/bin/bash

# Database restore script
# Restores a backup of PostgreSQL database

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Default values
DB_NAME=${DB_NAME:-kbsys}
DB_USER=${DB_USER:-kbsys_user}
DB_PASSWORD=${DB_PASSWORD}
BACKUP_DIR=${BACKUP_DIR:-./backups}

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Backup file not specified${NC}"
    echo "Usage: ./restore-db.sh <backup-file>"
    echo ""
    echo "Available backups:"
    ls -lh "$BACKUP_DIR"/kbsys_backup_*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}❌ Error: Backup file not found: ${BACKUP_FILE}${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will replace all data in the database!${NC}"
read -p "Are you sure you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restore cancelled"
    exit 0
fi

echo -e "${YELLOW}📦 Restoring database from backup...${NC}"

# Decompress if needed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo "Decompressing backup..."
    gunzip -c "$BACKUP_FILE" > /tmp/restore_backup.sql
    RESTORE_FILE="/tmp/restore_backup.sql"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Check if running in Docker
if docker ps | grep -q kbsys-postgres; then
    echo "Restoring to Docker container..."
    docker exec -i kbsys-postgres psql -U "$DB_USER" -d "$DB_NAME" < "$RESTORE_FILE"
else
    echo "Restoring to local PostgreSQL..."
    PGPASSWORD="$DB_PASSWORD" psql -h localhost -U "$DB_USER" -d "$DB_NAME" < "$RESTORE_FILE"
fi

# Cleanup
if [ -f "/tmp/restore_backup.sql" ]; then
    rm "/tmp/restore_backup.sql"
fi

echo -e "${GREEN}✅ Database restored successfully!${NC}"

