# Quick Start Guide - Hackathon Todo App

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL database (already configured with Neon)

## Step 1: Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies directly (no venv needed for quick start)
pip install -r requirements.txt

# Check that database is configured
python -c "from app.config import settings; print('Database configured:', settings.database_url[:30])"

# Run database migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8001
```

**Backend will run on: http://localhost:8001**
**API Docs available at: http://localhost:8001/docs**

## Step 2: Setup Frontend (New Terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start frontend dev server
npm run dev
```

**Frontend will run on: http://localhost:3000**

## Step 3: Test the Application

1. Open your browser to http://localhost:3000
2. Click "Sign up" to create an account
3. Fill in:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123 (min 8 characters)
4. After signup, you'll be redirected to the dashboard
5. Start creating tasks!

## Troubleshooting

### Backend Issues

**Error: "Module not found"**
```bash
cd backend
pip install -r requirements.txt
```

**Error: "Database connection failed"**
- Check that DATABASE_URL in backend/.env is correct
- The Neon database should already be configured

**Error: "Port 8001 already in use"**
```bash
# Find and kill the process
# Windows:
netstat -ano | findstr :8001
taskkill /PID <PID> /F

# Linux/Mac:
lsof -ti:8001 | xargs kill -9
```

### Frontend Issues

**Error: "Cannot connect to backend"**
- Make sure backend is running on port 8001
- Check frontend/.env.local has: `NEXT_PUBLIC_API_URL=http://localhost:8001`

**Error: "Module not found"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Quick Test Commands

### Test Backend API Directly

```bash
# Health check
curl http://localhost:8001/health

# Signup (create user)
curl -X POST http://localhost:8001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login (get token)
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Frontend

1. Open http://localhost:3000
2. Open browser DevTools (F12)
3. Check Console for errors
4. Check Network tab for API requests

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://...  # Already configured
JWT_SECRET=your-secret-key
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
CORS_ORIGINS=http://localhost:3000
ENVIRONMENT=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
```

## Features to Test

### Authentication
- ✅ Sign up new user
- ✅ Log in existing user
- ✅ View current user profile
- ✅ Log out

### Task Management
- ✅ Create task (title, description, priority, category, tags, due date)
- ✅ View all tasks
- ✅ Update task
- ✅ Delete task
- ✅ Mark task complete/incomplete

### Advanced Features
- ✅ Search tasks
- ✅ Filter by priority, category, status
- ✅ Sort tasks
- ✅ Bulk operations (select multiple, delete all)
- ✅ Dark mode toggle
- ✅ Keyboard shortcuts (n = new task, ? = help)

## Next Steps

Once everything is working:

1. ✅ Test all features manually
2. ✅ Deploy to Vercel (frontend) and Railway (backend)
3. ✅ Create 90-second demo video
4. ✅ Submit to hackathon

## Need Help?

- Check backend logs in terminal running uvicorn
- Check frontend console in browser DevTools
- Check API documentation at http://localhost:8001/docs
- Review backend/CLAUDE.md and frontend/CLAUDE.md for detailed guides
