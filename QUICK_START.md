# Quick Start Guide

This repository contains a complete restaurant platform with all dependencies and build files for immediate development.

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Git

## Quick Setup (1 minute)

1. **Clone the repository:**
```bash
git clone https://github.com/psdew2ewqws/restaurant-platform.git
cd restaurant-platform
```

2. **Install any missing native dependencies:**
```bash
cd backend && npm install --prefer-offline
cd ../frontend && npm install --prefer-offline
```

3. **Setup database and environment:**
```bash
# Backend setup
cd backend
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma generate
npx prisma db push

# Start backend
npm run start:dev
```

4. **Start frontend (new terminal):**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local if needed

# Start frontend
npm run dev
```

## Access URLs

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database required: PostgreSQL

## Features Included

✅ **Complete Restaurant Management Platform**
- Multi-tenant company system
- User management with role-based access
- Menu management with categories and products
- Advanced modifiers/add-ons system
- Image upload and optimization
- Multi-language support (English/Arabic)
- Platform-specific pricing (Talabat, Careem, etc.)

✅ **Technical Stack**
- Backend: NestJS + TypeScript + Prisma + PostgreSQL
- Frontend: Next.js + React + TypeScript + Tailwind CSS
- Authentication: JWT with refresh tokens
- File Storage: Database with optimization

✅ **Development Ready**
- Hot reload for both frontend and backend
- Complete TypeScript support
- ESLint and Prettier configured
- Database migrations and seeding

## Troubleshooting

If you encounter any issues:

1. **Missing .node files:** Run `npm install` in both directories
2. **Database connection:** Verify PostgreSQL is running and credentials in .env
3. **Port conflicts:** Change ports in package.json scripts if needed

The project includes all source code and most dependencies for immediate development!