# Database Setup Instructions

## Current Issue

The backend is configured to use a Neon PostgreSQL database, but the current credentials in `.env` are invalid.

**Error**: `password authentication failed for user 'neondb_owner'`

## Solution: Get New Neon Database Credentials

### Option 1: Create New Neon Database (Recommended)

1. Go to [Neon Console](https://console.neon.tech/)
2. Sign in or create a free account
3. Click "Create Project"
4. Give it a name (e.g., "hackathon-todo")
5. Select region (closest to you for best performance)
6. Click "Create Project"
7. Copy the connection string that looks like:
   ```
   postgresql://username:password@host.region.aws.neon.tech:5432/dbname?sslmode=require
   ```

### Option 2: Use Existing Neon Project

1. Go to [Neon Console](https://console.neon.tech/)
2. Select your existing project
3. Go to "Connection Details"
4. Copy the connection string

### Option 3: Reset Password on Current Database

1. Go to [Neon Console](https://console.neon.tech/)
2. Find the project with host: `ep-quiet-surf-a5aqcxpq.us-east-2.aws.neon.tech`
3. Go to "Settings" → "Reset Password"
4. Copy the new connection string

## Update Backend Configuration

Once you have a valid connection string:

1. Open `phase2/backend/.env`
2. Update the `DATABASE_URL` line:
   ```env
   DATABASE_URL=postgresql://your_username:your_password@your_host.neon.tech:5432/your_database?sslmode=require
   ```
3. Save the file

## Run Database Migrations

After updating the connection string:

```bash
cd phase2/backend
python -m alembic upgrade head
```

This will create all the necessary tables:
- `users` - User accounts
- `tasks` - Todo tasks
- `tags` - Task tags
- `task_tags` - Many-to-many relationship
- `conversations` - Chat conversations (Phase 3)
- `messages` - Chat messages (Phase 3)

## Verify Connection

Test the database connection:

```bash
cd phase2/backend
python -c "from app.database import engine; engine.connect(); print('✅ Database connection successful!')"
```

## Start Backend Server

Once the database is configured:

```bash
cd phase2/backend
python -m uvicorn app.main:app --reload --port 8001
```

Visit http://localhost:8001/docs to see the API documentation.

## Alternative: Use SQLite for Local Development

If you don't want to use Neon (cloud database), you can use SQLite (file-based database):

1. Open `phase2/backend/.env`
2. Change the DATABASE_URL to:
   ```env
   DATABASE_URL=sqlite:///./database.db
   ```
3. Run migrations:
   ```bash
   cd phase2/backend
   python -m alembic upgrade head
   ```

**Note**: SQLite is fine for local development but NOT recommended for production.

## Troubleshooting

### Error: "connection timeout"
- Check your internet connection
- Verify the Neon host is correct
- Try a different region

### Error: "SSL required"
- Make sure your connection string ends with `?sslmode=require`
- Neon always requires SSL

### Error: "database does not exist"
- The database name in the connection string doesn't match
- Create the database in Neon console first

### Error: "too many connections"
- Neon free tier has connection limits
- Close other database connections
- Restart the Neon project in the console
