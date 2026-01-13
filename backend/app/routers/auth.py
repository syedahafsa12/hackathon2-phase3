from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
import uuid

from app.database import get_session
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, LoginRequest, AuthResponse
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    request: Request,
    user_data: UserCreate,
    session: Session = Depends(get_session)
):
    """
    Register a new user account.
    """
    # Check if email already exists
    existing_user = session.exec(
        select(User).where(User.email == user_data.email)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        name=user_data.name,
        password_hash=hash_password(user_data.password)
    )
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    # Generate JWT token
    token, expires_at = create_access_token(user.id)
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=token,
        expires_at=expires_at
    )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: Request,
    login_data: LoginRequest,
    session: Session = Depends(get_session)
):
    """
    Login with email and password.
    """
    # Find user by email
    user = session.exec(
        select(User).where(User.email == login_data.email)
    ).first()
    
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate JWT token
    token, expires_at = create_access_token(user.id)
    
    return AuthResponse(
        user=UserResponse.model_validate(user),
        token=token,
        expires_at=expires_at
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user's profile information."""
    return UserResponse.model_validate(current_user)
