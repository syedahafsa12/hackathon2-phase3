# Backend Guidelines - Hackathon Todo API

## Tech Stack

- **Framework**: FastAPI 0.104.1 (async Python web framework)
- **ORM**: SQLModel 0.0.14 (type-safe Pydantic + SQLAlchemy)
- **Database**: PostgreSQL (Neon serverless)
- **Migrations**: Alembic 1.13.1
- **Server**: Uvicorn (ASGI server)
- **Authentication**: JWT with PyJWT 2.8.0
- **Password Hashing**: bcrypt via passlib 1.7.4
- **Rate Limiting**: slowapi 0.1.9
- **Validation**: Pydantic (built into FastAPI)
- **Python Version**: 3.11+

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                # FastAPI app entry point
│   ├── config.py              # Environment configuration
│   ├── database.py            # Database connection and session
│   ├── models/                # SQLModel database models
│   │   ├── __init__.py
│   │   ├── user.py            # User model
│   │   ├── task.py            # Task model
│   │   └── tag.py             # Tag model
│   ├── routers/               # API route handlers
│   │   ├── __init__.py
│   │   ├── auth.py            # POST /auth/signup, /auth/login
│   │   ├── tasks.py           # CRUD /tasks endpoints
│   │   └── tags.py            # CRUD /tags endpoints
│   ├── schemas/               # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py            # UserCreate, UserResponse
│   │   ├── task.py            # TaskCreate, TaskUpdate, TaskResponse
│   │   └── tag.py             # TagCreate, TagResponse
│   ├── services/              # Business logic (optional, can be in routers)
│   │   ├── __init__.py
│   │   └── auth_service.py    # Password hashing, token generation
│   └── utils/                 # Utilities
│       ├── __init__.py
│       ├── auth.py            # get_current_user dependency
│       └── validators.py      # Custom validation functions
├── alembic/                   # Database migrations
│   ├── versions/              # Migration files
│   └── env.py
├── alembic.ini                # Alembic configuration
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (NOT in git)
├── .env.example               # Environment template
├── Procfile                   # Railway deployment config
└── CLAUDE.md                  # This file
```

## Coding Patterns

### 1. Database Models (SQLModel)

**File**: `app/models/task.py`

```python
# File: app/models/task.py
# Spec: specs/001-competition-todo-app/spec.md § FR-2 (Task Management)

from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class Task(SQLModel, table=True):
    """
    Task model - represents a todo item

    Multi-user isolation: All queries MUST filter by user_id
    """
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)  # CRITICAL for filtering
    title: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    completed: bool = Field(default=False, index=True)  # For filtering
    priority: str = Field(default="medium")  # high, medium, low
    category: Optional[str] = Field(default=None, max_length=50)
    due_date: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    user: Optional["User"] = Relationship(back_populates="tasks")
    tags: List["Tag"] = Relationship(back_populates="tasks", link_model="TaskTag")
```

**Key Points**:
- All models inherit from `SQLModel` with `table=True`
- Use `Field()` for constraints (max_length, default, index, foreign_key)
- Add indexes on columns used in WHERE clauses (user_id, completed, created_at)
- Use `Optional[T]` for nullable fields
- Always set `default_factory=datetime.utcnow` for timestamps (NOT `default=datetime.utcnow()`)
- Foreign keys MUST have index for performance

### 2. Pydantic Schemas

**File**: `app/schemas/task.py`

```python
# File: app/schemas/task.py
# Spec: specs/001-competition-todo-app/spec.md § FR-2 (Task Management)

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List

class TaskCreate(BaseModel):
    """Request schema for creating a task"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    priority: str = Field("medium", pattern="^(high|medium|low)$")
    category: Optional[str] = Field(None, max_length=50)
    due_date: Optional[datetime] = None
    tag_ids: Optional[List[int]] = []

    @field_validator('title')
    @classmethod
    def title_must_not_be_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Title cannot be empty or whitespace')
        return v.strip()

class TaskUpdate(BaseModel):
    """Request schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    completed: Optional[bool] = None
    priority: Optional[str] = Field(None, pattern="^(high|medium|low)$")
    category: Optional[str] = Field(None, max_length=50)
    due_date: Optional[datetime] = None
    tag_ids: Optional[List[int]] = None

class TaskResponse(BaseModel):
    """Response schema for task data"""
    id: int
    user_id: int
    title: str
    description: Optional[str]
    completed: bool
    priority: str
    category: Optional[str]
    due_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    tags: List["TagResponse"] = []

    model_config = {"from_attributes": True}  # Enable ORM mode
```

**Key Points**:
- `TaskCreate`: Fields required for creation (title only required)
- `TaskUpdate`: All fields optional (partial updates)
- `TaskResponse`: Read-only, matches database model
- Use `Field()` with constraints (min_length, max_length, pattern)
- Use `@field_validator` for custom validation
- Set `model_config = {"from_attributes": True}` for ORM conversion

### 3. API Routes (FastAPI)

**File**: `app/routers/tasks.py`

```python
# File: app/routers/tasks.py
# Spec: specs/001-competition-todo-app/spec.md § FR-2 (Task Management)

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional

