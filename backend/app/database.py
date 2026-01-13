from sqlmodel import create_engine, Session, SQLModel
from app.config import settings
from contextlib import contextmanager
from typing import Generator

# Create engine with connection pooling (lazy connection)
engine = create_engine(
    settings.database_url,
    echo=settings.environment == "development",
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # Verify connections before using
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={"connect_timeout": 5}  # 5 second timeout
)


def create_db_and_tables():
    """Create database tables. Call this during startup if needed."""
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency to get database session.

    Raises:
        HTTPException: If database connection fails
    """
    with Session(engine) as session:
        try:
            yield session
        except Exception as e:
            session.rollback()
            raise
        finally:
            session.close()
