# 🍽️ Restaurant Platform - Remote Collaboration

## Quick Start for Both Developers

### Prerequisites
- VS Code with Live Share Extension Pack
- Node.js 18+
- Git configured with your GitHub account

### Daily Workflow
1. `git pull origin main`
2. Open VS Code: `code .`
3. Start/Join Live Share session
4. Code together in real-time!

### Database Connection
See .env.example for database configuration

### Communication
- VS Code Live Share: Real-time chat + voice
- GitHub Issues: Task tracking
- Shared terminals and debugging

## Project Structure

```
restaurant-platform/
├── backend/          # NestJS API
├── frontend/         # Next.js Admin Panel  
├── shared/           # TypeScript types
├── database/         # Migrations & seeds
├── docs/            # Documentation
└── .vscode/         # Shared VS Code settings
```

## Technology Stack

- **Backend**: NestJS (TypeScript)
- **Frontend**: Next.js 14 (React 18)
- **Database**: PostgreSQL 15
- **Auth**: JWT + Multi-tenant
- **Real-time**: Socket.io
- **Styling**: Tailwind CSS

## Getting Started

1. Both developers clone this repository
2. Install VS Code Live Share Extension Pack
3. One developer starts Live Share session
4. Other developer joins via shared link
5. Code together in real-time!