from app.database import get_session
from app.models import Task, User
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse
from app.utils.auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new task for the authenticated user.

    Spec: FR-2.1 Create Task
    """
    # Create task with user_id from JWT token
    task = Task(
        **task_data.model_dump(exclude={"tag_ids"}),
        user_id=current_user.id,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.get("", response_model=List[TaskResponse])
def list_tasks(
    status: Optional[str] = Query(None, pattern="^(all|pending|completed)$"),
    priority: Optional[str] = Query(None, pattern="^(high|medium|low)$"),
    category: Optional[str] = None,
    search: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    List all tasks for the authenticated user with optional filters.

    Spec: FR-2.2 View Tasks
    Multi-user isolation: ALWAYS filter by user_id
    """
    # Base query - CRITICAL: Filter by user_id
    query = select(Task).where(Task.user_id == current_user.id)

    # Apply filters
    if status == "pending":
        query = query.where(Task.completed == False)
    elif status == "completed":
        query = query.where(Task.completed == True)

    if priority:
        query = query.where(Task.priority == priority)

    if category:
        query = query.where(Task.category == category)

    if search:
        query = query.where(
            Task.title.contains(search) | Task.description.contains(search)
        )

    # Execute query
    tasks = session.exec(query.order_by(Task.created_at.desc())).all()

    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Get a single task by ID.

    Spec: FR-2.2 View Tasks
    Security: Return 404 if task doesn't belong to user (prevents info leakage)
    """
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check ownership
    if task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")  # Not 403!

    return task

@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Update a task.

    Spec: FR-2.3 Update Task
    """
    task = session.get(Task, task_id)

    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task

@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a task.

    Spec: FR-2.4 Delete Task
    """
    task = session.get(Task, task_id)

    if not task or task.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()

    return None  # 204 No Content
```

**Key Patterns**:
- Always use `Depends(get_current_user)` for protected routes
- ALWAYS filter by `user_id` from `current_user`
- Return 404 (not 403) when user requests resource they don't own
- Use `response_model` for type-safe responses
- Use `status_code` for non-200 responses (201 Created, 204 No Content)
- Use `Query()` for query parameter validation
- Update `updated_at` manually on PATCH requests

### 4. Authentication with JWT

**File**: `app/utils/auth.py`

```python
# File: app/utils/auth.py
# Spec: specs/001-competition-todo-app/spec.md § FR-1 (Authentication)

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from sqlmodel import Session, select
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext

from app.config import settings
from app.database import get_session
from app.models.user import User

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)

# JWT token extraction
security = HTTPBearer()

def hash_password(password: str) -> str:
    """Hash password with bcrypt (cost factor 12)"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash (constant-time comparison)"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict) -> str:
    """
    Create JWT access token.

    Spec: FR-1.2 User Login
    - Expiration: 7 days (JWT_EXPIRATION_DAYS)
    - Algorithm: HS256 (JWT_ALGORITHM)
    - Claims: user_id, email, iat, exp
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.jwt_expiration_days)
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
    })
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )
    return encoded_jwt

def get_current_user(
    credentials: HTTPAuthCredentials = Depends(security),
    session: Session = Depends(get_session),
) -> User:
    """
    FastAPI dependency to get current authenticated user from JWT token.

    Spec: FR-1.4 JWT Token Management
    - Verifies JWT signature
    - Checks expiration
    - Returns User object
    - Raises 401 if invalid/expired/missing
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode and verify JWT
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
        user_id: int = payload.get("user_id")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    # Fetch user from database
    user = session.get(User, user_id)
    if user is None:
        raise credentials_exception

    return user
```

**Key Points**:
- Use bcrypt with cost factor 12 (OWASP recommendation)
- JWT expiration: 7 days (configurable via `JWT_EXPIRATION_DAYS`)
- JWT claims: `user_id`, `email`, `iat` (issued at), `exp` (expiration)
- Always verify JWT signature and expiration
- Return 401 Unauthorized for invalid/expired tokens
- Use `HTTPBearer()` for Authorization header extraction

### 5. Database Connection

**File**: `app/database.py`

```python
# File: app/database.py

from sqlmodel import SQLModel, create_engine, Session
from app.config import settings

# Create engine with connection pooling
engine = create_engine(
    settings.database_url,
    echo=False,  # Set to True for SQL logging in development
    pool_size=10,  # Number of persistent connections
    max_overflow=20,  # Additional connections when pool exhausted
    pool_pre_ping=True,  # Verify connections before using
)

