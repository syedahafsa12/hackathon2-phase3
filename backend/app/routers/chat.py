# File: backend/app/routers/chat.py
# Phase III: AI Chatbot - Stateless Chat Endpoint with LangChain + Ollama
# Spec: specs/001-competition-todo-app/phase3.md

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.database import get_session
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.utils.dependencies import get_current_user
from app.services.agent_service import create_agent, run_agent


# ============================================================================
# REQUEST/RESPONSE SCHEMAS
# ============================================================================

class ChatRequest(BaseModel):
    """Request schema for chat endpoint"""
    message: str = Field(..., min_length=1, max_length=2000, description="User's message")
    conversation_id: Optional[int] = Field(None, description="Optional conversation ID to continue existing conversation")


class ChatResponse(BaseModel):
    """Response schema for chat endpoint"""
    conversation_id: int = Field(..., description="ID of the conversation (for continuing chat)")
    response: str = Field(..., description="AI's text response")
    tool_calls: Optional[List[Dict[str, Any]]] = Field(None, description="Tools called by AI (for debugging)")


# ============================================================================
# ROUTER
# ============================================================================

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("", response_model=ChatResponse, status_code=200)
async def send_chat_message(
    request: ChatRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Stateless chat endpoint - Send message to AI assistant using LangChain + Ollama.

    **Stateless Design**:
    - Server holds ZERO conversation state in memory
    - All history loaded from database on each request
    - Conversation persists across sessions
    - Agent recreated on each request with MCP tools bound

    **How it works**:
    1. Load conversation history from database (if conversation_id provided)
    2. Create LangChain agent with Ollama LLM and MCP tools
    3. Run agent with message + history → Agent calls MCP tools as needed
    4. Save user message + AI response to database
    5. Return AI response + conversation_id + tool_calls

    **Multi-user isolation**: Users can only access their own conversations

    Spec: specs/001-competition-todo-app/phase3.md
    """
    try:
        # ====================================================================
        # STEP 1: Get or Create Conversation
        # ====================================================================

        conversation = None

        if request.conversation_id:
            # Load existing conversation
            conversation = session.get(Conversation, request.conversation_id)

            if not conversation:
                raise HTTPException(status_code=404, detail="Conversation not found")

            # Verify ownership (multi-user isolation)
            if conversation.user_id != current_user.id:
                raise HTTPException(status_code=404, detail="Conversation not found")

            # Update timestamp
            conversation.updated_at = datetime.utcnow()

        else:
            # Create new conversation
            conversation = Conversation(
                user_id=current_user.id,
                title=request.message[:50],  # Use first 50 chars as title
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            session.add(conversation)
            session.commit()
            session.refresh(conversation)

        # ====================================================================
        # STEP 2: Load Conversation History
        # ====================================================================

        # Get all messages in this conversation (ordered by time)
        history_messages = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.asc())
        ).all()

        # Format for LangChain agent
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in history_messages
        ]

        # ====================================================================
        # STEP 3: Create Agent and Run
        # ====================================================================

        # Create agent (stateless, recreated each request)
        agent = create_agent(session, current_user)

        # Run agent with conversation history
        agent_result = await run_agent(
            agent_executor=agent,
            user_message=request.message,
            chat_history=conversation_history
        )

        ai_response_text = agent_result["response"]
        tool_calls = agent_result.get("tool_calls", [])

        # ====================================================================
        # STEP 4: Save Messages to Database
        # ====================================================================

        # Save user message
        user_message = Message(
            conversation_id=conversation.id,
            user_id=current_user.id,
            role="user",
            content=request.message,
            tool_calls=None,
            created_at=datetime.utcnow()
        )
        session.add(user_message)

        # Save AI response
        assistant_message = Message(
            conversation_id=conversation.id,
            user_id=current_user.id,
            role="assistant",
            content=ai_response_text,
            tool_calls={"tools": tool_calls} if tool_calls else None,
            created_at=datetime.utcnow()
        )
        session.add(assistant_message)

        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        session.add(conversation)

        session.commit()

        # ====================================================================
        # STEP 5: Return Response
        # ====================================================================

        return ChatResponse(
            conversation_id=conversation.id,
            response=ai_response_text,
            tool_calls=tool_calls if tool_calls else None
        )

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error processing chat message: {str(e)}"
        )


@router.get("/conversations", response_model=List[Dict[str, Any]])
def list_conversations(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    List all conversations for the authenticated user.

    Returns conversations ordered by most recent first.
    Multi-user isolation: Only return user's own conversations.
    """
    conversations = session.exec(
        select(Conversation)
        .where(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
    ).all()

    return [
        {
            "id": conv.id,
            "title": conv.title,
            "created_at": conv.created_at.isoformat(),
            "updated_at": conv.updated_at.isoformat()
        }
        for conv in conversations
    ]


@router.get("/conversations/{conversation_id}/messages", response_model=List[Dict[str, Any]])
def get_conversation_messages(
    conversation_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Get all messages in a conversation.

    Multi-user isolation: Verify conversation belongs to user.
    """
    # Verify conversation exists and belongs to user
    conversation = session.get(Conversation, conversation_id)

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get messages
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
    ).all()

    return [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "tool_calls": msg.tool_calls,
            "created_at": msg.created_at.isoformat()
        }
        for msg in messages
    ]


@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(
    conversation_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Delete a conversation and all its messages.

    Multi-user isolation: Verify conversation belongs to user.
    CASCADE DELETE: All messages are automatically deleted.
    """
    # Verify conversation exists and belongs to user
    conversation = session.get(Conversation, conversation_id)

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Delete conversation (messages auto-deleted via CASCADE)
    session.delete(conversation)
    session.commit()

    return None  # 204 No Content
