from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=100)
    name: Optional[str] = Field(default=None, max_length=255)


class UserResponse(BaseModel):
    id: str
    email: str
    name: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    expires_at: datetime