def create_db_and_tables():
    """Create all tables on startup (dev only - use Alembic in production)"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """
    FastAPI dependency to get database session.

    Usage:
        @app.get("/")
        def route(session: Session = Depends(get_session)):
            ...
    """
    with Session(engine) as session:
        yield session
```

### 6. Environment Configuration

**File**: `app/config.py`

```python
# File: app/config.py

from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """Application configuration from environment variables"""

    # Database
    database_url: str = "postgresql://user:password@localhost:5432/db"

    # JWT
    jwt_secret: str = "your-secret-key-min-32-characters-long"
    jwt_algorithm: str = "HS256"
    jwt_expiration_days: int = 7

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Environment
    environment: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False

settings = Settings()
```

## Database Migrations with Alembic

### Create Migration

```bash
# Auto-generate migration from model changes
alembic revision --autogenerate -m "Add due_date to tasks"

# Manually create empty migration
alembic revision -m "Custom migration"
```

### Apply Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Check current migration version
alembic current

# Show migration history
alembic history
```

### Migration File Example

```python
# alembic/versions/001_create_tasks_table.py

from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
    )
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('ix_tasks_completed', 'tasks', ['completed'])

def downgrade() -> None:
    op.drop_index('ix_tasks_completed', table_name='tasks')
    op.drop_index('ix_tasks_user_id', table_name='tasks')
    op.drop_table('tasks')
```

## Rate Limiting

**File**: `app/routers/auth.py`

```python
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

limiter = Limiter(key_func=get_remote_address)

@router.post("/login")
@limiter.limit("5/15minutes")  # 5 requests per 15 minutes
def login(request: Request, ...):
    ...

@router.post("/signup")
@limiter.limit("3/hour")  # 3 signups per hour
def signup(request: Request, ...):
    ...
```

## Error Handling

**Standard Error Responses**:

```python
# 400 Bad Request - Validation error
raise HTTPException(
    status_code=400,
    detail="Invalid input data"
)

# 401 Unauthorized - Auth required or invalid token
raise HTTPException(
    status_code=401,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

# 404 Not Found - Resource doesn't exist
raise HTTPException(
    status_code=404,
    detail="Task not found"
)

# 409 Conflict - Duplicate resource
raise HTTPException(
    status_code=409,
    detail="Email already registered"
)

# 422 Unprocessable Entity - Pydantic validation (automatic)
# FastAPI handles this automatically for request validation

# 500 Internal Server Error - Unexpected error
# FastAPI handles this automatically, shows stack trace in development
```

## Testing

### Manual API Testing

Use FastAPI's automatic Swagger UI at `/docs`:

```
http://localhost:8001/docs
```

Steps:
1. POST `/auth/signup` to create user
2. POST `/auth/login` to get JWT token
3. Click "Authorize" button, paste token
4. Test other endpoints

### Testing with curl

```bash
# Signup
curl -X POST http://localhost:8001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}'

# Login
TOKEN=$(curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePass123"}' \
  | jq -r '.token')

# Create task
curl -X POST http://localhost:8001/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","priority":"high"}'

# List tasks
curl http://localhost:8001/tasks \
  -H "Authorization: Bearer $TOKEN"
```

## Security Checklist

- [ ] All passwords hashed with bcrypt (cost 12)
- [ ] JWT tokens expire (7 days)
- [ ] Rate limiting on auth endpoints
- [ ] CORS whitelist (no "*" in production)
- [ ] Input validation with Pydantic
- [ ] SQL injection prevented (SQLModel ORM)
- [ ] Multi-user data isolation (always filter by user_id)
- [ ] Return 404 (not 403) for unauthorized access
- [ ] HTTPS in production (Railway handles this)
- [ ] Environment variables for secrets (never hardcode)

## Performance Optimization

- [ ] Database indexes on user_id, completed, created_at
- [ ] Connection pooling (pool_size=10, max_overflow=20)
- [ ] Async endpoints where possible (use `async def`)
- [ ] Pagination for list endpoints (offset/limit)
- [ ] Select only needed columns (avoid `SELECT *`)
- [ ] Use `session.exec()` instead of raw SQL

## Environment Variables

Required in `.env`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech:5432/database?sslmode=require

# JWT (CRITICAL: Change in production!)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_ALGORITHM=HS256
JWT_EXPIRATION_DAYS=7

# CORS (Comma-separated frontend URLs)
CORS_ORIGINS=http://localhost:3000,https://your-app.vercel.app

# Environment
ENVIRONMENT=production
```

## Running the Server

```bash
# Development (auto-reload on file changes)
uvicorn app.main:app --reload --port 8001

# Production (Railway uses this)
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## Common Issues

**Issue**: Database connection fails
**Solution**: Check DATABASE_URL format, ensure `?sslmode=require` for Neon

**Issue**: JWT signature verification fails
**Solution**: Ensure JWT_SECRET matches between environments

**Issue**: CORS errors in browser
**Solution**: Add frontend URL to CORS_ORIGINS

**Issue**: Alembic can't find database
**Solution**: Set DATABASE_URL in `.env`, Alembic reads from `alembic.ini`

## Links

- **Main Spec**: `@../specs/001-competition-todo-app/spec.md`
- **Root CLAUDE.md**: `@../CLAUDE.md`
- **Frontend CLAUDE.md**: `@../frontend/CLAUDE.md`
- **Deployment Guide**: `@../DEPLOYMENT.md`

---

**Remember**: Multi-user isolation is CRITICAL. Every query MUST filter by `user_id`.
