# 🤝 How Your Teammate Can Connect & Collaborate

## 🔐 Step 1: Give Your Teammate Access

Since your repository is **private**, you need to add them as a collaborator:

### **Add Collaborator (You do this):**
1. **Go to:** https://github.com/psdew2ewqws/restaurant-platform
2. **Click "Settings"** tab (in the repository)
3. **Click "Collaborators"** in the left sidebar
4. **Click "Add people"** green button
5. **Enter their GitHub username or email**
6. **Click "Add [username] to this repository"**
7. **They'll receive an email invitation**

---

## 💻 Step 2: Teammate Setup (They do this)

### **A. Accept Invitation & Clone Repository**
```bash
# 1. Check email and accept GitHub invitation
# 2. Clone the repository to their computer
git clone https://github.com/psdew2ewqws/restaurant-platform.git

# 3. Enter the project folder
cd restaurant-platform

# 4. Configure their git (replace with their info)
git config user.email "teammate-email@example.com"
git config user.name "Teammate Name"
```

### **B. Install Project Dependencies**
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies  
cd frontend && npm install && cd ..
```

### **C. Copy Environment Files**
```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

### **D. Install VS Code Extensions**
**Required extensions for collaboration:**
1. Open VS Code
2. Press `Ctrl+Shift+P` → Type "Extensions"
3. Install these:
   - **Live Share Extension Pack** (Microsoft)
   - **GitLens — Git supercharged** (GitKraken)
   - **Remote Repositories** (Microsoft)  
   - **Prettier - Code formatter**
   - **TypeScript Importer**

---

## 🚀 Step 3: Daily Collaboration Workflow

### **Morning Routine (Both Developers)**

**1. Pull Latest Changes**
```bash
cd restaurant-platform
git pull origin main
```

**2. Start VS Code**
```bash
code .
```

**3. Start Live Share Session**
- **Developer A (You):** Press `Ctrl+Shift+P` → "Live Share: Start Collaboration Session" → Copy link
- **Developer B (Teammate):** Click the shared link or Press `Ctrl+Shift+P` → "Live Share: Join Collaboration Session"

### **During Development (Both Developers)**

**Real-time collaboration features:**
✅ See each other's cursors and selections  
✅ Edit the same files simultaneously  
✅ Share terminals (both can run commands)  
✅ Debug together (shared breakpoints)  
✅ Built-in voice/text chat  

### **Saving Work (Whoever Makes Changes)**

```bash
# Check what changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Add user authentication API endpoints"

# Push to GitHub
git push origin main
```

### **Getting Teammate's Changes**
```bash
# Pull their latest changes
git pull origin main
```

---

## 📋 Push Instructions Reference

### **Complete Git Push Sequence:**
```bash
# 1. Make sure you're in project directory
cd /path/to/restaurant-platform

# 2. Check what files changed
git status

# 3. Add all changes to staging
git add .

# 4. Commit with a message describing what you did
git commit -m "Describe your changes here"

# 5. Push to GitHub
git push origin main
```

### **Example Push Workflow:**
```bash
# After adding user login feature
git add .
git commit -m "Implement user login with JWT authentication"
git push origin main
```

### **If You Get "Everything up-to-date" Error:**
This means you forgot to commit:
```bash
git status          # Check if you have unstaged/uncommitted changes
git add .           # Add the changes
git commit -m "Your message"    # Commit them
git push origin main           # Now push
```

---

## 🔧 Development Commands

### **Start Development Servers:**
```bash
npm run dev           # Starts both backend (:3001) and frontend (:3000)

# Or individually:
npm run dev:backend   # NestJS API server
npm run dev:frontend  # Next.js application
```

### **Database Commands:**
```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run database migrations  
npm run db:seed       # Seed with sample data
```

### **Testing & Quality:**
```bash
npm run test         # Run all tests
npm run lint         # Check code style
npm run build        # Build for production
```

---

## 🗂️ Project Structure Reminder

```
restaurant-platform/
├── backend/          # NestJS API - TypeScript backend
├── frontend/         # Next.js Admin Panel - React frontend  
├── shared/           # Shared TypeScript types
├── database/         # SQL schemas & migrations
├── docs/            # Documentation
├── .vscode/         # VS Code settings (shared)
└── package.json     # Root scripts
```

**Work in the appropriate folders:**
- **Backend code:** `backend/src/`
- **Frontend code:** `frontend/src/`  
- **Shared types:** `shared/types/`

---

## 🆘 Troubleshooting

### **Can't Clone Repository**
- Make sure they accepted the GitHub invitation
- Check they're using the correct repository URL
- Verify they're signed into GitHub

### **Git Push Rejected**
```bash
# Someone else pushed changes, pull first:
git pull origin main
# Resolve any conflicts, then push:
git push origin main
```

### **Live Share Not Working**
- Both restart VS Code
- Sign out and back in to Live Share
- Make sure you're in the same project folder

### **Merge Conflicts**
```bash
# When git pull creates conflicts:
git status                    # See conflicted files
# Edit files manually to resolve conflicts
git add .                     # Add resolved files
git commit -m "Resolve merge conflicts"
git push origin main
```

---

## 🎯 Summary for Your Teammate

**To get started:**
1. ✅ Accept GitHub invitation
2. ✅ Clone repository: `git clone https://github.com/psdew2ewqws/restaurant-platform.git`
3. ✅ Install dependencies: `npm install` (in root, backend, frontend)
4. ✅ Install VS Code extensions (Live Share, GitLens, etc.)
5. ✅ Join your Live Share session
6. ✅ Start coding together!

**Daily workflow:**
1. ✅ `git pull origin main` (get latest changes)
2. ✅ Join Live Share session  
3. ✅ Code together in real-time
4. ✅ `git add . && git commit -m "message" && git push origin main` (save work)

---

**You're ready for professional remote collaboration! 🚀🍽️**