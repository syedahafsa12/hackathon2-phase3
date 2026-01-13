# 🔧 HUGGING FACE SPACES DEPLOYMENT FIX

## 🔴 **CRITICAL ISSUE IDENTIFIED:**

Your frontend is calling the **WRONG URL**:

❌ **Wrong**: `https://huggingface.co/spaces/syedahafsa58/todo-phase2/auth/login`
✅ **Correct**: `https://syedahafsa58-todo-phase2.hf.space/auth/login`

**Hugging Face Spaces has TWO URLs:**
1. **Space URL** (for viewing): `https://huggingface.co/spaces/USERNAME/SPACE-NAME`
2. **API Endpoint**: `https://USERNAME-SPACE-NAME.hf.space`

You must use the **API Endpoint** (#2) for all API calls!

---

## ✅ **IMMEDIATE FIX - 3 STEPS:**

### **STEP 1: Update Vercel Environment Variable** (CRITICAL)

1. **Go to**: https://vercel.com/dashboard
2. **Select**: Your project `hackathon2-phase2`
3. **Click**: Settings → Environment Variables
4. **Find**: `NEXT_PUBLIC_API_URL`
5. **Delete the old value** (if it exists)
6. **Add new value**:
   ```
   https://syedahafsa58-todo-phase2.hf.space
   ```

   ⚠️ **CRITICAL CHECKS:**
   - Starts with `https://` (NOT `http://`)
   - Uses `.hf.space` domain (NOT `/spaces/`)
   - NO trailing slash
   - Username and space name separated by hyphen

7. **Click**: Save
8. **Go to**: Deployments tab
9. **Click**: Three dots (⋮) → **Redeploy**
10. **Wait** 2-3 minutes for redeployment

---

### **STEP 2: Configure CORS on Hugging Face Spaces** (CRITICAL)

Your backend needs to allow requests from Vercel.

#### **Option A: Add Environment Variable in Hugging Face**

1. **Go to**: https://huggingface.co/spaces/syedahafsa58/todo-phase2
2. **Click**: Settings → Variables → Secrets
3. **Click**: "New secret"
4. **Name**: `CORS_ORIGINS`
5. **Value**: `https://hackathon2-phase2.vercel.app`
6. **Click**: Save

This will trigger an automatic rebuild.

#### **Option B: Push Updated .env to Git**

If your backend `.env` is in git (it shouldn't be, but if it is):

Update `backend/.env`:
```env
CORS_ORIGINS=https://hackathon2-phase2.vercel.app,http://localhost:3000
```

Then:
```bash
git add backend/.env
git commit -m "fix: Update CORS for Vercel deployment"
git push origin main
```

---

### **STEP 3: Verify Backend CORS Configuration**

Check that your `backend/app/main.py` CORS middleware is reading from environment:

```python
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),  # ← Must read from env
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If your backend has CORS hardcoded, update it to:
```python
allow_origins=["https://hackathon2-phase2.vercel.app", "http://localhost:3000"],
```

---

## 🧪 **TESTING THE FIX:**

### **Test 1: Verify Correct Backend URL**

Open your browser console on Vercel and run:
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
// Should show: https://syedahafsa58-todo-phase2.hf.space
```

### **Test 2: Check API is Accessible**

```bash
# Test backend health
curl https://syedahafsa58-todo-phase2.hf.space/health

# Expected response:
{"status":"healthy","environment":"production"}
```

### **Test 3: Test CORS**

```bash
# Test CORS preflight
curl -X OPTIONS https://syedahafsa58-todo-phase2.hf.space/auth/signup \
  -H "Origin: https://hackathon2-phase2.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should return headers with:
# Access-Control-Allow-Origin: https://hackathon2-phase2.vercel.app
```

### **Test 4: Try Signup from Vercel**

1. Go to: https://hackathon2-phase2.vercel.app
2. Open DevTools (F12) → Network tab
3. Try to sign up
4. Check Network request:
   - URL should be: `https://syedahafsa58-todo-phase2.hf.space/auth/signup`
   - Status should be: `201 Created` (NOT `net::ERR_FAILED`)
   - No CORS errors in console

---

## 📝 **COMPLETE ENVIRONMENT VARIABLE CHECKLIST:**

### **Hugging Face Spaces (Backend) - Required Variables:**

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/db?sslmode=require
JWT_SECRET=your-32-character-secret-minimum
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7
CORS_ORIGINS=https://hackathon2-phase2.vercel.app
ENVIRONMENT=production
```

### **Vercel (Frontend) - Required Variables:**

```env
NEXT_PUBLIC_API_URL=https://syedahafsa58-todo-phase2.hf.space
```

**CRITICAL**:
- Variable name is `NEXT_PUBLIC_API_URL` (exactly, case-sensitive)
- Value is `https://syedahafsa58-todo-phase2.hf.space` (NO trailing slash)

---

## 🚨 **COMMON MISTAKES TO AVOID:**

### ❌ **Mistake 1: Wrong Hugging Face URL Format**
```
Wrong: https://huggingface.co/spaces/syedahafsa58/todo-phase2
Right: https://syedahafsa58-todo-phase2.hf.space
```

### ❌ **Mistake 2: Trailing Slash**
```
Wrong: https://syedahafsa58-todo-phase2.hf.space/
Right: https://syedahafsa58-todo-phase2.hf.space
```

### ❌ **Mistake 3: HTTP Instead of HTTPS**
```
Wrong: http://syedahafsa58-todo-phase2.hf.space
Right: https://syedahafsa58-todo-phase2.hf.space
```

### ❌ **Mistake 4: Missing CORS Domain**
```
Wrong: CORS_ORIGINS=http://localhost:3000
Right: CORS_ORIGINS=https://hackathon2-phase2.vercel.app,http://localhost:3000
```

---

## 🔍 **DEBUGGING CHECKLIST:**

If still not working after fixes:

### **1. Check Vercel Build Logs:**
- Go to Vercel → Deployments → Click latest deployment
- Check "Build Logs" for environment variable values
- Should see: `NEXT_PUBLIC_API_URL=https://syedahafsa58-todo-phase2.hf.space`

### **2. Check Hugging Face Logs:**
- Go to: https://huggingface.co/spaces/syedahafsa58/todo-phase2
- Click "Logs" tab
- Look for:
  ```
  INFO: Started server process
  INFO: Uvicorn running on http://0.0.0.0:7860
  ```
- Look for CORS errors:
  ```
  WARNING: CORS preflight failed
  ```

### **3. Check Browser Network Tab:**
- Open DevTools (F12) → Network tab
- Try signup
- Click failed request
- Check "Headers" tab:
  - Request URL should be `https://syedahafsa58-todo-phase2.hf.space/...`
  - Response Headers should include `Access-Control-Allow-Origin`

### **4. Check Browser Console:**
- Should NOT see:
  - "Mixed Content" errors
  - "CORS policy" errors
  - "net::ERR_FAILED"

---

## 🎯 **EXPECTED BEHAVIOR AFTER FIX:**

### **Frontend Console (✅ GOOD):**
```
Network: POST https://syedahafsa58-todo-phase2.hf.space/auth/signup 201 Created
Network: POST https://syedahafsa58-todo-phase2.hf.space/auth/login 200 OK
Network: GET https://syedahafsa58-todo-phase2.hf.space/tasks 200 OK
```

### **Backend Logs (✅ GOOD):**
```
INFO:     10.20.1.84:12345 - "POST /auth/signup HTTP/1.1" 201 Created
INFO:     10.20.1.84:12345 - "POST /auth/login HTTP/1.1" 200 OK
INFO:     10.20.1.84:12345 - "GET /tasks HTTP/1.1" 200 OK
```

### **Frontend Console (❌ BAD - What you have now):**
```
Access to XMLHttpRequest at 'https://huggingface.co/spaces/...' has been blocked by CORS
POST https://huggingface.co/spaces/syedahafsa58/todo-phase2/auth/signup net::ERR_FAILED
```

---

## 📊 **VERIFICATION COMMANDS:**

### **1. Test Backend Health:**
```bash
curl https://syedahafsa58-todo-phase2.hf.space/health
# Expected: {"status":"healthy","environment":"production"}
```

### **2. Test Signup Endpoint:**
```bash
curl -X POST https://syedahafsa58-todo-phase2.hf.space/auth/signup \
  -H "Content-Type: application/json" \
  -H "Origin: https://hackathon2-phase2.vercel.app" \
  -d '{"email":"test@test.com","password":"Test123456","name":"Test User"}'

# Expected: {"token":"eyJ...","user":{...}}
# NOT: 403 Forbidden or CORS error
```

### **3. Test API Docs:**
Visit: https://syedahafsa58-todo-phase2.hf.space/docs
- Should load Swagger UI
- Try "Try it out" on `/auth/signup`

---

## 💡 **QUICK FIX SUMMARY:**

1. ✅ Update Vercel `NEXT_PUBLIC_API_URL` to: `https://syedahafsa58-todo-phase2.hf.space`
2. ✅ Add `CORS_ORIGINS` to Hugging Face: `https://hackathon2-phase2.vercel.app`
3. ✅ Redeploy both services
4. ✅ Hard refresh browser (Ctrl+Shift+R)
5. ✅ Test signup

---

## 🔗 **YOUR DEPLOYMENT URLS:**

### **Correct URLs to Use:**
- **Frontend**: https://hackathon2-phase2.vercel.app
- **Backend API**: https://syedahafsa58-todo-phase2.hf.space
- **API Docs**: https://syedahafsa58-todo-phase2.hf.space/docs
- **Health Check**: https://syedahafsa58-todo-phase2.hf.space/health

### **URLs to NEVER Use:**
- ❌ https://huggingface.co/spaces/syedahafsa58/todo-phase2 (Space viewer, not API!)

---

## 📞 **NEED HELP?**

### **Hugging Face Spaces Dashboard:**
https://huggingface.co/spaces/syedahafsa58/todo-phase2

### **Vercel Dashboard:**
https://vercel.com/dashboard

### **Database (Neon):**
https://console.neon.tech

---

## ✅ **FINAL CHECKLIST:**

- [ ] Vercel `NEXT_PUBLIC_API_URL` set to `https://syedahafsa58-todo-phase2.hf.space`
- [ ] Hugging Face `CORS_ORIGINS` includes `https://hackathon2-phase2.vercel.app`
- [ ] Both services redeployed
- [ ] Backend `/health` returns 200 OK
- [ ] Backend `/docs` loads Swagger UI
- [ ] Frontend can reach backend (no CORS errors)
- [ ] Signup works from production frontend
- [ ] Login works from production frontend
- [ ] Can create tasks
- [ ] Browser console has NO errors

---

**Once all checkboxes are ✅, your app will be fully functional in production! 🚀**
