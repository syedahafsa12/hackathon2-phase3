from sqlmodel import create_engine, text
from app.config import settings

# Create engine
engine = create_engine(settings.database_url)

def reset_db():
    print("Resetting database...")
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS task_tags CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS tags CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS tasks CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS users CASCADE;"))
        conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE;"))
        conn.execute(text("DROP TYPE IF EXISTS priorityenum CASCADE;"))
        conn.commit()
    print("Tables dropped successfully.")

if __name__ == "__main__":
    reset_db()
