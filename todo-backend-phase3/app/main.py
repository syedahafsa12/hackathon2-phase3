from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from app.routers import auth, tasks, tags, chat

# Initialize FastAPI
app = FastAPI(
    title="Hackathon Todo API",
    description="Production-grade todo API for Hackathon II",
    version="1.0.0",
)

# CORS setup - Allow frontend to make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for production (or specifiy Vercel URL)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(tags.router)
app.include_router(chat.router)

@app.get("/")
async def root():
    return {
        "message": "Hackathon Todo API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
