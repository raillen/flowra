#!/bin/bash

# Database backup script
# Creates a backup of PostgreSQL database

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/kbsys_backup_${TIMESTAMP}.sql"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}📦 Creating database backup...${NC}"

# Check if running in Docker
if docker ps | grep -q kbsys-postgres; then
    echo "Backing up from Docker container..."
    docker exec kbsys-postgres pg_dump -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
else
    echo "Backing up from local PostgreSQL..."
    PGPASSWORD="$DB_PASSWORD" pg_dump -h localhost -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
fi

# Compress backup
gzip "$BACKUP_FILE"
BACKUP_FILE="${BACKUP_FILE}.gz"

echo -e "${GREEN}✅ Backup created: ${BACKUP_FILE}${NC}"

# Keep only last 7 backups
echo -e "${YELLOW}🧹 Cleaning old backups (keeping last 7)...${NC}"
ls -t "${BACKUP_DIR}"/kbsys_backup_*.sql.gz | tail -n +8 | xargs -r rm

echo -e "${GREEN}✅ Backup completed!${NC}"

