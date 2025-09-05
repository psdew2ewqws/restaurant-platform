# GitHub Deployment Guide

This guide provides step-by-step instructions for deploying the Restaurant Platform Enterprise v2.0 to GitHub and setting up team collaboration.

## Table of Contents

- [Pre-deployment Checklist](#pre-deployment-checklist)
- [GitHub Repository Setup](#github-repository-setup)
- [Team Onboarding](#team-onboarding)
- [Development Workflow](#development-workflow)
- [CI/CD Pipeline](#cicd-pipeline)
- [Production Deployment](#production-deployment)

## Pre-deployment Checklist

Before deploying to GitHub, ensure all the following items are completed:

### ✅ Code Organization
- [x] Backend organized into domain-driven structure
- [x] Frontend organized into feature-based structure
- [x] Shared utilities properly separated
- [x] Import paths updated for new structure

### ✅ Configuration
- [x] Environment templates created (`.env.example`)
- [x] Docker configurations ready
- [x] CI/CD pipeline configured
- [x] Database migrations included

### ✅ Documentation
- [x] Comprehensive README.md
- [x] Architecture documentation
- [x] API documentation
- [x] Setup guides

### ✅ Security
- [x] Sensitive data removed from repository
- [x] Proper `.gitignore` configured
- [x] Environment variables documented
- [x] Security best practices implemented

## GitHub Repository Setup

### 1. Create GitHub Repository

```bash
# Option A: Create via GitHub CLI
gh repo create restaurant-platform-enterprise --public --description "Enterprise-grade restaurant management platform"

# Option B: Create via GitHub web interface
# Go to https://github.com/new and create repository
```

### 2. Initialize Git Repository

```bash
cd /home/admin/restaurant-platform-remote-v2

# Initialize git if not already done
git init

# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/restaurant-platform-enterprise.git

# Create main branch
git checkout -b main
```

### 3. Configure Git Settings

```bash
# Configure git user (if not already configured)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Configure pull strategy
git config pull.rebase false
```

### 4. Create Branch Protection Rules

Set up branch protection via GitHub web interface:

1. Go to repository **Settings** → **Branches**
2. Add rule for `main` branch:
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### 5. Initial Commit and Push

```bash
# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Enterprise-grade restaurant platform v2.0

- Domain-driven backend architecture
- Feature-based frontend structure
- Complete database with 546+ locations
- Multi-tenant support with RBAC
- Delivery integration (Talabat, Careem)
- Advanced printing system
- Real-time analytics
- Comprehensive documentation

🚀 Ready for team collaboration"

# Push to GitHub
git push -u origin main
```

## Team Onboarding

### Setting Up Development Environment

Share this onboarding checklist with new team members:

#### Prerequisites Installation
```bash
# 1. Install Node.js 18+
curl -fsSL https://nodejs.org/dist/v18.17.0/node-v18.17.0-linux-x64.tar.xz | tar -xJ

# 2. Install PostgreSQL 15+
sudo apt update
sudo apt install postgresql postgresql-contrib

# 3. Install Docker (optional)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

#### Project Setup
```bash
# 1. Clone repository
git clone https://github.com/YOUR_USERNAME/restaurant-platform-enterprise.git
cd restaurant-platform-enterprise

# 2. Install backend dependencies
cd backend
npm install
cd ..

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Database setup
# Create database
sudo -u postgres createdb restaurant_platform

# Import data
sudo -u postgres psql restaurant_platform < database/database_complete.sql

# 5. Environment configuration
cp .env.example .env
# Edit .env with your database credentials

cp backend/.env.example backend/.env
# Edit backend/.env with your settings

cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with API endpoints
```

#### Start Development
```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### Access Credentials

Default login credentials for development:
- **Super Admin**: admin@restaurant.com / password123
- **Company Owner**: owner@example.com / password123
- **Branch Manager**: manager@branch.com / password123

(These are documented in `database/LOGIN_CREDENTIALS.md`)

## Development Workflow

### Branch Strategy

We use **Git Flow** with the following branches:

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - Individual feature development
- `hotfix/*` - Critical production fixes
- `release/*` - Release preparation

### Feature Development Workflow

1. **Create Feature Branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```

2. **Development**
   ```bash
   # Make your changes
   git add .
   git commit -m "feat: add user management interface

   - Add user creation form
   - Implement role-based permissions
   - Add user status management
   
   Closes #123"
   ```

3. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   
   # Create pull request via GitHub CLI
   gh pr create --title "Add user management interface" --body "Description of changes"
   ```

4. **Code Review Process**
   - Automated CI/CD checks must pass
   - At least 1 code review required
   - All conversations must be resolved
   - Branch must be up-to-date with target branch

5. **Merge and Cleanup**
   ```bash
   # After PR approval and merge
   git checkout develop
   git pull origin develop
   git branch -d feature/your-feature-name
   ```

### Commit Message Convention

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add JWT token refresh mechanism
fix(menu): resolve image upload validation issue
docs(api): update authentication endpoint documentation
```

## CI/CD Pipeline

Our CI/CD pipeline automatically:

### On Pull Request
1. **Linting & Type Checking**
   - ESLint for code quality
   - TypeScript compilation
   - Prettier formatting check

2. **Testing**
   - Unit tests (Backend & Frontend)
   - Integration tests (Backend)
   - Component tests (Frontend)

3. **Security Scanning**
   - Dependency vulnerability audit
   - CodeQL static analysis
   - Security best practices check

4. **Build Verification**
   - Backend production build
   - Frontend production build
   - Docker image build test

### On Merge to Main/Develop
1. **All PR checks pass**
2. **Docker Image Build & Push**
   - Build optimized production images
   - Push to GitHub Container Registry
   - Tag with branch and commit SHA

3. **Deployment**
   - `develop` → Staging environment
   - `main` → Production environment

### Pipeline Status

Monitor pipeline status:
- GitHub Actions tab in repository
- Status checks on pull requests
- Slack notifications (if configured)

## Production Deployment

### Deployment Options

#### Option 1: Docker Compose (Recommended for small to medium setups)

```bash
# 1. Clone repository on production server
git clone https://github.com/YOUR_USERNAME/restaurant-platform-enterprise.git
cd restaurant-platform-enterprise

# 2. Configure production environment
cp .env.example .env
# Edit .env with production values

# 3. Deploy with Docker Compose
docker-compose up -d

# 4. Verify deployment
docker-compose logs -f
```

#### Option 2: Kubernetes (Enterprise/Scale)

```bash
# 1. Apply Kubernetes manifests
kubectl apply -f deploy/kubernetes/

# 2. Verify deployment
kubectl get pods -n restaurant-platform
kubectl get services -n restaurant-platform
```

#### Option 3: Cloud Platforms

**AWS ECS/Fargate:**
- Use provided ECS task definitions
- Configure Application Load Balancer
- Set up RDS for PostgreSQL

**Google Cloud Run:**
- Deploy containerized services
- Configure Cloud SQL for PostgreSQL
- Set up Cloud Load Balancing

**Azure Container Instances:**
- Deploy using Azure Container Registry
- Configure Azure Database for PostgreSQL
- Set up Application Gateway

### Production Environment Variables

Critical production environment variables:

```bash
# Security
JWT_SECRET=your-super-secure-production-jwt-secret-minimum-256-bits
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@prod-db-host:5432/restaurant_platform

# External Services
TALABAT_API_KEY=production-talabat-api-key
CAREEM_API_KEY=production-careem-api-key

# Monitoring
LOG_LEVEL=warn
ENABLE_METRICS=true
```

### Health Checks

Set up monitoring endpoints:
- **Backend Health**: `GET /health`
- **Database Health**: `GET /health/db`
- **External Services**: `GET /health/external`

### Backup Strategy

1. **Database Backups**
   ```bash
   # Automated daily backups
   pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
   ```

2. **File Storage Backups**
   ```bash
   # Backup uploaded files
   tar -czf uploads-backup-$(date +%Y%m%d).tar.gz uploads/
   ```

## Monitoring and Maintenance

### Application Monitoring
- **Uptime Monitoring**: Ping health endpoints
- **Performance Monitoring**: Response time tracking
- **Error Tracking**: Application error logging
- **Resource Usage**: CPU, Memory, Disk usage

### Log Management
- **Structured Logging**: JSON format logs
- **Log Aggregation**: ELK Stack or similar
- **Log Retention**: 30-90 days depending on requirements

### Security Updates
- **Dependency Updates**: Monthly security patches
- **Docker Image Updates**: Base image security updates
- **SSL Certificate Renewal**: Automated renewal setup

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# TypeScript compilation errors
npx tsc --noEmit --skipLibCheck
```

#### Database Connection Issues
```bash
# Check database connectivity
pg_isready -h localhost -p 5432

# Verify credentials
psql $DATABASE_URL -c "SELECT version();"

# Run migrations
npx prisma migrate deploy
```

#### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Check container logs
docker-compose logs backend
docker-compose logs frontend
```

### Getting Help

1. **Check Documentation**: `docs/` directory
2. **Search Issues**: GitHub repository issues
3. **Create Issue**: Use provided issue templates
4. **Team Chat**: Development team communication channels

## Next Steps

After successful deployment:

1. **Set up monitoring** and alerting
2. **Configure automated backups**
3. **Implement security scanning** in CI/CD
4. **Set up performance monitoring**
5. **Plan regular maintenance windows**

---

**Congratulations!** 🎉 

Your Restaurant Platform Enterprise v2.0 is now deployed and ready for team collaboration. The enterprise-grade architecture will support your growth and scaling needs.

For additional support, please refer to the comprehensive documentation in the `docs/` directory or contact the development team.