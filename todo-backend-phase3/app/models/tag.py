from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .user import User
    from .task import Task


class Tag(SQLModel, table=True):
    __tablename__ = "tags"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", index=True)
    name: str = Field(max_length=100, index=True)
    color: Optional[str] = Field(default=None, max_length=7)  # Hex color code
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    user: "User" = Relationship(back_populates="tags")
    task_tags: list["TaskTag"] = Relationship(back_populates="tag", sa_relationship_kwargs={"cascade": "all, delete"})


class TaskTag(SQLModel, table=True):
    __tablename__ = "task_tags"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    task_id: int = Field(foreign_key="tasks.id", index=True)
    tag_id: int = Field(foreign_key="tags.id", index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    task: "Task" = Relationship(back_populates="task_tags")
    tag: "Tag" = Relationship(back_populates="task_tags")
