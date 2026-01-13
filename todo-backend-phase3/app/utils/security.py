from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
import jwt
from app.config import settings

# Bcrypt password hashing with cost factor 12 (security requirement)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt with cost factor 12."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(user_id: str) -> tuple[str, datetime]:
    """
    Create a JWT access token.
    
    Returns:
        tuple: (token, expiration_datetime)
    """
    expires_at = datetime.utcnow() + timedelta(days=settings.jwt_expiration_days)
    payload = {
        "sub": user_id,
        "exp": expires_at,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm.strip())
    return token, expires_at


def verify_token(token: str) -> Optional[str]:
    """
    Verify a JWT token and return the user_id.
    
    Returns:
        str: user_id if token is valid, None otherwise
    """
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
