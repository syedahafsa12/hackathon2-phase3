# File: backend/app/mcp/todo_tools.py
# Phase III: AI Chatbot - MCP Tool Definitions for Gemini Function Calling
# Spec: specs/001-competition-todo-app/spec.md § Phase III (AI Chatbot)

from typing import List, Dict, Any, Optional
from sqlmodel import Session, select
from datetime import datetime

from app.models.task import Task
from app.models.user import User


# ============================================================================
# MCP TOOL DEFINITIONS (Gemini Function Calling Format)
# ============================================================================

# These tool definitions tell Gemini what functions it can call
# Format follows Google's function calling schema
GEMINI_TOOLS = [
    {
        "name": "add_task",
        "description": "Create a new todo task for the user. Use this when the user wants to add, create, or remember something to do.",
        "parameters": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "The task title or description (e.g., 'Buy groceries', 'Call mom')"
                },
                "priority": {
                    "type": "string",
                    "enum": ["high", "medium", "low"],
                    "description": "Task priority level. Default is 'medium' if not specified."
                },
                "category": {
                    "type": "string",
                    "description": "Optional category for the task (e.g., 'work', 'personal', 'shopping')"
                },
                "due_date": {
                    "type": "string",
                    "description": "Optional due date in ISO 8601 format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS)"
                }
            },
            "required": ["title"]
        }
    },
    {
        "name": "list_tasks",
        "description": "Get a list of the user's tasks. Can filter by status (all, pending, completed) or priority.",
        "parameters": {
            "type": "object",
            "properties": {
                "status": {
                    "type": "string",
                    "enum": ["all", "pending", "completed"],
                    "description": "Filter by task status. 'all' shows all tasks, 'pending' shows incomplete tasks, 'completed' shows finished tasks."
                },
                "priority": {
                    "type": "string",
                    "enum": ["high", "medium", "low"],
                    "description": "Filter by priority level"
                }
            },
            "required": []
        }
    },
    {
        "name": "complete_task",
        "description": "Mark a task as complete or incomplete. Use this when the user says they finished something or wants to mark a task as done.",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task to mark as complete"
                },
                "completed": {
                    "type": "boolean",
                    "description": "True to mark complete, False to mark incomplete. Default is True."
                }
            },
            "required": ["task_id"]
        }
    },
    {
        "name": "delete_task",
        "description": "Delete a task permanently. Use this when the user wants to remove or delete a task.",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task to delete"
                }
            },
            "required": ["task_id"]
        }
    },
    {
        "name": "update_task",
        "description": "Update an existing task's details (title, priority, category, due date, etc.)",
        "parameters": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "integer",
                    "description": "The ID of the task to update"
                },
                "title": {
                    "type": "string",
                    "description": "New task title"
                },
                "priority": {
                    "type": "string",
                    "enum": ["high", "medium", "low"],
                    "description": "New priority level"
                },
                "category": {
                    "type": "string",
                    "description": "New category"
                },
                "due_date": {
                    "type": "string",
                    "description": "New due date in ISO 8601 format"
                }
            },
            "required": ["task_id"]
        }
    }
]


# ============================================================================
# TOOL EXECUTION FUNCTIONS
# ============================================================================

