from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import create_db_and_tables
from app.routers import auth_router, tasks_router, tags_router, chat_router

# Initialize FastAPI without custom middleware first
app = FastAPI(
    title="Hackathon Todo API",
    description="Production-grade todo API for Hackathon II",
    version="1.0.0",
)

# Standard CORS setup - Simplest possible working configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
# Comment out others to isolate authentication first
# app.include_router(tasks_router)
# app.include_router(tags_router)
# app.include_router(chat_router)


@app.on_event("startup")
def on_startup():
    try:
        create_db_and_tables()
    except Exception as e:
        print(f"DB Startup Error: {e}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
