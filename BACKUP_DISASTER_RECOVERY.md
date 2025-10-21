# Backup and Disaster Recovery Guide

This guide provides comprehensive instructions for backing up and recovering the Smart Library Booking System in case of data loss, system failure, or other disasters.

## Table of Contents

1. [Overview](#overview)
2. [Backup Strategy](#backup-strategy)
3. [Database Backup](#database-backup)
4. [File Backup](#file-backup)
5. [Application Backup](#application-backup)
6. [Disaster Recovery Plan](#disaster-recovery-plan)
7. [Recovery Procedures](#recovery-procedures)
8. [Testing and Validation](#testing-and-validation)
9. [Monitoring and Alerts](#monitoring-and-alerts)
10. [Security Considerations](#security-considerations)
11. [Compliance Requirements](#compliance-requirements)
12. [Best Practices](#best-practices)

## Overview

The Smart Library Booking System requires a comprehensive backup and disaster recovery strategy to ensure business continuity and data protection. This guide covers:

- Automated backup procedures
- Data retention policies
- Recovery time objectives (RTO)
- Recovery point objectives (RPO)
- Disaster recovery procedures
- Testing and validation processes
- Security and compliance considerations

## Backup Strategy

### Recovery Objectives

#### Recovery Time Objective (RTO)
- **Critical Systems**: 4 hours
- **Important Systems**: 24 hours
- **Other Systems**: 72 hours

#### Recovery Point Objective (RPO)
- **Critical Data**: 1 hour
- **Important Data**: 24 hours
- **Other Data**: 7 days

### Backup Types

1. **Full Backup**: Complete copy of all data
2. **Incremental Backup**: Only data changed since last backup
3. **Differential Backup**: Data changed since last full backup

### Backup Frequency

| Data Type | Backup Frequency | Retention Period |
|-----------|------------------|------------------|
| Database | Every 1 hour (incremental), Daily (full) | 30 days |
| Application Code | On deployment | 6 months |
| User Files | Every 6 hours | 90 days |
| System Configuration | Weekly | 6 months |
| Logs | Daily | 30 days |

### Storage Locations

1. **Primary Storage**: Local storage or cloud storage
2. **Secondary Storage**: Different geographic location
3. **Tertiary Storage**: Offline/air-gapped storage

## Database Backup

### MySQL Database Backup

#### Automated Backup Script

```bash
#!/bin/bash
# backup-database.sh

# Configuration
DB_HOST="localhost"
DB_USER="backup_user"
DB_PASSWORD="secure_password"
DB_NAME="sml_library"
BACKUP_DIR="/backups/database"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Perform backup
mysqldump \
  --host=$DB_HOST \
  --user=$DB_USER \
  --password=$DB_PASSWORD \
  --single-transaction \
  --routines \
  --triggers \
  --events \
  --hex-blob \
  --opt \
  $DB_NAME > $BACKUP_DIR/${DB_NAME}_${DATE}.sql

# Compress backup
gzip $BACKUP_DIR/${DB_NAME}_${DATE}.sql

# Verify backup
if [ $? -eq 0 ]; then
  echo "Database backup successful: ${DB_NAME}_${DATE}.sql.gz"
  
  # Remove backups older than retention period
  find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
  
  # Upload to cloud storage (example with AWS S3)
  # aws s3 cp $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz s3://sml-library-backups/database/
else
  echo "Database backup failed"
  exit 1
fi
```

#### Scheduled Backup (Cron Job)

```bash
# Add to crontab (crontab -e)
# Full backup daily at 2 AM
0 2 * * * /opt/sml-library/scripts/backup-database.sh full

# Incremental backup every hour
0 * * * * /opt/sml-library/scripts/backup-database.sh incremental
```

#### Point-in-Time Recovery

Enable binary logging for point-in-time recovery:

```sql
-- In MySQL configuration (my.cnf)
[mysqld]
log-bin=mysql-bin
server-id=1
binlog-format=ROW
expire_logs_days=7
```

### Backup Verification

```bash
#!/bin/bash
# verify-backup.sh

BACKUP_FILE=$1
DB_NAME="sml_library_test"

# Create test database
mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;"

# Restore backup to test database
gunzip -c $BACKUP_FILE | mysql $DB_NAME

# Verify data integrity
mysql $DB_NAME -e "SELECT COUNT(*) FROM users;" > /tmp/user_count.txt
mysql $DB_NAME -e "SELECT COUNT(*) FROM bookings;" > /tmp/booking_count.txt

echo "Backup verification completed"
echo "Users: $(cat /tmp/user_count.txt)"
echo "Bookings: $(cat /tmp/booking_count.txt)"

# Clean up
mysql -e "DROP DATABASE $DB_NAME;"
```

## File Backup

### User Uploads Backup

```bash
#!/bin/bash
# backup-files.sh

SOURCE_DIR="/var/www/sml-library/uploads"
BACKUP_DIR="/backups/files"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=90

# Create backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/www/sml-library uploads

# Verify backup
if [ $? -eq 0 ]; then
  echo "File backup successful: uploads_$DATE.tar.gz"
  
  # Remove old backups
  find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete
  
  # Sync to cloud storage
  # rsync -av $BACKUP_DIR/uploads_$DATE.tar.gz user@backup-server:/backups/
else
  echo "File backup failed"
  exit 1
fi
```

### Configuration Backup

```bash
#!/bin/bash
# backup-config.sh

CONFIG_DIRS=(
  "/etc/mysql"
  "/etc/nginx"
  "/opt/sml-library/.env"
  "/opt/sml-library/config"
)

BACKUP_DIR="/backups/config"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=180

# Create backup
tar -czf $BACKUP_DIR/config_$DATE.tar.gz "${CONFIG_DIRS[@]}"

# Verify and clean up
if [ $? -eq 0 ]; then
  echo "Configuration backup successful: config_$DATE.tar.gz"
  find $BACKUP_DIR -name "config_*.tar.gz" -mtime +$RETENTION_DAYS -delete
else
  echo "Configuration backup failed"
  exit 1
fi
```

## Application Backup

### Code Repository Backup

```bash
#!/bin/bash
# backup-repo.sh

REPO_DIR="/opt/sml-library"
BACKUP_DIR="/backups/repo"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=180

# Create backup
git bundle create $BACKUP_DIR/sml-library_$DATE.bundle --all

# Verify backup
if [ $? -eq 0 ]; then
  echo "Repository backup successful: sml-library_$DATE.bundle"
  find $BACKUP_DIR -name "sml-library_*.bundle" -mtime +$RETENTION_DAYS -delete
else
  echo "Repository backup failed"
  exit 1
fi
```

### Docker Images Backup (if containerized)

```bash
#!/bin/bash
# backup-images.sh

IMAGES=("sml-library-app:latest" "sml-library-nginx:latest")
BACKUP_DIR="/backups/images"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=90

# Backup images
for image in "${IMAGES[@]}"; do
  docker save $image | gzip > $BACKUP_DIR/${image//\//_}_$DATE.tar.gz
done

# Verify and clean up
if [ $? -eq 0 ]; then
  echo "Docker images backup successful"
  find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
else
  echo "Docker images backup failed"
  exit 1
fi
```

## Disaster Recovery Plan

### Recovery Scenarios

1. **Hardware Failure**: Server hardware failure
2. **Data Corruption**: Database or file system corruption
3. **Security Breach**: Malware or unauthorized access
4. **Natural Disaster**: Fire, flood, earthquake
5. **Human Error**: Accidental deletion or modification
6. **Service Outage**: Cloud provider or third-party service outage

### Recovery Team

| Role | Responsibility | Contact |
|------|----------------|---------|
| Incident Manager | Overall coordination | [Name, Phone, Email] |
| System Administrator | Infrastructure recovery | [Name, Phone, Email] |
| Database Administrator | Database recovery | [Name, Phone, Email] |
| Application Developer | Application recovery | [Name, Phone, Email] |
| Security Officer | Security assessment | [Name, Phone, Email] |

### Communication Plan

1. **Internal Notification**: Team members via SMS/email
2. **Stakeholder Notification**: Management and key stakeholders
3. **Customer Notification**: Users if service affected
4. **Public Communication**: Website and social media updates

### Recovery Steps

#### 1. Assessment
- Determine the scope and impact of the disaster
- Identify affected systems and data
- Assess backup availability and integrity
- Document the incident

#### 2. Containment
- Isolate affected systems
- Prevent further damage
- Secure backups and critical data
- Preserve evidence for investigation

#### 3. Recovery
- Restore systems from backups
- Validate data integrity
- Test system functionality
- Gradually bring services online

#### 4. Validation
- Verify all systems are functioning correctly
- Test critical business processes
- Confirm data accuracy and completeness
- Monitor for any issues

#### 5. Communication
- Notify stakeholders of recovery status
- Update customers on service availability
- Document lessons learned
- Review and update disaster recovery plan

## Recovery Procedures

### Database Recovery

#### Full Database Recovery

```bash
#!/bin/bash
# recover-database.sh

BACKUP_FILE=$1
DB_NAME="sml_library"

# Stop application services
systemctl stop sml-library

# Drop existing database
mysql -e "DROP DATABASE IF EXISTS $DB_NAME;"

# Create new database
mysql -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Restore from backup
gunzip -c $BACKUP_FILE | mysql $DB_NAME

# Restart services
systemctl start sml-library

echo "Database recovery completed"
```

#### Point-in-Time Recovery

```bash
#!/bin/bash
# recover-point-in-time.sh

FULL_BACKUP=$1
BINLOG_FILE=$2
BINLOG_POSITION=$3
DB_NAME="sml_library"

# Restore full backup
gunzip -c $FULL_BACKUP | mysql $DB_NAME

# Apply binary logs
mysqlbinlog --start-position=$BINLOG_POSITION $BINLOG_FILE | mysql $DB_NAME

echo "Point-in-time recovery completed"
```

### File System Recovery

```bash
#!/bin/bash
# recover-files.sh

BACKUP_FILE=$1
TARGET_DIR="/var/www/sml-library/uploads"

# Stop web server
systemctl stop nginx

# Backup current files (if they exist)
if [ -d "$TARGET_DIR" ]; then
  tar -czf /tmp/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /var/www/sml-library uploads
fi

# Extract backup
tar -xzf $BACKUP_FILE -C /var/www/sml-library

# Set permissions
chown -R www-data:www-data $TARGET_DIR
chmod -R 755 $TARGET_DIR

# Restart web server
systemctl start nginx

echo "File recovery completed"
```

### Application Recovery

```bash
#!/bin/bash
# recover-application.sh

BACKUP_FILE=$1
TARGET_DIR="/opt/sml-library"

# Stop application
systemctl stop sml-library

# Backup current application
tar -czf /tmp/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /opt sml-library

# Extract backup
tar -xzf $BACKUP_FILE -C /opt

# Install dependencies
cd $TARGET_DIR
npm install --production

# Build frontend (if needed)
cd client
npm install --production
npm run build
cd ..

# Restart application
systemctl start sml-library

echo "Application recovery completed"
```

## Testing and Validation

### Regular Testing Schedule

| Test Type | Frequency | Responsible |
|-----------|-----------|-------------|
| Backup Integrity | Weekly | System Admin |
| Recovery Procedures | Monthly | DR Team |
| Full Disaster Simulation | Quarterly | DR Team |
| Backup Restoration | Monthly | System Admin |

### Backup Testing Script

```bash
#!/bin/bash
# test-backup.sh

# Test database backup
echo "Testing database backup..."
LATEST_DB_BACKUP=$(ls -t /backups/database/*.sql.gz | head -1)
if [ -f "$LATEST_DB_BACKUP" ]; then
  gunzip -t $LATEST_DB_BACKUP
  echo "Database backup integrity check: PASSED"
else
  echo "Database backup integrity check: FAILED"
  exit 1
fi

# Test file backup
echo "Testing file backup..."
LATEST_FILE_BACKUP=$(ls -t /backups/files/*.tar.gz | head -1)
if [ -f "$LATEST_FILE_BACKUP" ]; then
  tar -tzf $LATEST_FILE_BACKUP > /dev/null
  echo "File backup integrity check: PASSED"
else
  echo "File backup integrity check: FAILED"
  exit 1
fi

echo "All backup integrity tests passed"
```

### Recovery Testing Procedure

1. **Setup Test Environment**: Create isolated test system
2. **Restore Backups**: Restore all data to test environment
3. **Validate Data**: Check data integrity and completeness
4. **Test Functionality**: Verify application works correctly
5. **Document Results**: Record test outcomes and issues
6. **Update Procedures**: Improve based on test findings

## Monitoring and Alerts

### Backup Monitoring

```bash
#!/bin/bash
# monitor-backups.sh

# Check if backups are running
find /backups/database -name "*.sql.gz" -mtime -1 | grep . > /dev/null
if [ $? -ne 0 ]; then
  echo "ALERT: No database backup found in last 24 hours"
  # Send alert (email, SMS, etc.)
fi

find /backups/files -name "*.tar.gz" -mtime -1 | grep . > /dev/null
if [ $? -ne 0 ]; then
  echo "ALERT: No file backup found in last 24 hours"
  # Send alert
fi

# Check backup sizes
LATEST_DB_BACKUP=$(ls -t /backups/database/*.sql.gz | head -1)
if [ -f "$LATEST_DB_BACKUP" ]; then
  SIZE=$(stat -c%s "$LATEST_DB_BACKUP")
  if [ $SIZE -lt 1000000 ]; then  # Less than 1MB
    echo "ALERT: Database backup size seems too small: $SIZE bytes"
    # Send alert
  fi
fi
```

### Alert Configuration

```yaml
# alerts.yml
groups:
- name: backup-alerts
  rules:
  - alert: BackupMissing
    expr: absent(backup_last_success{job="database-backup"}) == 1
    for: 1h
    labels:
      severity: critical
    annotations:
      summary: "Database backup missing"
      description: "No successful database backup in the last hour"

  - alert: BackupSizeTooSmall
    expr: backup_size_bytes{job="database-backup"} < 1000000
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: "Database backup size too small"
      description: "Database backup size is less than 1MB, may indicate incomplete backup"
```

## Security Considerations

### Backup Encryption

```bash
#!/bin/bash
# encrypted-backup.sh

BACKUP_FILE=$1
ENCRYPTION_KEY="your-encryption-key"

# Encrypt backup
gpg --symmetric --cipher-algo AES256 --passphrase $ENCRYPTION_KEY $BACKUP_FILE

# Decrypt backup
# gpg --decrypt --passphrase $ENCRYPTION_KEY $BACKUP_FILE.gpg > $BACKUP_FILE
```

### Access Control

1. **Backup Storage Permissions**: Restrict access to backup files
2. **Encryption Keys**: Securely store and manage encryption keys
3. **Audit Logs**: Log all backup and recovery activities
4. **Multi-factor Authentication**: For accessing backup systems
5. **Role-based Access**: Limit access based on job responsibilities

### Data Privacy

1. **PII Protection**: Ensure backups don't contain sensitive PII
2. **Compliance**: Follow GDPR, HIPAA, or other relevant regulations
3. **Data Minimization**: Only backup necessary data
4. **Anonymization**: Anonymize data in non-production environments

## Compliance Requirements

### Data Retention Policies

| Data Type | Retention Period | Legal Basis |
|-----------|------------------|-------------|
| User Accounts | While active + 7 years | Business requirement |
| Financial Records | 7 years | Tax regulations |
| Logs | 1 year | Security monitoring |
| Backups | 30 days (daily), 1 year (monthly) | Business continuity |

### Audit Requirements

1. **Backup Logs**: Record all backup activities
2. **Access Logs**: Track who accessed backups
3. **Recovery Logs**: Document all recovery operations
4. **Change Logs**: Record changes to backup procedures
5. **Compliance Reports**: Generate regular compliance reports

### Regulatory Compliance

1. **GDPR**: Data protection and privacy
2. **PCI DSS**: If processing payments
3. **SOX**: Financial reporting accuracy
4. **HIPAA**: If handling health information
5. **Local Regulations**: Country-specific requirements

## Best Practices

### Backup Best Practices

1. **3-2-1 Rule**: 3 copies, 2 different media, 1 offsite
2. **Regular Testing**: Test backups regularly
3. **Versioning**: Keep multiple backup versions
4. **Compression**: Compress backups to save space
5. **Encryption**: Encrypt backups for security
6. **Automation**: Automate backup processes
7. **Monitoring**: Monitor backup success and failures
8. **Documentation**: Document all backup procedures

### Recovery Best Practices

1. **Prioritize Critical Systems**: Restore critical systems first
2. **Validate Data**: Always validate restored data
3. **Test in Isolation**: Test recovery in isolated environment
4. **Document Procedures**: Keep detailed recovery procedures
5. **Train Personnel**: Regularly train recovery team
6. **Update Regularly**: Keep procedures current
7. **Communicate**: Keep stakeholders informed
8. **Learn from Incidents**: Improve based on recovery experiences

### Security Best Practices

1. **Encrypt Backups**: Protect backup data
2. **Secure Storage**: Store backups securely
3. **Access Controls**: Limit backup access
4. **Audit Trails**: Log all backup activities
5. **Key Management**: Securely manage encryption keys
6. **Network Security**: Secure backup transfers
7. **Physical Security**: Protect physical backup media
8. **Regular Updates**: Keep backup tools updated

This backup and disaster recovery guide ensures that the Smart Library Booking System can recover from various disaster scenarios while maintaining data integrity and minimizing downtime. Regular review and testing of these procedures will ensure their effectiveness when needed.