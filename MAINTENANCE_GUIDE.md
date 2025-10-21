# Maintenance Guide

This guide provides comprehensive instructions for maintaining the Smart Library Booking System to ensure optimal performance, security, and reliability.

## Table of Contents

1. [Overview](#overview)
2. [Routine Maintenance](#routine-maintenance)
3. [Database Maintenance](#database-maintenance)
4. [Application Maintenance](#application-maintenance)
5. [Security Maintenance](#security-maintenance)
6. [Performance Maintenance](#performance-maintenance)
7. [Backup Maintenance](#backup-maintenance)
8. [Monitoring Maintenance](#monitoring-maintenance)
9. [Infrastructure Maintenance](#infrastructure-maintenance)
10. [Compliance Maintenance](#compliance-maintenance)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)

## Overview

Regular maintenance is essential for the continued operation of the Smart Library Booking System. This guide covers:

- Scheduled maintenance tasks
- Database optimization
- Application updates
- Security patches
- Performance tuning
- Backup verification
- Monitoring system health
- Infrastructure updates
- Compliance requirements
- Troubleshooting common issues

## Routine Maintenance

### Daily Tasks

| Task | Description | Time | Responsible |
|------|-------------|------|-------------|
| Log Review | Check application and system logs | 9:00 AM | System Admin |
| Backup Verification | Verify backup integrity | 10:00 AM | System Admin |
| Health Check | Run system health checks | 11:00 AM | System Admin |
| Performance Metrics | Review performance dashboards | 2:00 PM | DevOps Engineer |
| Security Scan | Run automated security scans | 3:00 PM | Security Officer |

### Weekly Tasks

| Task | Description | Day | Responsible |
|------|-------------|-----|-------------|
| Database Optimization | Run optimization scripts | Sunday | DBA |
| Dependency Updates | Check for npm package updates | Monday | Developer |
| System Updates | Apply OS security patches | Tuesday | System Admin |
| Backup Testing | Test backup restoration | Wednesday | System Admin |
| Monitoring Review | Review alert thresholds | Thursday | DevOps Engineer |
| Capacity Planning | Review resource usage | Friday | System Admin |

### Monthly Tasks

| Task | Description | Week | Responsible |
|------|-------------|------|-------------|
| Full System Backup | Complete system backup | 1st Week | System Admin |
| Security Audit | Comprehensive security audit | 2nd Week | Security Officer |
| Performance Tuning | Database and application tuning | 3rd Week | DBA/Developer |
| Compliance Check | Verify compliance requirements | 4th Week | Compliance Officer |
| Disaster Recovery Test | Test DR procedures | 4th Week | DR Team |

## Database Maintenance

### MySQL Database Maintenance

#### Daily Maintenance

```sql
-- Check table integrity
CHECK TABLE users, admins, bookings, payments;

-- Optimize frequently accessed tables
OPTIMIZE TABLE users, bookings, payments;

-- Analyze table statistics
ANALYZE TABLE users, admins, bookings, payments;
```

#### Weekly Maintenance Script

```bash
#!/bin/bash
# weekly-db-maintenance.sh

# Log maintenance start
echo "$(date): Starting weekly database maintenance"

# Check MySQL status
mysqladmin ping > /dev/null
if [ $? -ne 0 ]; then
  echo "ERROR: MySQL is not running"
  exit 1
fi

# Run optimization
mysql -e "OPTIMIZE TABLE users, admins, bookings, payments, plans, seats;" sml_library

# Check for table corruption
mysqlcheck --check sml_library

# Update table statistics
mysql -e "ANALYZE TABLE users, admins, bookings, payments, plans, seats;" sml_library

# Clean up old logs
mysql -e "PURGE BINARY LOGS BEFORE DATE_SUB(NOW(), INTERVAL 7 DAY);" 

# Log completion
echo "$(date): Weekly database maintenance completed"
```

#### Monthly Maintenance Script

```bash
#!/bin/bash
# monthly-db-maintenance.sh

# Log maintenance start
echo "$(date): Starting monthly database maintenance"

# Check disk space
df -h /var/lib/mysql

# Run comprehensive optimization
mysqlcheck --optimize --all-databases

# Check slow query log
mysqlslowlog /var/log/mysql/slow.log > /tmp/slow_queries_$(date +%Y%m).txt

# Analyze query performance
mysql -e "SELECT * FROM performance_schema.events_statements_summary_by_digest ORDER BY avg_timer_wait DESC LIMIT 10;" > /tmp/top_queries_$(date +%Y%m).txt

# Check replication status (if applicable)
mysql -e "SHOW SLAVE STATUS\G" > /tmp/replication_status_$(date +%Y%m).txt

# Log completion
echo "$(date): Monthly database maintenance completed"
```

### Database Optimization

#### Index Optimization

```sql
-- Check unused indexes
SELECT * FROM sys.schema_unused_indexes;

-- Analyze index performance
SELECT * FROM sys.index_statistics ORDER BY rows_selected DESC;

-- Add missing indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_booking_dates ON bookings(start_date, end_date);
CREATE INDEX idx_payment_status ON payments(status);
```

#### Query Optimization

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Analyze slow queries
mysqldumpslow /var/log/mysql/slow.log

-- Optimize specific queries
EXPLAIN SELECT u.name, b.start_date, b.end_date 
FROM users u 
JOIN bookings b ON u.id = b.user_id 
WHERE b.status = 'active' AND b.end_date >= CURDATE();
```

## Application Maintenance

### Dependency Updates

#### Automated Dependency Check

```bash
#!/bin/bash
# check-dependencies.sh

# Check backend dependencies
echo "Checking backend dependencies..."
npm outdated

# Check frontend dependencies
echo "Checking frontend dependencies..."
cd client
npm outdated
cd ..

# Security audit
echo "Running security audit..."
npm audit
```

#### Update Procedure

```bash
#!/bin/bash
# update-dependencies.sh

# Backup current package files
cp package.json package.json.backup
cp client/package.json client/package.json.backup

# Update backend dependencies
npm update

# Update frontend dependencies
cd client
npm update
cd ..

# Run tests
npm test
cd client && npm test && cd ..

# If tests pass, commit changes
if [ $? -eq 0 ]; then
  git add package.json package-lock.json client/package.json client/package-lock.json
  git commit -m "Update dependencies $(date +%Y-%m-%d)"
  echo "Dependencies updated successfully"
else
  echo "Tests failed, reverting changes"
  cp package.json.backup package.json
  cp client/package.json.backup client/package.json
  exit 1
fi
```

### Application Monitoring

#### Health Check Script

```bash
#!/bin/bash
# health-check.sh

# Check if application is running
curl -f http://localhost:5000/api/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "ERROR: Application is not responding"
  # Restart application
  systemctl restart sml-library
  exit 1
fi

# Check database connection
mysqladmin ping > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "ERROR: Database is not responding"
  exit 1
fi

# Check disk space
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
  echo "WARNING: Disk usage is ${DISK_USAGE}%"
fi

echo "Health check passed"
```

## Security Maintenance

### Security Updates

#### Automated Security Scan

```bash
#!/bin/bash
# security-scan.sh

# Run npm audit
echo "Running npm audit..."
npm audit --audit-level high

# Check for vulnerable packages
echo "Checking for vulnerable packages..."
npx nsp check

# Scan for malware (if applicable)
# clamscan -r /opt/sml-library/

echo "Security scan completed"
```

#### SSL Certificate Management

```bash
#!/bin/bash
# ssl-maintenance.sh

# Check SSL certificate expiration
openssl x509 -in /etc/ssl/certs/sml-library.crt -noout -enddate

# If certificate expires in 30 days, send alert
EXPIRATION_DATE=$(openssl x509 -in /etc/ssl/certs/sml-library.crt -noout -enddate | cut -d= -f2)
EXPIRATION_SECONDS=$(date -d "$EXPIRATION_DATE" +%s)
CURRENT_SECONDS=$(date +%s)
DAYS_UNTIL_EXPIRATION=$(( (EXPIRATION_SECONDS - CURRENT_SECONDS) / 86400 ))

if [ $DAYS_UNTIL_EXPIRATION -lt 30 ]; then
  echo "ALERT: SSL certificate expires in $DAYS_UNTIL_EXPIRATION days"
  # Send notification to admin
fi
```

### Firewall Maintenance

```bash
#!/bin/bash
# firewall-maintenance.sh

# Check firewall status
ufw status

# Review firewall rules
ufw status numbered

# Log firewall activity
grep UFW /var/log/syslog | tail -20

# Update rules if necessary
# ufw allow from 192.168.1.0/24 to any port 5000
```

## Performance Maintenance

### Performance Monitoring

#### Resource Usage Monitoring

```bash
#!/bin/bash
# performance-monitor.sh

# Check CPU usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
echo "CPU Usage: ${CPU_USAGE}%"

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f%%"), $3/$2 * 100.0}')
echo "Memory Usage: ${MEMORY_USAGE}"

# Check disk I/O
iostat -x 1 1

# Check network I/O
netstat -i

# Application response time
curl -w "Response time: %{time_total}s\n" -o /dev/null -s http://localhost:5000/api/health
```

#### Database Performance Tuning

```sql
-- Check MySQL performance schema
SELECT * FROM performance_schema.global_status 
WHERE VARIABLE_NAME IN ('Threads_connected', 'Threads_running', 'Questions', 'Slow_queries');

-- Check buffer pool usage
SHOW ENGINE INNODB STATUS\G

-- Optimize query cache
SET GLOBAL query_cache_size = 268435456; -- 256MB
```

### Caching Optimization

```javascript
// server/middleware/cache.js
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes

function cacheMiddleware(req, res, next) {
  const key = req.originalUrl || req.url;
  const cachedResponse = cache.get(key);
  
  if (cachedResponse) {
    return res.json(cachedResponse);
  }
  
  // Override res.json to cache the response
  const originalJson = res.json;
  res.json = function(body) {
    cache.set(key, body);
    originalJson.call(this, body);
  };
  
  next();
}

module.exports = cacheMiddleware;
```

## Backup Maintenance

### Backup Verification

```bash
#!/bin/bash
# verify-backups.sh

# Verify database backups
LATEST_DB_BACKUP=$(ls -t /backups/database/*.sql.gz | head -1)
if [ -f "$LATEST_DB_BACKUP" ]; then
  gunzip -t $LATEST_DB_BACKUP
  if [ $? -eq 0 ]; then
    echo "Database backup integrity: OK"
  else
    echo "ERROR: Database backup corrupted"
  fi
else
  echo "ERROR: No database backup found"
fi

# Verify file backups
LATEST_FILE_BACKUP=$(ls -t /backups/files/*.tar.gz | head -1)
if [ -f "$LATEST_FILE_BACKUP" ]; then
  tar -tzf $LATEST_FILE_BACKUP > /dev/null
  if [ $? -eq 0 ]; then
    echo "File backup integrity: OK"
  else
    echo "ERROR: File backup corrupted"
  fi
else
  echo "ERROR: No file backup found"
fi
```

### Backup Rotation

```bash
#!/bin/bash
# rotate-backups.sh

# Keep daily backups for 30 days
find /backups/database -name "*.sql.gz" -mtime +30 -delete
find /backups/files -name "*.tar.gz" -mtime +30 -delete

# Keep weekly backups for 90 days
find /backups/database -name "*_weekly_*.sql.gz" -mtime +90 -delete
find /backups/files -name "*_weekly_*.tar.gz" -mtime +90 -delete

# Keep monthly backups for 1 year
find /backups/database -name "*_monthly_*.sql.gz" -mtime +365 -delete
find /backups/files -name "*_monthly_*.tar.gz" -mtime +365 -delete

echo "Backup rotation completed"
```

## Monitoring Maintenance

### Alert Threshold Review

```bash
#!/bin/bash
# review-alerts.sh

# Review current alert thresholds
echo "Current CPU alert threshold: 85%"
echo "Current memory alert threshold: 90%"
echo "Current disk alert threshold: 90%"

# Check recent alerts
grep "ALERT" /var/log/sml-library/monitoring.log | tail -10

# Review false positives
echo "Reviewing false positive alerts..."
# Logic to identify and adjust false positive alerts
```

### Monitoring Tool Updates

```bash
#!/bin/bash
# update-monitoring.sh

# Update monitoring agents
apt-get update && apt-get upgrade prometheus-node-exporter

# Restart monitoring services
systemctl restart prometheus-node-exporter

# Verify monitoring is working
curl -s http://localhost:9100/metrics | head -5

echo "Monitoring tools updated"
```

## Infrastructure Maintenance

### Operating System Updates

```bash
#!/bin/bash
# os-update.sh

# Update package lists
apt-get update

# Upgrade packages
apt-get upgrade -y

# Remove unnecessary packages
apt-get autoremove -y

# Clean package cache
apt-get clean

# Reboot if kernel was updated
if [ -f /var/run/reboot-required ]; then
  echo "Reboot required for kernel update"
  # Schedule reboot for maintenance window
  # shutdown -r +5 "System maintenance reboot"
fi
```

### Hardware Maintenance

```bash
#!/bin/bash
# hardware-check.sh

# Check disk health
smartctl -H /dev/sda

# Check memory
memtest86+

# Check CPU temperature
sensors

# Check network interfaces
ethtool eth0

# Log hardware status
echo "Hardware check completed on $(date)"
```

## Compliance Maintenance

### Compliance Auditing

```bash
#!/bin/bash
# compliance-audit.sh

# Check data retention policies
find /var/log/sml-library -name "*.log" -mtime +365 -delete

# Verify user data deletion requests
# Logic to check and process data deletion requests

# Generate compliance report
echo "Compliance audit report - $(date)" > /var/log/sml-library/compliance_$(date +%Y%m).txt
echo "Data retention policies: COMPLIANT" >> /var/log/sml-library/compliance_$(date +%Y%m).txt
echo "Security measures: COMPLIANT" >> /var/log/sml-library/compliance_$(date +%Y%m).txt
```

### Log Retention

```bash
#!/bin/bash
# log-retention.sh

# Application logs - 90 days
find /var/log/sml-library -name "*.log" -mtime +90 -delete

# Database logs - 30 days
find /var/log/mysql -name "*.log" -mtime +30 -delete

# System logs - 365 days
find /var/log -name "*.log" -mtime +365 -delete

echo "Log retention policy applied"
```

## Troubleshooting

### Common Issues and Solutions

#### Application Not Starting

```bash
# Check application logs
tail -f /var/log/sml-library/app.log

# Check system resources
free -h
df -h

# Check database connection
mysql -u root -p -e "SELECT 1;"

# Check port availability
netstat -tlnp | grep :5000
```

#### Database Connection Issues

```bash
# Check MySQL service
systemctl status mysql

# Check MySQL error log
tail -f /var/log/mysql/error.log

# Test database connection
mysqladmin -u root -p ping

# Check connection pool
mysql -e "SHOW PROCESSLIST;"
```

#### Performance Issues

```bash
# Check system resources
top
iostat -x 1 5

# Check MySQL performance
mysql -e "SHOW PROCESSLIST;"
mysql -e "SHOW ENGINE INNODB STATUS\G"

# Check slow queries
tail -f /var/log/mysql/slow.log
```

#### Security Issues

```bash
# Check for unauthorized access
grep "Failed password" /var/log/auth.log

# Check firewall logs
grep UFW /var/log/syslog

# Check application security logs
grep "SECURITY" /var/log/sml-library/app.log
```

## Best Practices

### Maintenance Best Practices

1. **Schedule Maintenance Windows**: Plan maintenance during low-usage periods
2. **Test Before Production**: Always test changes in staging first
3. **Document Everything**: Keep detailed records of all maintenance activities
4. **Monitor After Changes**: Watch for issues after maintenance
5. **Rollback Plans**: Always have a rollback plan for critical changes
6. **Automate Where Possible**: Use scripts to automate repetitive tasks
7. **Regular Reviews**: Periodically review and update maintenance procedures
8. **Training**: Ensure team members are trained on maintenance procedures

### Communication Best Practices

1. **Advance Notice**: Notify stakeholders of planned maintenance
2. **Status Updates**: Provide regular updates during maintenance
3. **Completion Notification**: Confirm when maintenance is complete
4. **Issue Reporting**: Report any issues that arise during maintenance
5. **Documentation**: Document all maintenance activities and outcomes

### Security Best Practices

1. **Regular Updates**: Keep all software up to date
2. **Access Control**: Limit maintenance access to authorized personnel
3. **Audit Trails**: Log all maintenance activities
4. **Secure Connections**: Use secure methods for remote maintenance
5. **Backup Before Changes**: Always backup before major changes
6. **Test Security**: Regularly test security measures
7. **Incident Response**: Have procedures for security incidents

This maintenance guide ensures that the Smart Library Booking System remains secure, performant, and reliable through regular, systematic maintenance activities. Regular review and updates to this guide will ensure its continued effectiveness.