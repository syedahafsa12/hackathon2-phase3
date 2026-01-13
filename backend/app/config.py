from pydantic_settings import BaseSettings
from pydantic import field_validator
from functools import lru_cache


class Settings(BaseSettings):
    # Database
    database_url: str

    # JWT
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_days: int = 7

    # CORS
    cors_origins: str = "*"

    # Environment
    environment: str = "development"

    @field_validator("database_url", "jwt_algorithm", mode="before")
    @classmethod
    def clean_settings(cls, v: str):
        if isinstance(v, str):
            v = v.strip()
            # Fix scheme for SQLAlchemy if it's the database_url
            if v.startswith("postgres://"):
                v = v.replace("postgres://", "postgresql://", 1)
        return v

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
