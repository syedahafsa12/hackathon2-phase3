from datetime import datetime
from typing import Optional, TYPE_CHECKING
from enum import Enum
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .user import User
    from .tag import Tag, TaskTag


class PriorityEnum(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=500)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)
    priority: PriorityEnum = Field(default=PriorityEnum.medium)
    category: Optional[str] = Field(default=None, max_length=100)
    due_date: Optional[datetime] = Field(default=None)
    estimated_minutes: Optional[int] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: "User" = Relationship(back_populates="tasks")
    task_tags: list["TaskTag"] = Relationship(back_populates="task", sa_relationship_kwargs={"cascade": "all, delete"})
