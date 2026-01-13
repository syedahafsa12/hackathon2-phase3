from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class TagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    color: Optional[str] = Field(default=None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')


class TagUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    color: Optional[str] = Field(default=None, max_length=7, pattern=r'^#[0-9A-Fa-f]{6}$')


class TagResponse(BaseModel):
    id: int
    user_id: str
    name: str
    color: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
