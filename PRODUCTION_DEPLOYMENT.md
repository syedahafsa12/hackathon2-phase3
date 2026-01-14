# 🚀 Production Deployment Guide

## The Problem: Ollama Doesn't Work in Production

**Issue**: Ollama runs locally on your machine, but cloud platforms (Hugging Face, Railway, Vercel) can't access it.

**Solution**: Automatic fallback to **Groq API** (free, super fast) when Ollama isn't available.

---

## How It Works

The app now **automatically detects** which environment it's running in:

- **Local Development** (Ollama running) → Uses Ollama llama3.2 ✅
- **Production** (No Ollama) → Uses Groq API llama-3.3-70b-versatile ✅

No code changes needed! Just set one environment variable.

---

## Step 1: Get Free Groq API Key

Groq is **100% free** with generous limits (14,400 requests/day).

1. Go to https://console.groq.com
2. Sign up (free, no credit card)
3. Click "API Keys" → "Create API Key"
4. Copy the key (starts with `gsk_...`)

---

## Step 2: Add API Key to Your Deployment

### For Hugging Face Spaces (Backend)

1. Go to your Space → **Settings**
2. Scroll to **Repository secrets**
3. Click **New secret**
   - Name: `GROQ_API_KEY`
   - Value: `gsk_your_api_key_here`
4. Click **Add**
5. Restart your Space

### For Railway/Render/Other (Backend)

1. Go to your backend service → **Variables** or **Environment**
2. Add new variable:
   - Key: `GROQ_API_KEY`
   - Value: `gsk_your_api_key_here`
3. Redeploy

### For Vercel (Frontend)

Frontend doesn't need the API key (backend handles all LLM calls).

---

## Step 3: Update Frontend API URL

Your frontend needs to point to your deployed backend.

### Edit `.env.local` (for local testing with prod backend)

```env
NEXT_PUBLIC_API_URL=https://your-backend-space.hf.space
```

### For Vercel Deployment

1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add variable:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-backend-space.hf.space` (your HF Space URL)
3. Redeploy frontend

---

## Step 4: Test the Deployment

1. Open your frontend: `https://your-app.vercel.app`
2. Sign up / Login
3. Open the AI chatbot (purple button bottom-right)
4. Send message: "Add a task to buy groceries"
5. Should respond in **2-3 seconds** ⚡

---

## Deployment Checklist

### Backend (Hugging Face Spaces)

- [ ] `GROQ_API_KEY` environment variable set
- [ ] `DATABASE_URL` points to Neon database
- [ ] `JWT_SECRET` set (min 32 characters)
- [ ] `CORS_ORIGINS` includes your frontend URL
- [ ] Space is running (not sleeping)

### Frontend (Vercel)

- [ ] `NEXT_PUBLIC_API_URL` points to backend
- [ ] Build succeeds
- [ ] App loads without errors
- [ ] Can sign up/login
- [ ] Chatbot connects to backend

---

## Troubleshooting

### Error: "No LLM available"

**Cause**: `GROQ_API_KEY` not set

**Fix**: Add the environment variable and restart

### Error: "CORS policy"

**Cause**: Backend doesn't allow requests from your frontend domain

**Fix**: Add your Vercel URL to `CORS_ORIGINS` in backend `.env`:
```env
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

### Chatbot is slow (5+ seconds)

**Normal**: Groq is fast (2-3s), but slower than local Ollama

**Upgrade**: Use Groq's faster model:
```python
model="llama-3.1-8b-instant"  # Fastest (sub-second)
```

### Backend logs show "Using Ollama (local)"

**Problem**: Detection thinks Ollama is available when it's not

**Fix**: Ensure port 11434 is NOT exposed/forwarded in your deployment

---

## Cost Comparison

| Option | Speed | Cost | Limit |
|--------|-------|------|-------|
| **Ollama (Local)** | ⚡⚡⚡ Fast | $0 | Unlimited |
| **Groq API (Free)** | ⚡⚡ Fast | $0 | 14,400 req/day |
| **OpenAI** | ⚡ Medium | $$ | Pay per token |
| **Together.ai** | ⚡⚡ Fast | $ | Free tier available |

**Recommendation**: Groq (best balance of speed, cost, and limits)

---

## Alternative: Together.ai (If Groq doesn't work)

1. Get API key: https://api.together.xyz/settings/api-keys
2. Install: `pip install langchain-together`
3. Replace in `agent_service.py`:

```python
from langchain_together import ChatTogether

llm = ChatTogether(
    model="meta-llama/Llama-3.3-70B-Instruct-Turbo",
    temperature=0.3,
    max_tokens=200,
    together_api_key=os.getenv("TOGETHER_API_KEY"),
)
```

4. Set `TOGETHER_API_KEY` instead of `GROQ_API_KEY`

---

## Environment Variables Summary

### Backend (.env)

```env
# Database (Required)
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/db?sslmode=require

# JWT (Required)
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# CORS (Required - add your frontend URL)
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:3000

# LLM for Production (Required for deployed backend)
GROQ_API_KEY=gsk_your_api_key_here

# Environment
ENVIRONMENT=production
```

### Frontend (.env.local)

```env
# Backend API URL (Required)
NEXT_PUBLIC_API_URL=https://your-backend-space.hf.space
```

---

## Success Criteria

✅ Backend deploys successfully
✅ Frontend deploys successfully
✅ Can create account and login
✅ Can manage tasks (add, complete, delete)
✅ **Chatbot responds in 2-5 seconds** 🎉
✅ Chatbot can add/list/complete/delete tasks

---

## Next Steps

1. **Get Groq API key** (2 minutes)
2. **Add to backend** environment variables
3. **Update frontend** API URL
4. **Test everything** works
5. **Share your app** with the world! 🌍

Your app is now production-ready! 🚀