def add_task(
    session: Session,
    user: User,
    title: str,
    priority: str = "medium",
    category: Optional[str] = None,
    due_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Execute add_task tool - Create a new task for the user.

    This REUSES the existing Phase II task creation logic.
    Multi-user isolation: task.user_id = user.id
    """
    try:
        # Parse due_date if provided
        parsed_due_date = None
        if due_date:
            try:
                parsed_due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            except ValueError:
                return {
                    "success": False,
                    "error": f"Invalid due date format: {due_date}. Use YYYY-MM-DD or ISO 8601."
                }

        # Create task (same as POST /tasks endpoint)
        task = Task(
            user_id=user.id,
            title=title.strip(),
            priority=priority,
            category=category,
            due_date=parsed_due_date,
            completed=False
        )

        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "priority": task.priority,
            "category": task.category,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "message": f"Task created: '{task.title}' (ID: {task.id})"
        }
    except Exception as e:
        session.rollback()
        return {
            "success": False,
            "error": str(e)
        }


def list_tasks(
    session: Session,
    user: User,
    status: str = "all",
    priority: Optional[str] = None
) -> Dict[str, Any]:
    """
    Execute list_tasks tool - Get user's tasks with optional filters.

    Multi-user isolation: WHERE user_id = user.id
    """
    try:
        # Base query - CRITICAL: Filter by user_id
        query = select(Task).where(Task.user_id == user.id)

        # Apply status filter
        if status == "pending":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)

        # Apply priority filter
        if priority:
            query = query.where(Task.priority == priority)

        # Execute query
        tasks = session.exec(query.order_by(Task.created_at.desc())).all()

        # Format tasks for AI response
        task_list = []
        for task in tasks:
            task_list.append({
                "id": task.id,
                "title": task.title,
                "completed": task.completed,
                "priority": task.priority,
                "category": task.category,
                "due_date": task.due_date.isoformat() if task.due_date else None,
                "created_at": task.created_at.isoformat()
            })

        return {
            "success": True,
            "count": len(task_list),
            "tasks": task_list,
            "message": f"Found {len(task_list)} task(s)"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }


def complete_task(
    session: Session,
    user: User,
    task_id: int,
    completed: bool = True
) -> Dict[str, Any]:
    """
    Execute complete_task tool - Mark a task as complete/incomplete.

    Security: Verify task belongs to user before updating
    """
    try:
        # Get task and verify ownership
        task = session.get(Task, task_id)

        if not task:
            return {
                "success": False,
                "error": f"Task {task_id} not found"
            }

        if task.user_id != user.id:
            return {
                "success": False,
                "error": f"Task {task_id} not found"  # Don't reveal existence
            }

        # Update completion status
        task.completed = completed
        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        status_text = "complete" if completed else "incomplete"
        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "completed": task.completed,
            "message": f"Task marked as {status_text}: '{task.title}'"
        }
    except Exception as e:
        session.rollback()
        return {
            "success": False,
            "error": str(e)
        }


def delete_task(
    session: Session,
    user: User,
    task_id: int
) -> Dict[str, Any]:
    """
    Execute delete_task tool - Delete a task permanently.

    Security: Verify task belongs to user before deleting
    """
    try:
        # Get task and verify ownership
        task = session.get(Task, task_id)

        if not task:
            return {
                "success": False,
                "error": f"Task {task_id} not found"
            }

        if task.user_id != user.id:
            return {
                "success": False,
                "error": f"Task {task_id} not found"  # Don't reveal existence
            }

        # Store title before deletion
        task_title = task.title

        # Delete task
        session.delete(task)
        session.commit()

        return {
            "success": True,
            "task_id": task_id,
            "message": f"Task deleted: '{task_title}'"
        }
    except Exception as e:
        session.rollback()
        return {
            "success": False,
            "error": str(e)
        }


def update_task(
    session: Session,
    user: User,
    task_id: int,
    title: Optional[str] = None,
    priority: Optional[str] = None,
    category: Optional[str] = None,
    due_date: Optional[str] = None
) -> Dict[str, Any]:
    """
    Execute update_task tool - Update task details.

    Security: Verify task belongs to user before updating
    """
    try:
        # Get task and verify ownership
        task = session.get(Task, task_id)

        if not task:
            return {
                "success": False,
                "error": f"Task {task_id} not found"
            }

        if task.user_id != user.id:
            return {
                "success": False,
                "error": f"Task {task_id} not found"  # Don't reveal existence
            }

        # Update fields if provided
        if title is not None:
            task.title = title.strip()

        if priority is not None:
            task.priority = priority

        if category is not None:
            task.category = category

        if due_date is not None:
            try:
                task.due_date = datetime.fromisoformat(due_date.replace("Z", "+00:00"))
            except ValueError:
                return {
                    "success": False,
                    "error": f"Invalid due date format: {due_date}"
                }

        task.updated_at = datetime.utcnow()

        session.add(task)
        session.commit()
        session.refresh(task)

        return {
            "success": True,
            "task_id": task.id,
            "title": task.title,
            "priority": task.priority,
            "category": task.category,
            "due_date": task.due_date.isoformat() if task.due_date else None,
            "message": f"Task updated: '{task.title}'"
        }
    except Exception as e:
        session.rollback()
        return {
            "success": False,
            "error": str(e)
        }


# ============================================================================
# TOOL DISPATCHER
# ============================================================================

def execute_tool(
    tool_name: str,
    tool_args: Dict[str, Any],
    session: Session,
    user: User
) -> Dict[str, Any]:
    """
    Execute a tool by name with provided arguments.

    This is called by the chat endpoint after Gemini decides which tool to use.
    """
    tool_functions = {
        "add_task": add_task,
        "list_tasks": list_tasks,
        "complete_task": complete_task,
        "delete_task": delete_task,
        "update_task": update_task
    }

    if tool_name not in tool_functions:
        return {
            "success": False,
            "error": f"Unknown tool: {tool_name}"
        }

    # Execute tool function
    tool_fn = tool_functions[tool_name]
    return tool_fn(session, user, **tool_args)
