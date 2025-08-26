# 🚀 Restaurant Platform - Setup Instructions

## For Both Developers

### Step 1: Create GitHub Repository

**Developer A (You) - Create Repository:**

1. Go to GitHub.com and create a new repository:
   - Name: `restaurant-platform`  
   - Description: `Multi-tenant restaurant call center platform`
   - Make it **Private** (for now)
   - Don't initialize with README (we already have one)

2. After creating, GitHub will show you commands like:
```bash
git remote add origin https://github.com/yourusername/restaurant-platform.git
git branch -M main
git push -u origin main
```

### Step 2: Upload This Project to GitHub

**Developer A (You) - In this directory:**

```bash
cd /home/admin/restaurant-platform-remote

# Configure git (replace with your info)
git config user.email "your-email@example.com"
git config user.name "Your Name"

# Connect to your GitHub repository
git remote add origin https://github.com/yourusername/restaurant-platform.git

# Push to GitHub
git push -u origin main
```

### Step 3: Developer B - Clone Repository

**Developer B - On their machine:**

```bash
# Clone the repository
git clone https://github.com/yourusername/restaurant-platform.git
cd restaurant-platform

# Configure their git
git config user.email "developer-b-email@example.com"  
git config user.name "Developer B Name"

# Install VS Code extensions (see below)
```

### Step 4: Both Developers - Install VS Code Extensions

**Required Extensions (install these):**

1. Open VS Code
2. Press `Ctrl+Shift+X` (Extensions)
3. Search and install each:
   - **Live Share Extension Pack** (Microsoft)
   - **GitLens — Git supercharged** (GitKraken)
   - **Remote Repositories** (Microsoft)
   - **Prettier - Code formatter**
   - **TypeScript Importer**
   - **Prisma** (for database)

### Step 5: Project Setup

**Both developers run:**

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env  
cp frontend/.env.example frontend/.env.local
```

### Step 6: Database Setup (Choose One)

#### Option A: Cloud Database (RECOMMENDED)
Use a free cloud database that both developers can access:

**Supabase (Free PostgreSQL):**
1. Go to supabase.com
2. Create new project
3. Get connection string from Settings → Database
4. Update `.env` files with the connection string

**Connection string format:**
```
DATABASE_URL=postgresql://postgres:password@db.supabase.co:5432/database_name
```

#### Option B: Local Database + Tunneling
```bash
# Developer A: Expose local database
ngrok tcp 5432

# Share the ngrok URL with Developer B
# Developer B updates their .env with the ngrok URL
```

### Step 7: Start Collaboration

#### First Collaboration Session

**Developer A (You):**
```bash
# 1. Open VS Code in project folder
code .

# 2. Start Live Share session
# Press Ctrl+Shift+P
# Type: "Live Share: Start Collaboration Session"
# Copy the link that appears
# Send link to Developer B
```

**Developer B:**
```bash
# 1. Open VS Code in their project folder  
code .

# 2. Join Live Share session
# Click the link from Developer A
# Or press Ctrl+Shift+P → "Live Share: Join Collaboration Session"
```

## Daily Workflow

### Morning Startup
```bash
git pull origin main    # Get latest changes
code .                  # Open VS Code
# Start/Join Live Share session
```

### During Development
```bash
# Regular commits (every hour or feature)
git add .
git commit -m "Add user authentication"
git push origin main

# Teammate pulls changes
git pull origin main
```

### Evening Wrap-up
```bash
git add .
git commit -m "End of day progress"
git push origin main
```

## Development Commands

### Start Development Servers
```bash
npm run dev           # Starts both backend (:3001) and frontend (:3000)

# Or individually:
npm run dev:backend   # NestJS API server
npm run dev:frontend  # Next.js application
```

### Database Commands
```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed with sample data
```

### Testing & Quality
```bash
npm run test         # Run all tests
npm run lint         # Check code style
npm run build        # Build for production
```

## Troubleshooting

### Live Share Not Working
1. Both restart VS Code
2. Sign out and back in to Live Share
3. Make sure you're in the same project folder

### Git Conflicts
```bash
git stash           # Save current work
git pull origin main
git stash pop       # Restore work
# Manually resolve conflicts in VS Code
```

### Database Connection Issues
1. Check `.env` file has correct DATABASE_URL
2. Make sure database is running (if local)
3. Test connection with a database client

## Project Structure

```
restaurant-platform/
├── backend/              # NestJS API
│   ├── src/
│   ├── package.json
│   └── .env
├── frontend/             # Next.js Admin Panel
│   ├── src/
│   ├── package.json
│   └── .env.local
├── shared/               # TypeScript types
├── database/             # SQL schemas & migrations
├── docs/                 # Documentation
├── .vscode/              # VS Code settings
├── package.json          # Root package.json
├── .env.example          # Environment template
└── COLLABORATION_GUIDE.md # Daily workflow guide
```

## Next Steps After Setup

1. **Test the connection** - Both developers should be able to see each other's cursors in VS Code
2. **Set up database** - Create the initial tables using `/database/schema.sql`
3. **Start with admin panel** - Begin building the user management interface
4. **Daily standups** - 15-minute sync every morning via Live Share

## Emergency Contacts & Backup Plans

If Live Share fails:
- Use more frequent git commits: `git commit -m "WIP: current progress"`
- Use VS Code Remote Repositories for quick edits
- Fall back to Zoom/Discord screen sharing

---

## 🎉 You're Ready to Start Building!

Both developers now have:
- ✅ Shared codebase via GitHub
- ✅ Real-time collaboration via VS Code Live Share
- ✅ Shared database access
- ✅ Professional development workflow
- ✅ All necessary tools and configurations

**Time to build your restaurant platform! 🍽️🚀**

*Questions? Check COLLABORATION_GUIDE.md for daily workflow details.*