# File: backend/app/mcp/langchain_tools.py
# Phase III: AI Chatbot - LangChain Tool Definitions for Ollama
# Spec: specs/001-competition-todo-app/phase3.md
# Converts MCP tools to LangChain format for use with Ollama LLM

from typing import List, Dict, Any, Optional
from langchain.tools import Tool, StructuredTool
from pydantic import BaseModel, Field
from sqlmodel import Session

from app.models.user import User
from .todo_tools import (
    add_task as _add_task,
    list_tasks as _list_tasks,
    complete_task as _complete_task,
    delete_task as _delete_task,
    update_task as _update_task
)


# ============================================================================
# PYDANTIC SCHEMAS FOR LANGCHAIN TOOLS
# ============================================================================

class AddTaskInput(BaseModel):
    """Input schema for add_task tool"""
    title: str = Field(..., description="The task title or description (e.g., 'Buy groceries', 'Call mom')")
    priority: str = Field(default="medium", description="Task priority: high, medium, or low. Default is medium.")
    category: Optional[str] = Field(None, description="Optional category for the task (e.g., 'work', 'personal')")
    due_date: Optional[str] = Field(None, description="Optional due date in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)")


class ListTasksInput(BaseModel):
    """Input schema for list_tasks tool"""
    status: str = Field(default="all", description="Filter by status: 'all', 'pending', or 'completed'. Default is 'all'.")
    priority: Optional[str] = Field(None, description="Optional filter by priority: 'high', 'medium', or 'low'")


class CompleteTaskInput(BaseModel):
    """Input schema for complete_task tool"""
    task_id: int = Field(..., description="The ID of the task to mark as complete")
    completed: bool = Field(default=True, description="True to mark complete, False to mark incomplete. Default is True.")


class DeleteTaskInput(BaseModel):
    """Input schema for delete_task tool"""
    task_id: int = Field(..., description="The ID of the task to delete permanently")


class UpdateTaskInput(BaseModel):
    """Input schema for update_task tool"""
    task_id: int = Field(..., description="The ID of the task to update")
    title: Optional[str] = Field(None, description="New task title")
    priority: Optional[str] = Field(None, description="New priority: 'high', 'medium', or 'low'")
    category: Optional[str] = Field(None, description="New category")
    due_date: Optional[str] = Field(None, description="New due date in ISO 8601 format")


# ============================================================================
# LANGCHAIN TOOL FACTORY
# ============================================================================

def create_langchain_tools(session: Session, user: User) -> List[Tool]:
    """
    Create LangChain tools with session and user context bound.

    This factory function creates tool instances with the database session
    and current user already bound, so the LLM doesn't need to provide them.

    Args:
        session: SQLModel database session
        user: Current authenticated user

    Returns:
        List of LangChain Tool objects ready for agent use
    """

    # Wrapper functions that bind session and user
    def add_task_bound(**kwargs) -> Dict[str, Any]:
        return _add_task(session, user, **kwargs)

    def list_tasks_bound(**kwargs) -> Dict[str, Any]:
        return _list_tasks(session, user, **kwargs)

    def complete_task_bound(**kwargs) -> Dict[str, Any]:
        return _complete_task(session, user, **kwargs)

    def delete_task_bound(**kwargs) -> Dict[str, Any]:
        return _delete_task(session, user, **kwargs)

    def update_task_bound(**kwargs) -> Dict[str, Any]:
        return _update_task(session, user, **kwargs)

    # Create LangChain tools with structured inputs
    tools = [
        StructuredTool(
            name="add_task",
            description=(
                "Create a new todo task for the user. "
                "Use this when the user wants to add, create, or remember something to do. "
                "Examples: 'Add buy groceries', 'Remember to call mom', 'Create task pay bills'"
            ),
            func=add_task_bound,
            args_schema=AddTaskInput
        ),
        StructuredTool(
            name="list_tasks",
            description=(
                "Get a list of the user's tasks. "
                "Can filter by status (all, pending, completed) or priority (high, medium, low). "
                "Use this when the user asks to see, show, or list their tasks. "
                "Examples: 'Show my tasks', 'What's pending?', 'List high priority tasks'"
            ),
            func=list_tasks_bound,
            args_schema=ListTasksInput
        ),
        StructuredTool(
            name="complete_task",
            description=(
                "Mark a task as complete or incomplete. "
                "Use this when the user says they finished something or wants to mark a task as done. "
                "Examples: 'Mark task 3 as done', 'Complete the groceries task', 'I finished task 5'"
            ),
            func=complete_task_bound,
            args_schema=CompleteTaskInput
        ),
        StructuredTool(
            name="delete_task",
            description=(
                "Delete a task permanently. "
                "Use this when the user wants to remove or delete a task. "
                "Examples: 'Delete task 2', 'Remove the meeting task', 'Cancel task 7'"
            ),
            func=delete_task_bound,
            args_schema=DeleteTaskInput
        ),
        StructuredTool(
            name="update_task",
            description=(
                "Update an existing task's details (title, priority, category, due date). "
                "Use this when the user wants to change or modify a task. "
                "Examples: 'Change task 1 to high priority', 'Update task 3 title to Call mom tonight', 'Rename task 2'"
            ),
            func=update_task_bound,
            args_schema=UpdateTaskInput
        )
    ]

    return tools
