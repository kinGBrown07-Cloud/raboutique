#!/bin/bash

# Configuration
DB_NAME="remag"
BACKUP_DIR="/var/backups/remag"
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump $DB_NAME | gzip > "$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"

# Delete old backups
find $BACKUP_DIR -type f -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
