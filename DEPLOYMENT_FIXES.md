# 🔧 DEPLOYMENT FIXES - Hugging Face Spaces + Vercel

## 🔴 **ISSUES IDENTIFIED:**

### 1. **Backend 307 Redirects (FIXED)**
- **Problem**: FastAPI automatically redirects `/tasks` → `/tasks/` (trailing slash)
- **Symptom**: All API calls return `307 Temporary Redirect`
- **Fix**: Added `redirect_slashes=False` to FastAPI app initialization
- **Location**: `backend/app/main.py:18`

### 2. **Mixed Content Error (CRITICAL)**
- **Problem**: Vercel (HTTPS) calling Hugging Face backend over HTTP
- **Symptom**: "Mixed Content: The page was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint"
- **Fix**: Update Vercel environment variable to use HTTPS

### 3. **Frontend Environment Variable**
- **Problem**: Frontend still pointing to `http://localhost:8001`
- **Fix**: Update `NEXT_PUBLIC_API_URL` in Vercel

---

## ✅ **SOLUTIONS:**

### **Step 1: Update Backend on Hugging Face Spaces**

#### **A. Commit the backend fix:**
```bash
# Add the fixed main.py
git add backend/app/main.py

# Commit
git commit -m "fix: Disable FastAPI trailing slash redirects for Hugging Face Spaces

- Added redirect_slashes=False to prevent 307 redirects
- Fixes all API endpoints returning 307 Temporary Redirect
- Required for Hugging Face Spaces deployment"

# Push to GitHub
git push origin main
```

#### **B. Verify Hugging Face Spaces URL**
Your backend URL should be something like:
```
https://YOUR-USERNAME-hackathon-todo-backend.hf.space
```

**IMPORTANT**: Must be HTTPS, not HTTP!

---

### **Step 2: Update Vercel Environment Variable**

1. **Go to Vercel Dashboard**: https://vercel.com
2. **Navigate to**: Your project → Settings → Environment Variables
3. **Find**: `NEXT_PUBLIC_API_URL`
4. **Update to**: `https://YOUR-USERNAME-hackathon-todo-backend.hf.space`
   - ✅ Use HTTPS (not HTTP)
   - ✅ Remove trailing slash
   - ✅ Replace YOUR-USERNAME with actual URL

5. **Click "Save"**
6. **Redeploy**: Go to Deployments → Three dots → Redeploy

---

### **Step 3: Update CORS on Backend**

Your backend needs to allow requests from your Vercel frontend.

#### **Option A: Update via Hugging Face Spaces Settings**
1. Go to your Hugging Face Space
2. Settings → Variables
3. Add/Update: `CORS_ORIGINS`
4. Value: `https://your-app.vercel.app,http://localhost:3000`

#### **Option B: Update .env and redeploy**
Update `backend/.env`:
```env
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

Then push to trigger redeployment.

---

## 🧪 **TESTING THE FIX:**

### **Test Backend Directly:**
```bash
# Replace with your actual Hugging Face Spaces URL
curl https://YOUR-USERNAME-hackathon-todo-backend.hf.space/health

# Should return (NO 307 redirect):
{"status":"healthy","environment":"production"}
```

### **Test Authentication:**
```bash
# Signup
curl -X POST https://YOUR-USERNAME-hackathon-todo-backend.hf.space/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","name":"Test User"}'

# Should return (NO 307 redirect):
{"token":"eyJ...","user":{...}}
```

### **Test Frontend:**
1. Open your Vercel app: `https://your-app.vercel.app`
2. Open Browser Console (F12)
3. Try to sign up or login
4. Check Network tab:
   - ✅ All requests should be HTTPS
   - ✅ No 307 redirects
   - ✅ No "Mixed Content" errors

---

## 📝 **UPDATED ENVIRONMENT VARIABLES:**

### **Backend (Hugging Face Spaces)**
```env
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/db?sslmode=require
JWT_SECRET=your-32-character-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
ENVIRONMENT=production
```

### **Frontend (Vercel)**
```env
NEXT_PUBLIC_API_URL=https://YOUR-USERNAME-hackathon-todo-backend.hf.space
```

**CRITICAL CHECKS:**
- ✅ Frontend URL starts with `https://` (NOT `http://`)
- ✅ Frontend URL has NO trailing slash
- ✅ CORS_ORIGINS includes your Vercel domain
- ✅ All URLs match exactly (case-sensitive)

---

## 🚨 **COMMON ISSUES & FIXES:**

### **Issue 1: Still Getting 307 Redirects**
**Cause**: Backend not updated with `redirect_slashes=False`
**Fix**:
1. Verify `backend/app/main.py` has the fix
2. Commit and push to GitHub
3. Hugging Face Spaces will auto-redeploy
4. Wait 2-3 minutes for rebuild

