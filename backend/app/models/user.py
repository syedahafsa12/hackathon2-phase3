from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .task import Task
    from .tag import Tag


class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: str = Field(primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    name: Optional[str] = Field(default=None, max_length=255)
    password_hash: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    tasks: list["Task"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete"})
    tags: list["Tag"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete"})
