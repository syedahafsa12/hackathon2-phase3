from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.task import PriorityEnum


class TaskCreate(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium
    category: Optional[str] = Field(default=None, max_length=100)
    due_date: Optional[datetime] = None
    estimated_minutes: Optional[int] = Field(default=None, gt=0)
    tag_ids: Optional[List[int]] = Field(default_factory=list)


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[PriorityEnum] = None
    category: Optional[str] = Field(default=None, max_length=100)
    due_date: Optional[datetime] = None
    estimated_minutes: Optional[int] = Field(default=None, gt=0)
    tag_ids: Optional[List[int]] = None


class TagResponse(BaseModel):
    id: int
    name: str
    color: Optional[str]
    
    class Config:
        from_attributes = True


class TaskResponse(BaseModel):
    id: int
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    priority: PriorityEnum
    category: Optional[str]
    due_date: Optional[datetime]
    estimated_minutes: Optional[int]
    tags: List[TagResponse] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    completed: int
    pending: int
