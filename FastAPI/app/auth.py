import bcrypt
import hashlib
import base64
import hmac
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from .config import settings

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

def _prehash(password: str) -> bytes:
    """SHA-256 prehash so bcrypt always receives a fixed 44-byte input."""
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return base64.b64encode(digest)

def _verify_django_pbkdf2_sha256(plain_password: str, encoded_password: str) -> bool:
    """Verify Django-style pbkdf2_sha256 hashes.

    Expected format: pbkdf2_sha256$<iterations>$<salt>$<hash>
    """
    try:
        algorithm, iterations_str, salt, stored_hash = encoded_password.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iterations_str)
        dk = hashlib.pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            iterations,
        )
        computed_hash = base64.b64encode(dk).decode("ascii").strip()
        return hmac.compare_digest(computed_hash, stored_hash)
    except Exception:
        return False

def is_legacy_django_hash(hashed_password: str) -> bool:
    return hashed_password.startswith("pbkdf2_sha256$")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Legacy Django users stored in Supabase may still have pbkdf2_sha256 hashes.
    if hashed_password.startswith("pbkdf2_sha256$"):
        return _verify_django_pbkdf2_sha256(plain_password, hashed_password)

    # Try with pre-hash (new standard)
    try:
        if bcrypt.checkpw(_prehash(plain_password), hashed_password.encode("utf-8")):
            return True
    except Exception:
        pass
        
    # Fallback to raw check for users registered before pre-hashing (legacy support)
    try:
        return bcrypt.checkpw(plain_password[:72].encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(_prehash(password), bcrypt.gensalt()).decode("utf-8")

from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .database import get_db
from .models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        school_id: str = payload.get("sub")
        if school_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    result = await db.execute(select(User).where(User.school_id == school_id))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

async def get_optional_user(token: Optional[str] = Depends(optional_oauth2_scheme), db: AsyncSession = Depends(get_db)) -> Optional[User]:
    """Returns None instead of raising 401 when no token is provided."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        school_id: str = payload.get("sub")
        if school_id is None:
            return None
        result = await db.execute(select(User).where(User.school_id == school_id))
        return result.scalars().first()
    except JWTError:
        return None
