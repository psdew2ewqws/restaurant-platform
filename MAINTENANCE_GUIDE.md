# Maintenance Guide - Restaurant Platform System

## Overview
This guide provides comprehensive information for maintaining, monitoring, and troubleshooting the Restaurant Platform system.

---

## 1. System Monitoring

### 1.1 Health Check Endpoints
Monitor these endpoints regularly to ensure system health:

```bash
# Backend Health Check
curl http://localhost:3001/api/v1/health
# Expected: {"status":"ok","timestamp":"...","service":"restaurant-platform-backend","version":"1.0.0"}

# Database Connectivity Test
PGPASSWORD='E$$athecode006' psql -h localhost -U postgres -d postgres -c "SELECT 1;"
# Expected: Returns 1
```

### 1.2 Service Status Monitoring
**Check Running Services**:
```bash
# Check if backend is running on port 3001
lsof -i :3001

# Check if frontend is running  
ps aux | grep "npm run dev"

# Check PostgreSQL status
systemctl status postgresql
```

### 1.3 Log Monitoring
**Key Log Locations**:
- Backend logs: Console output from NestJS server
- Database logs: PostgreSQL logs (typically in `/var/log/postgresql/`)
- Frontend logs: Browser console and Next.js output

**Log Patterns to Watch**:
```bash
# Error patterns to monitor
grep -i "error\|failed\|exception" /path/to/logs

# Database connection issues
grep -i "connection\|timeout\|refused" /path/to/logs

# Authentication failures
grep -i "unauthorized\|invalid token\|login failed" /path/to/logs
```

---

## 2. Database Maintenance

### 2.1 Database Connection Management
**Connection Details**:
- Host: localhost:5432
- Database: postgres
- User: postgres
- Password: `E$$athecode006` ⚠️ **CRITICAL - DO NOT USE E$$athecode007**

**Connection Testing**:
```bash
# Test connection
PGPASSWORD='E$$athecode006' psql -h localhost -U postgres -d postgres

# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check database size
SELECT pg_size_pretty(pg_database_size('postgres'));
```

### 2.2 Database Backup Procedures
```bash
# Create backup
PGPASSWORD='E$$athecode006' pg_dump -h localhost -U postgres postgres > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
PGPASSWORD='E$$athecode006' psql -h localhost -U postgres postgres < backup_file.sql
```

### 2.3 Database Performance Monitoring
```sql
-- Check slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename, pg_size_pretty(size) as size
FROM (
  SELECT schemaname, tablename, pg_total_relation_size(schemaname||'.'||tablename) as size
  FROM pg_tables
) t
ORDER BY size DESC
LIMIT 10;

-- Check connection activity
SELECT state, count(*) 
FROM pg_stat_activity 
GROUP BY state;
```

---

## 3. Application Maintenance

### 3.1 Backend Server Management
**Starting/Stopping Services**:
```bash
# Start backend (in /backend directory)
npm run start:dev

# Start in production mode
npm run start:prod

# Stop background processes
pkill -f "nest start"
```

**Configuration Files to Monitor**:
- `/backend/.env` - Environment variables
- `/backend/package.json` - Dependencies
- `/backend/prisma/schema.prisma` - Database schema

### 3.2 Frontend Server Management
```bash
# Start frontend (in /frontend directory)
npm run dev

# Build for production
npm run build
npm run start

# Stop development server
Ctrl+C or pkill -f "next dev"
```

### 3.3 Dependency Management
```bash
# Check for outdated packages (backend)
cd /backend && npm audit

# Update packages
npm update

# Check security vulnerabilities
npm audit fix

# Same for frontend
cd /frontend && npm audit && npm update
```

---

## 4. API Monitoring & Troubleshooting

### 4.1 API Endpoint Health Checks
**Critical Endpoints to Monitor**:
```bash
# Authentication
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"emailOrUsername":"admin@restaurantplatform.com","password":"test123"}'

# Menu Categories (requires token)
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/v1/menu/categories

# Company Management
curl -H "Authorization: Bearer <token>" \
  http://localhost:3001/api/v1/companies/my
```

### 4.2 Common API Issues & Solutions

#### Issue: 401 Unauthorized
**Symptoms**: APIs returning `{"message":"Invalid token","error":"Unauthorized","statusCode":401}`
**Solutions**:
1. Check JWT token validity
2. Verify token format: `Bearer <token>`
3. Check token expiration (default 24h)
4. Verify user account is active

#### Issue: Database Connection Errors
**Symptoms**: `connection to server failed` or `ECONNREFUSED`
**Solutions**:
1. Verify PostgreSQL is running: `systemctl status postgresql`
2. Check connection string in `.env`
3. Verify password is `E$$athecode006`
4. Test manual connection: `psql -h localhost -U postgres -d postgres`

#### Issue: TypeScript Compilation Warnings
**Symptoms**: 21 TypeScript warnings during startup
**Status**: Non-blocking, system remains functional
**Solutions**: 
- Fix type definitions gradually
- Priority: Medium (address before production)

### 4.3 Performance Monitoring
**Response Time Benchmarks**:
- Health check: <10ms
- Authentication: <200ms
- Menu categories: <50ms
- Database queries: <100ms

**Performance Testing**:
```bash
# Test response times
time curl http://localhost:3001/api/v1/health

# Load testing (install apache bench)
ab -n 100 -c 10 http://localhost:3001/api/v1/health
```

---

## 5. User Management

### 5.1 Test User Account
**Primary Admin Account**:
- Email: `admin@restaurantplatform.com`
- Password: `test123`
- Role: `super_admin`
- Company: Default Restaurant (`dc3c6a10-96c6-4467-9778-313af66956af`)
- Branch: Main Office (`40f863e7-b719-4142-8e94-724572002d9b`)

