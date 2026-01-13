from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.database import get_session
from app.models.user import User
from app.models.tag import Tag
from app.schemas.tag import TagCreate, TagUpdate, TagResponse
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/tags", tags=["Tags"])


@router.post("/", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag_data: TagCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Create a new tag for the current user."""
    # Check if tag with same name already exists for this user
    existing_tag = session.exec(
        select(Tag).where(
            Tag.user_id == current_user.id,
            Tag.name == tag_data.name
        )
    ).first()

    if existing_tag:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tag with this name already exists"
        )

    tag = Tag(
        user_id=current_user.id,
        name=tag_data.name,
        color=tag_data.color
    )

    session.add(tag)
    session.commit()
    session.refresh(tag)

    return tag


@router.get("/", response_model=List[TagResponse])
async def list_tags(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get all tags for the current user."""
    tags = session.exec(
        select(Tag)
        .where(Tag.user_id == current_user.id)
        .order_by(Tag.name)
    ).all()

    return tags


@router.get("/{tag_id}", response_model=TagResponse)
async def get_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Get a specific tag by ID."""
    tag = session.get(Tag, tag_id)

    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )

    if tag.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this tag"
        )

    return tag


@router.patch("/{tag_id}", response_model=TagResponse)
async def update_tag(
    tag_id: int,
    tag_data: TagUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Update a tag."""
    tag = session.get(Tag, tag_id)

    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )

    if tag.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this tag"
        )

    # Check for duplicate name if updating name
    if tag_data.name and tag_data.name != tag.name:
        existing_tag = session.exec(
            select(Tag).where(
                Tag.user_id == current_user.id,
                Tag.name == tag_data.name
            )
        ).first()

        if existing_tag:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tag with this name already exists"
            )

    # Update fields
    update_data = tag_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tag, field, value)

    session.add(tag)
    session.commit()
    session.refresh(tag)

    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Delete a tag."""
    tag = session.get(Tag, tag_id)

    if not tag:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tag not found"
        )

    if tag.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this tag"
        )

    session.delete(tag)
    session.commit()

    return None
