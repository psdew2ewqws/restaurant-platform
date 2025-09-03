# 🤝 Daily Collaboration Guide

## Before You Start

### Required VS Code Extensions (Both Developers)
```bash
# Install these extensions in VS Code:
# Ctrl+Shift+X then search and install:

1. Live Share Extension Pack (Microsoft)
2. GitLens — Git supercharged (GitKraken)  
3. Remote Repositories (Microsoft)
4. Prettier - Code formatter
5. TypeScript Importer
6. Prisma (for database)
```

## Daily Startup Routine

### 🌅 Morning (Both Developers)

1. **Pull Latest Changes**
```bash
git pull origin main
```

2. **Start VS Code**
```bash
code .
```

3. **Developer A: Start Live Share Session**
- Press `Ctrl+Shift+P`
- Type "Live Share: Start Collaboration Session"
- Copy the shared link
- Send link to Developer B via message

4. **Developer B: Join Live Share Session**
- Click the shared link from Developer A
- Or press `Ctrl+Shift+P` → "Live Share: Join Collaboration Session"
- Paste the link

## Real-Time Collaboration Features

### ✅ What You Can Do Together
- **See each other's cursors** and selections
- **Edit the same file simultaneously**
- **Share terminals** (both can run commands)
- **Debug together** (shared breakpoints)
- **Voice/text chat** built into VS Code
- **Screen sharing** for complex debugging

### 🔄 File Management
```bash
# Always sync before starting work
git pull origin main

# Regular commits (every hour or feature)
git add .
git commit -m "Add user authentication logic"
git push origin main

# Teammate pulls your changes
git pull origin main
```

## Communication During Development

### Built-in Live Share Chat
- Click the Live Share icon in VS Code sidebar
- Use text chat for quick messages
- Use voice chat for discussions
- Share screens when debugging

### Task Assignment Strategy
```bash
# Example division:
Developer A: Backend API development
Developer B: Frontend UI components

# OR rotate daily:
Morning: Developer A leads, B assists
Afternoon: Developer B leads, A assists
```

## End of Day Routine

### 🌙 Evening Checklist (Both Developers)

1. **Commit and Push Work**
```bash
git add .
git commit -m "End of day - user management progress"
git push origin main
```

2. **Stop Live Share Session**
- VS Code → Stop collaboration session

3. **Update Progress**
- Quick sync on what was accomplished
- Plan next day's work

## Project Setup Commands

### First Time Setup (Both Developers)

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/restaurant-platform.git
cd restaurant-platform

# 2. Install root dependencies
npm install

# 3. Install backend dependencies
cd backend && npm install && cd ..

# 4. Install frontend dependencies  
cd frontend && npm install && cd ..

# 5. Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 6. Set up database (if using local PostgreSQL)
npm run db:generate
npm run db:migrate
```

### Development Commands (Daily Use)

```bash
# Start both backend and frontend
npm run dev

# Or start individually:
npm run dev:backend  # Starts NestJS API on :3001
npm run dev:frontend # Starts Next.js on :3000

# Database operations
npm run db:migrate   # Run migrations
npm run db:generate  # Generate Prisma client
npm run db:seed     # Seed with sample data

# Testing
npm run test        # Run all tests
npm run lint        # Check code style
```

## Troubleshooting Live Share

### Common Issues & Solutions

**"Cannot start collaboration session"**
```bash
# Solution: Restart VS Code and try again
# Or sign out and sign back in to Live Share
```

**"Cannot see teammate's changes"**
```bash
# Solution: Both developers restart Live Share session
# Make sure you're both in the same workspace folder
```

**"Git conflicts when pulling"**
```bash
# Solution: Communicate before pulling
git stash           # Save your work temporarily
git pull origin main
git stash pop       # Restore your work
# Resolve conflicts manually if needed
```

## Best Practices

### 🎯 Coding Together Effectively

1. **Communicate your intentions**
   - "I'm about to refactor the auth service"
   - "Can you check the database connection while I work on UI?"

2. **Use descriptive commit messages**
   - ✅ "Add JWT authentication with refresh tokens"
   - ❌ "Fix stuff"

3. **Test before committing**
   ```bash
   npm run test
   npm run lint
   ```

4. **Take breaks together**
   - Every 2 hours, both take a 15-minute break
   - Helps prevent one person from getting ahead

5. **Share knowledge**
   - Explain complex logic to your teammate
   - Ask questions when you don't understand

## Emergency Procedures

### If Live Share Breaks
```bash
# Fallback 1: Use Git more frequently
git add . && git commit -m "WIP: current progress" && git push
# Teammate: git pull

# Fallback 2: Use VS Code Remote Repositories
# Both can edit directly on GitHub when needed

# Fallback 3: Zoom/Discord screen sharing
# Continue with voice while troubleshooting Live Share
```

### If Git Conflicts Occur
```bash
# 1. Don't panic - communicate first
# 2. One person handles the merge
git status          # See conflicted files
# 3. Edit files manually to resolve conflicts
# 4. Test that everything still works
git add .
git commit -m "Resolve merge conflicts"
git push
```

---

## 🚀 You're Ready for Professional Remote Collaboration!

This setup gives you:
- ✅ Real-time collaboration like Google Docs
- ✅ Professional version control with Git
- ✅ Built-in communication tools
- ✅ Shared debugging and testing
- ✅ No complex server setup required

**Start coding together and build something amazing! 🍽️✨**