### 5.2 User Troubleshooting
**Reset Password** (via database):
```sql
-- Update password (use bcrypt hash)
UPDATE "User" SET password = 'new_bcrypt_hash' WHERE email = 'user@example.com';
```

**Unlock Account**:
```sql
-- Reset login attempts
UPDATE "User" SET "loginAttempts" = 0, "lockedUntil" = NULL WHERE email = 'user@example.com';
```

---

## 6. Multi-Tenant System Maintenance

### 6.1 Company Data Isolation
**Verify Data Isolation**:
```sql
-- Check company data separation
SELECT "companyId", COUNT(*) FROM "MenuCategory" GROUP BY "companyId";

-- Verify user-company associations
SELECT u.email, u.role, c.name as company_name 
FROM "User" u 
JOIN "Company" c ON u."companyId" = c.id;
```

### 6.2 Company Management
**Add New Company**:
```sql
INSERT INTO "Company" (id, name, slug, "businessType", timezone, "defaultCurrency", status)
VALUES (gen_random_uuid(), 'New Restaurant', 'new-restaurant', 'restaurant', 'Asia/Amman', 'JOD', 'active');
```

---

## 7. Security Maintenance

### 7.1 Token Management
**JWT Configuration** (in `.env`):
```
JWT_SECRET="your-super-secret-jwt-key-change-in-production-2024"
JWT_EXPIRES_IN="24h"
JWT_REFRESH_SECRET="your-refresh-secret-key-production-ready-2024-secure"
JWT_REFRESH_EXPIRES_IN="7d"
```

### 7.2 Security Monitoring
**Check for suspicious activity**:
```sql
-- Monitor login attempts
SELECT email, "loginAttempts", "lockedUntil" 
FROM "User" 
WHERE "loginAttempts" > 3;

-- Check recent login activities
SELECT email, "lastLoginAt", "lastLoginIp"
FROM "User"
ORDER BY "lastLoginAt" DESC
LIMIT 20;
```

---

## 8. Backup & Recovery

### 8.1 Backup Strategy
**Daily Backups**:
```bash
#!/bin/bash
# Daily backup script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Database backup
PGPASSWORD='E$$athecode006' pg_dump -h localhost -U postgres postgres > $BACKUP_DIR/db_$DATE.sql

# Code backup (if needed)
tar -czf $BACKUP_DIR/code_$DATE.tar.gz /home/admin/restaurant-platform-remote-v2

# Cleanup old backups (keep 7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
```

### 8.2 Recovery Procedures
**Database Recovery**:
```bash
# Stop application
pkill -f "nest start"

# Restore database
PGPASSWORD='E$$athecode006' psql -h localhost -U postgres postgres < backup_file.sql

# Restart application
cd /backend && npm run start:dev
```

---

## 9. Monitoring Alerts

### 9.1 Critical Alerts
Set up monitoring for:
1. **Service Down**: Backend not responding on port 3001
2. **Database Connection**: PostgreSQL connection failures
3. **High Error Rate**: >5% of API requests returning errors
4. **Authentication Failures**: Multiple failed login attempts

### 9.2 Warning Alerts
1. **Response Time**: API responses >500ms
2. **Database Size**: Database growing >10GB
3. **Memory Usage**: Application using >2GB RAM
4. **Disk Space**: <10% free space remaining

---

## 10. Troubleshooting Common Issues

### 10.1 "Port already in use" Error
```bash
# Find process using port 3001
lsof -i :3001

# Kill process
kill -9 <PID>

# Or kill all node processes
pkill node
```

### 10.2 "Cannot connect to database"
```bash
# Check PostgreSQL status
systemctl status postgresql

# Start PostgreSQL
sudo systemctl start postgresql

# Check connection manually
PGPASSWORD='E$$athecode006' psql -h localhost -U postgres -d postgres
```

### 10.3 "Invalid token" Errors
1. Check token expiration (JWT expires in 24h)
2. Verify Authorization header format: `Bearer <token>`
3. Check JWT secret in `.env` file
4. Regenerate token by logging in again

### 10.4 Menu Categories Not Loading
1. Verify authentication token is valid
2. Check user has proper company association
3. Verify database contains categories for user's company
4. Check API endpoint response: `GET /api/v1/menu/categories`

---

## 11. Version Control & Deployment

### 11.1 Git Management
```bash
# Check current branch and status
git status
git branch

# Check recent commits
git log --oneline -10

# Check for uncommitted changes
git diff
```

### 11.2 Environment Configuration
**Critical Environment Files**:
- `/backend/.env` - Backend configuration
- `/frontend/.env.local` - Frontend configuration (if exists)

**Never commit**:
- `.env` files containing passwords
- `node_modules/` directories
- Database backup files

---

## Emergency Contacts & Procedures

### System Administrator Responsibilities
1. **Daily**: Check system health and logs
2. **Weekly**: Review performance metrics and security
3. **Monthly**: Update dependencies and security patches
4. **Quarterly**: Full system backup and recovery test

### Emergency Shutdown Procedure
```bash
# Graceful shutdown
pkill -f "npm run dev"
pkill -f "nest start"

# Emergency shutdown
pkill -9 node

# Stop database (if needed)
sudo systemctl stop postgresql
```

### System Recovery Checklist
1. ✅ Verify database is running
2. ✅ Check database connection with correct password
3. ✅ Start backend server
4. ✅ Start frontend server
5. ✅ Test authentication endpoint
6. ✅ Test menu categories endpoint
7. ✅ Verify user can log in via frontend

---

**Document Version**: 1.0  
**Last Updated**: September 9, 2025  
**Review Schedule**: Monthly  
**Next Review**: October 9, 2025