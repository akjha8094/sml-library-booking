# Monitoring and Logging Guide

This guide provides comprehensive instructions for setting up monitoring and logging for the Smart Library Booking System.

## Table of Contents

1. [Overview](#overview)
2. [Logging Strategy](#logging-strategy)
3. [Monitoring Setup](#monitoring-setup)
4. [Alerting Configuration](#alerting-configuration)
5. [Performance Monitoring](#performance-monitoring)
6. [Security Monitoring](#security-monitoring)
7. [Database Monitoring](#database-monitoring)
8. [Application Monitoring](#application-monitoring)
9. [Infrastructure Monitoring](#infrastructure-monitoring)
10. [Log Management](#log-management)
11. [Dashboard Configuration](#dashboard-configuration)
12. [Best Practices](#best-practices)

## Overview

Effective monitoring and logging are critical for maintaining the reliability, performance, and security of the Smart Library Booking System. This guide covers:

- Structured logging implementation
- Real-time monitoring setup
- Alerting mechanisms
- Performance tracking
- Security event detection
- Database performance monitoring
- Infrastructure health checks
- Log aggregation and analysis

## Logging Strategy

### Log Levels

The application uses the following log levels:

1. **Error**: Critical issues that require immediate attention
2. **Warn**: Potential issues that should be investigated
3. **Info**: General operational information
4. **Debug**: Detailed information for debugging (development only)
5. **Trace**: Very detailed diagnostic information (development only)

### Log Format

All logs follow a structured JSON format for easy parsing and analysis:

```json
{
  "timestamp": "2025-01-15T10:30:00.123Z",
  "level": "info",
  "message": "User login successful",
  "service": "auth-service",
  "userId": "12345",
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "requestId": "abc-123-def-456"
}
```

### Backend Logging Implementation

```javascript
// server/utils/logger.js
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'sml-library' },
  transports: [
    // Write all logs with level `error` and below to `error.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/error.log'), 
      level: 'error' 
    }),
    
    // Write all logs to `combined.log`
    new winston.transports.File({ 
      filename: path.join(__dirname, '../logs/combined.log') 
    }),
  ],
});

// If we're not in production, log to the console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;
```

### Frontend Logging Implementation

```javascript
// client/src/utils/logger.js
class Logger {
  constructor() {
    this.level = process.env.NODE_ENV === 'production' ? 'warn' : 'debug';
  }

  error(message, error) {
    if (this.shouldLog('error')) {
      console.error(`[ERROR] ${new Date().toISOString()}`, message, error);
      this.sendToServer('error', message, error);
    }
  }

  warn(message) {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${new Date().toISOString()}`, message);
      this.sendToServer('warn', message);
    }
  }

  info(message) {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${new Date().toISOString()}`, message);
    }
  }

  debug(message) {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${new Date().toISOString()}`, message);
    }
  }

  shouldLog(level) {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.level];
  }

  sendToServer(level, message, error) {
    // Send logs to backend for aggregation
    fetch('/api/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, message, error: error?.message, stack: error?.stack })
    }).catch(err => {
      // If we can't send to server, log to console
      console.error('Failed to send log to server:', err);
    });
  }
}

export default new Logger();
```

### Example Usage

```javascript
// server/controllers/authController.js
const logger = require('../utils/logger');

async function login(req, res) {
  try {
    const { email, password } = req.body;
    
    logger.info('Login attempt', { 
      email, 
      ip: req.ip, 
      userAgent: req.get('User-Agent') 
    });

    // Authentication logic here...
    
    logger.info('User login successful', { 
      userId: user.id, 
      email: user.email 
    });

    res.json({ success: true, user, token });
  } catch (error) {
    logger.error('Login failed', { 
      email, 
      error: error.message,
      stack: error.stack 
    });
    
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
}
```

## Monitoring Setup

### Application Performance Monitoring (APM)

Install and configure an APM solution like New Relic, DataDog, or Prometheus + Grafana.

#### Prometheus Setup

1. Install Prometheus:
   ```bash
   # Download Prometheus
   wget https://github.com/prometheus/prometheus/releases/download/v2.40.0/prometheus-2.40.0.linux-amd64.tar.gz
   tar xvfz prometheus-*.tar.gz
   cd prometheus-*
   ```

2. Configure Prometheus:
   ```yaml
   # prometheus.yml
   global:
     scrape_interval: 15s

   scrape_configs:
     - job_name: 'sml-library'
       static_configs:
         - targets: ['localhost:5000']
   ```

3. Add metrics endpoint to application:
   ```javascript
   // server/metrics.js
   const client = require('prom-client');

   // Create a Registry which registers the metrics
   const register = new client.Registry();

   // Add a default label which is added to all metrics
   register.setDefaultLabels({
     app: 'sml-library'
   });

   // Enable the collection of default metrics
   client.collectDefaultMetrics({ register });

   // Create custom metrics
   const httpRequestDuration = new client.Histogram({
     name: 'http_request_duration_seconds',
     help: 'Duration of HTTP requests in seconds',
     labelNames: ['method', 'route', 'status_code'],
     buckets: [0.1, 0.5, 1, 2, 5, 10]
   });

   register.registerMetric(httpRequestDuration);

   module.exports = { register, httpRequestDuration };
   ```

4. Add middleware to track requests:
   ```javascript
   // server/middleware/metrics.js
   const { httpRequestDuration } = require('../metrics');

   function metricsMiddleware(req, res, next) {
     const start = Date.now();
     
     res.on('finish', () => {
       const duration = (Date.now() - start) / 1000;
       httpRequestDuration.observe({
         method: req.method,
         route: req.route ? req.route.path : req.path,
         status_code: res.statusCode
       }, duration);
     });
     
     next();
   }

   module.exports = metricsMiddleware;
   ```

### Database Monitoring

#### MySQL Performance Monitoring

1. Enable slow query log:
   ```sql
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 2;
   SET GLOBAL slow_query_log_file = '/var/log/mysql/slow.log';
   ```

2. Monitor key metrics:
   - Connection usage
   - Query performance
   - Buffer pool efficiency
   - Lock wait times
   - Replication lag (if applicable)

3. Use MySQL Enterprise Monitor or open-source tools like:
   - Percona Monitoring and Management (PMM)
   - MySQL Workbench Performance Dashboard

### Infrastructure Monitoring

#### System Metrics

Monitor the following system metrics:

1. **CPU Usage**: Should not exceed 80% consistently
2. **Memory Usage**: Should not exceed 85% consistently
3. **Disk Usage**: Should not exceed 80% on any partition
4. **Network I/O**: Monitor for unusual traffic patterns
5. **Load Average**: Should be less than number of CPU cores

#### Docker Monitoring (if containerized)

If using Docker, monitor:

1. Container resource usage
2. Container health status
3. Container restarts
4. Image vulnerabilities
5. Volume usage

## Alerting Configuration

### Alert Thresholds

Set appropriate thresholds for different metrics:

#### Application Alerts
- **Error Rate**: > 5% for 5 minutes
- **Response Time**: > 2 seconds for 10 minutes
- **Availability**: < 99% for 5 minutes
- **Authentication Failures**: > 100 failed attempts in 1 minute

#### Database Alerts
- **Connection Usage**: > 85%
- **Slow Queries**: > 10 slow queries per minute
- **Replication Lag**: > 30 seconds
- **Disk Usage**: > 85%

#### Infrastructure Alerts
- **CPU Usage**: > 85% for 10 minutes
- **Memory Usage**: > 90% for 5 minutes
- **Disk Usage**: > 90%
- **Network Errors**: > 100 errors per minute

### Alert Channels

Configure alerts to be sent through multiple channels:

1. **Email**: For all critical alerts
2. **SMS**: For high-priority alerts
3. **Slack/Discord**: For team notifications
4. **PagerDuty**: For critical system alerts
5. **Webhook**: For integration with other systems

### Example Alert Configuration

```yaml
# alerts.yml (for Prometheus Alertmanager)
groups:
- name: sml-library-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
      description: "Error rate is above 5% for more than 5 minutes"

  - alert: HighResponseTime
    expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
    for: 10m
    labels:
      severity: warning
    annotations:
      summary: "High response time detected"
      description: "95th percentile response time is above 2 seconds"

  - alert: LowAvailability
    expr: up{job="sml-library"} == 0
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "Service is down"
      description: "Smart Library service is unavailable"
```

## Performance Monitoring

### Key Performance Indicators (KPIs)

Track the following KPIs:

1. **Response Time**: 95th percentile < 1 second
2. **Throughput**: > 100 requests/second
3. **Error Rate**: < 1%
4. **Availability**: > 99.9%
5. **Database Query Time**: 95th percentile < 100ms
6. **Page Load Time**: < 2 seconds for 95% of users

### Frontend Performance

Monitor frontend performance metrics:

1. **First Contentful Paint (FCP)**: < 1.8 seconds
2. **Largest Contentful Paint (LCP)**: < 2.5 seconds
3. **First Input Delay (FID)**: < 100 milliseconds
4. **Cumulative Layout Shift (CLS)**: < 0.1
5. **Time to Interactive (TTI)**: < 3.8 seconds

### Performance Testing

Regularly run performance tests:

1. **Load Testing**: Simulate expected concurrent users
2. **Stress Testing**: Determine breaking point
3. **Soak Testing**: Run for extended periods
4. **Spike Testing**: Handle sudden traffic increases

## Security Monitoring

### Security Events to Monitor

1. **Failed Login Attempts**: > 5 attempts in 1 minute
2. **Suspicious IP Addresses**: Multiple failed attempts from same IP
3. **Unusual Activity**: Access to admin functions from new locations
4. **File Upload Attempts**: Malicious file types
5. **SQL Injection Attempts**: Suspicious query patterns
6. **XSS Attempts**: Suspicious input patterns
7. **Rate Limiting Violations**: Excessive API calls
8. **Privilege Escalation**: Unauthorized access attempts

### Security Log Analysis

Implement log analysis for security events:

```javascript
// server/middleware/securityLogger.js
const logger = require('../utils/logger');

function securityLogger(req, res, next) {
  // Log suspicious patterns
  const suspiciousPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
    /(<script|javascript:|onerror=|onload=)/i,
    /\.\.\/|\.\.\\/g
  ];

  const requestData = JSON.stringify(req.body) + JSON.stringify(req.query);
  
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(requestData)) {
      logger.warn('Potential security threat detected', {
        pattern: pattern.toString(),
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        method: req.method
      });
    }
  }

  next();
}

module.exports = securityLogger;
```

## Database Monitoring

### MySQL Monitoring

Monitor these key MySQL metrics:

1. **Connection Pool**: Current connections vs max connections
2. **Query Performance**: Slow query log analysis
3. **Buffer Pool**: Hit ratio > 95%
4. **Table Locks**: Wait times and contention
5. **Replication**: Lag and status (if using replication)
6. **Disk I/O**: Read/write performance
7. **Memory Usage**: Buffer pool and other memory areas

### Query Optimization

Regularly analyze slow queries:

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;

-- Analyze slow queries
mysqldumpslow /var/log/mysql/slow.log

-- Use EXPLAIN to analyze query execution plan
EXPLAIN SELECT * FROM bookings WHERE user_id = 123;
```

### Index Monitoring

Monitor index usage:

```sql
-- Check unused indexes
SELECT * FROM sys.schema_unused_indexes;

-- Check index statistics
SELECT * FROM sys.index_statistics;
```

## Application Monitoring

### Health Checks

Implement comprehensive health checks:

```javascript
// server/routes/health.js
const express = require('express');
const db = require('../config/database');
const logger = require('../utils/logger');

const router = express.Router();

router.get('/health', async (req, res) => {
  const healthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV
  };

  try {
    // Check database connection
    await db.execute('SELECT 1');
    healthCheck.database = 'connected';
  } catch (error) {
    healthCheck.database = 'disconnected';
    healthCheck.status = 'error';
    logger.error('Database health check failed', { error: error.message });
  }

  // Check disk space
  try {
    const diskSpace = require('check-disk-space');
    const space = await diskSpace('/');
    healthCheck.disk = {
      free: space.free,
      size: space.size,
      used: space.size - space.free
    };
  } catch (error) {
    logger.warn('Disk space check failed', { error: error.message });
  }

  res.status(healthCheck.status === 'ok' ? 200 : 503).json(healthCheck);
});

module.exports = router;
```

### Business Metrics

Track important business metrics:

1. **User Registrations**: Daily/weekly/monthly
2. **Bookings**: Daily/weekly/monthly
3. **Revenue**: Daily/weekly/monthly
4. **Active Users**: Daily/weekly/monthly
5. **Conversion Rates**: Registration to booking
6. **Churn Rate**: Canceled subscriptions
7. **Support Tickets**: Open/closed rates

## Infrastructure Monitoring

### Server Monitoring

Monitor server-level metrics:

1. **CPU Usage**: Overall and per-core
2. **Memory Usage**: RAM and swap
3. **Disk I/O**: Read/write operations
4. **Network I/O**: Bandwidth usage
5. **Process Monitoring**: Application processes
6. **System Load**: Load averages
7. **Temperature**: Hardware temperature (for physical servers)

### Container Monitoring (Docker/Kubernetes)

If using containers:

1. **Container Health**: Running vs stopped
2. **Resource Usage**: CPU, memory, disk per container
3. **Network**: Container network I/O
4. **Logs**: Container log aggregation
5. **Restart Policies**: Container restart events
6. **Image Security**: Vulnerability scanning

## Log Management

### Centralized Logging

Implement centralized log management using tools like:

1. **ELK Stack** (Elasticsearch, Logstash, Kibana)
2. **Fluentd + Elasticsearch + Kibana**
3. **Splunk**
4. **Datadog Logs**
5. **Papertrail**

### Log Rotation

Implement log rotation to prevent disk space issues:

```bash
# /etc/logrotate.d/sml-library
/var/log/sml-library/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload sml-library
    endscript
}
```

### Log Retention

Define log retention policies:

1. **Error Logs**: 90 days
2. **Access Logs**: 30 days
3. **Debug Logs**: 7 days
4. **Audit Logs**: 365 days (for compliance)

### Log Analysis

Implement automated log analysis:

```javascript
// server/utils/logAnalyzer.js
const fs = require('fs');
const path = require('path');

class LogAnalyzer {
  constructor(logPath) {
    this.logPath = logPath;
  }

  async analyzeErrors() {
    const errorLog = path.join(this.logPath, 'error.log');
    const content = fs.readFileSync(errorLog, 'utf8');
    
    // Parse and analyze error patterns
    const errors = content.split('\n')
      .filter(line => line.includes('"level":"error"'))
      .map(line => JSON.parse(line));
    
    // Group by error type
    const errorGroups = {};
    errors.forEach(error => {
      const key = error.message || 'Unknown Error';
      if (!errorGroups[key]) {
        errorGroups[key] = [];
      }
      errorGroups[key].push(error);
    });
    
    return errorGroups;
  }
  
  async generateReport() {
    const errors = await this.analyzeErrors();
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: Object.values(errors).reduce((sum, group) => sum + group.length, 0),
      errorTypes: Object.keys(errors).length,
      topErrors: Object.entries(errors)
        .sort(([,a], [,b]) => b.length - a.length)
        .slice(0, 10)
        .map(([message, instances]) => ({ message, count: instances.length }))
    };
    
    return report;
  }
}

module.exports = LogAnalyzer;
```

## Dashboard Configuration

### Monitoring Dashboards

Create comprehensive dashboards for different stakeholder groups:

#### Operations Dashboard
- System health status
- Application performance metrics
- Database performance
- Error rates and trends
- Resource utilization

#### Business Dashboard
- User registration trends
- Booking statistics
- Revenue metrics
- Conversion rates
- Support ticket volume

#### Security Dashboard
- Failed login attempts
- Security events
- Suspicious activity
- Access patterns
- Compliance metrics

### Example Dashboard Configuration (Grafana)

```json
{
  "dashboard": {
    "title": "Smart Library - Application Overview",
    "panels": [
      {
        "title": "Application Uptime",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"sml-library\"}",
            "legendFormat": "Uptime"
          }
        ]
      },
      {
        "title": "HTTP Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time (95th Percentile)",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "Response Time"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
            "legendFormat": "5xx Errors"
          }
        ]
      }
    ]
  }
}
```

## Best Practices

### Logging Best Practices

1. **Use Structured Logging**: JSON format for easy parsing
2. **Include Context**: Request ID, user ID, session ID
3. **Avoid Sensitive Data**: Never log passwords or PII
4. **Use Appropriate Levels**: Don't over-log or under-log
5. **Correlate Logs**: Use request IDs to trace requests
6. **Rotate Logs**: Prevent disk space issues
7. **Centralize Logs**: Aggregate from all sources
8. **Monitor Logs**: Set up alerts for critical events

### Monitoring Best Practices

1. **Monitor Business Metrics**: Not just technical metrics
2. **Set Realistic Thresholds**: Avoid alert fatigue
3. **Use Multiple Data Sources**: Correlate different metrics
4. **Implement Redundancy**: Multiple monitoring systems
5. **Regular Review**: Update thresholds and alerts
6. **Document Everything**: Runbooks and procedures
7. **Test Alerts**: Regular alert testing
8. **Capacity Planning**: Monitor trends for scaling

### Alerting Best Practices

1. **Prioritize Alerts**: Critical vs warning vs info
2. **Avoid Alert Storms**: Group related alerts
3. **Clear Descriptions**: Actionable alert messages
4. **Escalation Policies**: Who to notify and when
5. **Silence Mechanisms**: For planned maintenance
6. **Regular Tuning**: Adjust thresholds based on history
7. **Post-Mortems**: Learn from incidents
8. **On-Call Rotations**: Clear responsibility assignments

### Performance Best Practices

1. **Baseline Performance**: Know normal performance
2. **Continuous Monitoring**: Always-on performance tracking
3. **Proactive Optimization**: Don't wait for problems
4. **User Experience Focus**: Monitor from user perspective
5. **Root Cause Analysis**: Deep dive into performance issues
6. **Capacity Planning**: Plan for growth
7. **Performance Budgets**: Set limits for page load times
8. **Regular Testing**: Performance regression testing

This monitoring and logging guide provides a comprehensive framework for maintaining the reliability, performance, and security of the Smart Library Booking System. Regular review and updates to this guide will ensure continued effectiveness as the system evolves.