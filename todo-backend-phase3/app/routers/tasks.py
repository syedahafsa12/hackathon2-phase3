from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select, func, or_
from typing import Optional, List
from datetime import datetime

from app.database import get_session
from app.models.user import User
from app.models.task import Task, PriorityEnum
from app.models.tag import Tag, TaskTag
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new task for the current user."""
    # Create task
    task = Task(
        user_id=current_user.id,
        title=task_data.title,
        description=task_data.description,
        priority=task_data.priority,
        category=task_data.category,
        due_date=task_data.due_date,
        estimated_minutes=task_data.estimated_minutes,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    # Add tags if provided
    if task_data.tag_ids:
        for tag_id in task_data.tag_ids:
            # Verify tag belongs to user
            tag = session.get(Tag, tag_id)
            if tag and tag.user_id == current_user.id:
                task_tag = TaskTag(task_id=task.id, tag_id=tag_id)
                session.add(task_tag)

        session.commit()
        session.refresh(task)

    return task


@router.get("/", response_model=TaskListResponse)
async def list_tasks(
    completed: Optional[bool] = None,
    priority: Optional[PriorityEnum] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
    tag_ids: Optional[List[int]] = Query(None),
    sort_by: str = Query("created_at", pattern="^(created_at|due_date|priority|title)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Get all tasks for the current user with filtering, search, and pagination.

    Filters:
    - completed: Filter by completion status
    - priority: Filter by priority level (high, medium, low)
    - category: Filter by category name
    - search: Search in title and description
    - tag_ids: Filter by tag IDs (multiple allowed)
    - sort_by: Sort field (created_at, due_date, priority, title)
    - sort_order: Sort direction (asc, desc)
    """
    # Base query
    query = select(Task).where(Task.user_id == current_user.id)

    # Apply filters
    if completed is not None:
        query = query.where(Task.completed == completed)

    if priority is not None:
        query = query.where(Task.priority == priority)

    if category is not None:
        query = query.where(Task.category == category)

    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            or_(
                Task.title.ilike(search_pattern),
                Task.description.ilike(search_pattern)
            )
        )

    if tag_ids:
        # Filter tasks that have ANY of the specified tags
        subquery = select(TaskTag.task_id).where(TaskTag.tag_id.in_(tag_ids))
        query = query.where(Task.id.in_(subquery))

    # Get total count before pagination
    count_query = select(func.count()).select_from(query.subquery())
    total = session.exec(count_query).one()

    # Count completed and pending
    completed_query = select(func.count()).where(
        Task.user_id == current_user.id,
        Task.completed == True
    )
    completed_count = session.exec(completed_query).one()

    pending_count = total - completed_count

    # Apply sorting
    if sort_by == "priority":
        # Custom priority sorting (high > medium > low)
        priority_order = {
            PriorityEnum.high: 1,
            PriorityEnum.medium: 2,
            PriorityEnum.low: 3
        }
        query = query.order_by(
            Task.priority.asc() if sort_order == "asc" else Task.priority.desc()
        )
    elif sort_by == "due_date":
        query = query.order_by(
            Task.due_date.asc() if sort_order == "asc" else Task.due_date.desc()
        )
    elif sort_by == "title":
        query = query.order_by(
            Task.title.asc() if sort_order == "asc" else Task.title.desc()
        )
    else:  # created_at
        query = query.order_by(
            Task.created_at.asc() if sort_order == "asc" else Task.created_at.desc()
        )

    # Apply pagination
    query = query.offset(skip).limit(limit)

    # Execute query
    tasks = session.exec(query).all()

    return TaskListResponse(
        tasks=tasks,
        total=total,
        completed=completed_count,
        pending=pending_count
    )


@router.patch("/bulk-update", response_model=List[TaskResponse])
async def bulk_update_tasks(
    task_data: TaskUpdate,
    task_ids: List[int] = Query(...),
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update multiple tasks at once (e.g., mark all as completed)."""
    # Verify all tasks belong to user
    tasks = session.exec(
        select(Task).where(
            Task.id.in_(task_ids),
            Task.user_id == current_user.id
        )
    ).all()

    if len(tasks) != len(task_ids):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Some tasks do not exist or you don't have permission to update them"
        )

    # Update fields (excluding tag_ids for bulk updates)
    update_data = task_data.model_dump(exclude_unset=True, exclude={"tag_ids"})

    for task in tasks:
        for field, value in update_data.items():
            setattr(task, field, value)
        task.updated_at = datetime.utcnow()
        session.add(task)

    session.commit()

    # Refresh all tasks
    for task in tasks:
        session.refresh(task)

    return tasks


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific task by ID."""
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this task"
        )

    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a task."""
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this task"
        )

    # Update fields
    update_data = task_data.model_dump(exclude_unset=True, exclude={"tag_ids"})
    for field, value in update_data.items():
        setattr(task, field, value)

    task.updated_at = datetime.utcnow()

    # Update tags if provided
    if task_data.tag_ids is not None:
        # Remove existing tags
        session.exec(select(TaskTag).where(TaskTag.task_id == task_id)).all()
        for task_tag in session.exec(select(TaskTag).where(TaskTag.task_id == task_id)):
            session.delete(task_tag)

        # Add new tags
        for tag_id in task_data.tag_ids:
            tag = session.get(Tag, tag_id)
            if tag and tag.user_id == current_user.id:
                task_tag = TaskTag(task_id=task.id, tag_id=tag_id)
                session.add(task_tag)

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a task."""
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    if task.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this task"
        )

    session.delete(task)
    session.commit()

    return None


@router.post("/bulk-delete", status_code=status.HTTP_204_NO_CONTENT)
async def bulk_delete_tasks(
    task_ids: List[int],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete multiple tasks at once."""
    # Verify all tasks belong to user
    tasks = session.exec(
        select(Task).where(
            Task.id.in_(task_ids),
            Task.user_id == current_user.id
        )
    ).all()

    if len(tasks) != len(task_ids):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Some tasks do not exist or you don't have permission to delete them"
        )

    for task in tasks:
        session.delete(task)

    session.commit()

    return None