### **Issue 2: Still Getting "Mixed Content" Error**
**Cause**: Frontend environment variable still using HTTP
**Fix**:
1. Go to Vercel → Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` to start with `https://`
3. Save and redeploy (Deployments → Redeploy)
4. Hard refresh browser (Ctrl+Shift+R)

### **Issue 3: CORS Errors**
**Cause**: Backend not allowing requests from Vercel domain
**Fix**:
1. Update `CORS_ORIGINS` in Hugging Face Spaces
2. Include full Vercel URL: `https://your-app.vercel.app`
3. Redeploy backend
4. Test with browser DevTools (Network tab)

### **Issue 4: "Failed to create task"**
**Cause**: Database connection issue or validation error
**Fix**:
1. Check Hugging Face Spaces logs for error details
2. Verify `DATABASE_URL` has `?sslmode=require`
3. Verify Neon database is active
4. Check request payload matches schema

---

## 🎯 **DEPLOYMENT CHECKLIST:**

### **Backend (Hugging Face Spaces):**
- [ ] `redirect_slashes=False` added to FastAPI app
- [ ] Code pushed to GitHub
- [ ] Hugging Face Spaces redeployed
- [ ] Environment variables set (DATABASE_URL, JWT_SECRET, CORS_ORIGINS)
- [ ] Backend URL is HTTPS
- [ ] Health check works: `/health` returns 200
- [ ] Swagger UI accessible: `/docs`

### **Frontend (Vercel):**
- [ ] `NEXT_PUBLIC_API_URL` set to HTTPS backend URL
- [ ] No trailing slash in API URL
- [ ] Frontend redeployed after env var change
- [ ] Hard refresh browser cache
- [ ] No "Mixed Content" errors in console
- [ ] No 307 redirects in Network tab

### **Integration Test:**
- [ ] Can sign up from production frontend
- [ ] Can login from production frontend
- [ ] Can create tasks
- [ ] Can mark tasks complete/incomplete
- [ ] All filters work
- [ ] Dark mode works
- [ ] No console errors

---

## 🔗 **HELPFUL LINKS:**

**Your Deployments:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://YOUR-USERNAME-hackathon-todo-backend.hf.space`
- API Docs: `https://YOUR-USERNAME-hackathon-todo-backend.hf.space/docs`

**Dashboards:**
- Vercel: https://vercel.com/dashboard
- Hugging Face: https://huggingface.co/spaces
- Neon: https://console.neon.tech

**Testing Tools:**
- Browser DevTools: F12 → Network tab
- API Testing: Swagger UI at `/docs`
- CORS Testing: https://cors-test.codehappy.dev/

---

## 📊 **EXPECTED LOGS (AFTER FIX):**

### **Backend (SUCCESS):**
```
INFO: Started server process
INFO: Waiting for application startup.
INFO: Application startup complete.
INFO: Uvicorn running on http://0.0.0.0:7860
INFO:     10.20.1.84:12345 - "POST /auth/signup HTTP/1.1" 201 Created
INFO:     10.20.1.84:12345 - "POST /tasks HTTP/1.1" 201 Created
INFO:     10.20.1.84:12345 - "GET /tasks?sort_by=created_at HTTP/1.1" 200 OK
```

### **Frontend (SUCCESS):**
```
✓ Compiled in 150ms
✓ Compiled /api/auth/signup in 50ms
Network: POST https://backend.hf.space/auth/signup 201 Created
Network: GET https://backend.hf.space/tasks 200 OK
```

---

## 💡 **QUICK FIX COMMANDS:**

### **Fix Backend:**
```bash
# 1. Ensure fix is applied
git status

# 2. If not committed, commit now
git add backend/app/main.py
git commit -m "fix: Disable trailing slash redirects"

# 3. Push to trigger Hugging Face redeploy
git push origin main

# 4. Wait 2-3 minutes, then test
curl https://YOUR-BACKEND-URL.hf.space/health
```

### **Fix Frontend:**
```bash
# Cannot be done via command line
# Go to: https://vercel.com
# Settings → Environment Variables
# Update NEXT_PUBLIC_API_URL to https://YOUR-BACKEND-URL.hf.space
# Deployments → Redeploy
```

---

## 🏆 **FINAL VERIFICATION:**

Once fixed, you should see:
- ✅ No 307 redirects in backend logs
- ✅ No "Mixed Content" errors in browser console
- ✅ All API calls return 200/201 status codes
- ✅ Frontend can create, read, update, delete tasks
- ✅ Completion toggle works instantly

**Your app is production-ready when all checks pass!**

---

**Need help? Check backend logs on Hugging Face Spaces and frontend Network tab in browser DevTools.**
