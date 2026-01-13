# File: backend/app/models/conversation.py
# Phase III: AI Chatbot - Conversation and Message models
# Stores chat history for stateless conversation management

from sqlmodel import SQLModel, Field, Column
from sqlalchemy import TIMESTAMP, Text
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime
from typing import Optional


class Conversation(SQLModel, table=True):
    """
    Conversation model - represents a chat session between user and AI.

    Each user can have multiple conversations.
    Conversations persist across sessions (stateless server design).
    """
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(foreign_key="users.id", nullable=False, index=True, max_length=255)
    title: Optional[str] = Field(default=None, max_length=200)  # Auto-generated or from first message
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False, index=True)
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False, index=True)
    )


class Message(SQLModel, table=True):
    """
    Message model - represents a single message in a conversation.

    Stores both user messages and AI assistant responses.
    Role can be: 'user', 'assistant', or 'system'.
    Tool calls stored as JSONB for debugging MCP tool usage.
    """
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(
        foreign_key="conversations.id",
        nullable=False,
        index=True
    )
    user_id: str = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        max_length=255
    )
    role: str = Field(nullable=False, max_length=20)  # 'user', 'assistant', 'system'
    content: str = Field(sa_column=Column(Text, nullable=False))
    tool_calls: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True)
    )  # Store MCP tool calls for debugging
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column=Column(TIMESTAMP(timezone=True), nullable=False, index=True)
    )

    class Config:
        arbitrary_types_allowed = True
