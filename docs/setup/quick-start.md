# 🚀 Restaurant Platform - Quick Start Guide

## Prerequisites
- **Node.js**: 18+ LTS
- **PostgreSQL**: 15+
- **npm or yarn**: Latest version
- **Git**: For version control

---

## ⚡ Quick Setup (5 Minutes)

### 1. Clone & Install
```bash
# Clone the repository
git clone <your-repository-url>
cd restaurant-platform-remote

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup
```bash
# Create database
createdb restaurant_dashboard_dev

# Apply schema
psql restaurant_dashboard_dev < database/restaurant_platform_current_schema.sql

# Verify tables created
psql restaurant_dashboard_dev -c "\dt"
```

### 3. Environment Configuration
```bash
# Backend environment
cp backend/.env.example backend/.env

# Edit backend/.env with your settings:
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/restaurant_dashboard_dev"
JWT_SECRET="your-super-secret-jwt-key-here"
PORT=3001

# Frontend environment  
cp frontend/.env.example frontend/.env.local

# Edit frontend/.env.local:
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 4. Start Development Servers
```bash
# Terminal 1 - Backend
cd backend
PORT=3001 npm run start:dev

# Terminal 2 - Frontend
cd frontend  
PORT=3000 npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

---

## 🎯 First Login

### Default Super Admin Account
```
Email: admin@restaurant-platform.com
Password: admin123
```

> ⚠️ **Security**: Change default credentials immediately in production!

---

## 📊 Verify Installation

### Check Backend Health
```bash
curl http://localhost:3001/health
# Expected: {"status": "ok", "timestamp": "..."}
```

### Check Database Connection
```bash
curl http://localhost:3001/companies
# Expected: {"companies": [...]}
```

### Check Frontend
Visit http://localhost:3000 - you should see the login page.

---

## 🛠️ Development Workflow

### Daily Development
```bash
# Pull latest changes
git pull origin main

# Start backend
cd backend && PORT=3001 npm run start:dev

# Start frontend (new terminal)
cd frontend && PORT=3000 npm run dev
```

### Running Tests
```bash
# Backend tests
cd backend
npm test                    # Unit tests
npm run test:e2e           # Integration tests

# Frontend tests
cd frontend
npm test                   # Component tests
npm run test:coverage      # With coverage
```

### Code Quality
```bash
# Linting
npm run lint               # Check for issues
npm run lint:fix          # Auto-fix issues

# Type checking
npm run type-check         # TypeScript validation
```

---

## 🗄️ Database Management

### Backup Database
```bash
pg_dump restaurant_dashboard_dev > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database
```bash
dropdb restaurant_dashboard_dev
createdb restaurant_dashboard_dev
psql restaurant_dashboard_dev < backup_file.sql
```

### Reset Database
```bash
# WARNING: This will delete all data!
psql restaurant_dashboard_dev < database/restaurant_platform_current_schema.sql
```

---

## 🐛 Common Issues & Solutions

### Issue: Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>

# Or use different ports
PORT=3002 npm run dev
```

### Issue: Database Connection Failed
```bash
# Check PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL
sudo service postgresql start

# Check connection
psql -h localhost -U postgres -d restaurant_dashboard_dev
```

### Issue: Node Version Mismatch
```bash
# Check Node version
node --version

# Install Node 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Issue: Permission Errors
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) node_modules/
```

---

## 🌟 Development Tips

### Hot Reloading
- **Backend**: Auto-restarts on file changes
- **Frontend**: Auto-refreshes browser on changes
- **Database**: Use migration files for schema changes

### Debugging
```bash
# Backend debugging
cd backend
npm run start:debug

# Frontend debugging
cd frontend
npm run dev -- --inspect
```

### Environment Variables
```bash
# Check loaded environment variables
cd backend && npm run env

# Validate configuration
cd backend && npm run config:validate
```

---

## 📚 Next Steps

### Learn the System
1. **Read Project Overview**: `/docs/project-overview.md`
2. **API Documentation**: `/docs/api/README.md`
3. **Database Schema**: `/docs/database-schema.md`

### Start Developing
1. **Explore the codebase** in VS Code
2. **Run the test suite** to understand functionality
3. **Create your first feature** following existing patterns

### Production Deployment
1. **Review Security**: Change default passwords
2. **Environment Setup**: Production environment variables
3. **Database Migration**: Apply schema to production DB

---

## 🆘 Get Help

### Documentation
- **Project Overview**: Complete system architecture
- **API Docs**: All available endpoints
- **Database Schema**: Table structure and relationships

### Development Support
- **GitHub Issues**: Bug reports and feature requests
- **Code Comments**: Inline documentation in codebase
- **TypeScript**: Full type definitions for guidance

---

**Setup Time**: ~5 minutes  
**Total Development Setup**: ~10 minutes  
**First Feature**: Ready to build! 🎉