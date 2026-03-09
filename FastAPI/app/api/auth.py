from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import text
from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserProfile, Token, UserLogin, ForgotPassword, ResetPassword
from ..auth import (
    get_password_hash, verify_password, create_access_token, 
    get_current_user, is_legacy_django_hash,
)
from ..config import settings
from ..services.email_service import send_reset_password_email
from jose import jwt
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserProfile)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user already exists
    result = await db.execute(select(User).where(User.school_id == user_in.school_id))
    if result.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="School ID already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        school_id=user_in.school_id,
        name=user_in.name,
        department=user_in.department,
        email=user_in.email,
        password=hashed_password,
        role=user_in.role
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.post("/login", response_model=Token)
async def login(
    user_credentials: Optional[UserLogin] = None, 
    school_id: Optional[str] = None, 
    password: Optional[str] = None, 
    db: AsyncSession = Depends(get_db)
):
    # Extract credentials from either JSON body or query parameters
    sid = user_credentials.school_id if user_credentials else school_id
    pwd = user_credentials.password if user_credentials else password
    
    if not sid or not pwd:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Login requires school_id and password"
        )

    result = await db.execute(select(User).where(User.school_id == sid))
    user = result.scalars().first()
    
    if not user or not verify_password(pwd, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect School ID or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Seamless migration: convert legacy Django hash after first successful login.
    if is_legacy_django_hash(user.password):
        new_hash = get_password_hash(pwd)
        # Legacy Django schema uses bigint users.id; update by immutable school_id.
        await db.execute(
            text("UPDATE users SET password = :password WHERE school_id = :school_id"),
            {"password": new_hash, "school_id": user.school_id},
        )
        await db.commit()
    
    access_token = create_access_token(data={"sub": user.school_id, "role": user.role})
    return {"access_token": access_token, "token_type": "bearer", "role": user.role, "user": user}

@router.get("/me", response_model=UserProfile)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=List[UserProfile])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Students can ONLY see staff members
    if current_user.role == "student":
        result = await db.execute(
            select(User).where(User.role == "staff").order_by(User.name.asc())
        )
        return result.scalars().all()

    # Staff should only see students for messaging/clinical workflows.
    if current_user.role == "staff":
        result = await db.execute(
            select(User).where(User.role == "student").order_by(User.date_joined.desc())
        )
        return result.scalars().all()

    result = await db.execute(select(User).order_by(User.date_joined.desc()))
    return result.scalars().all()
@router.patch("/consent")
async def update_consent(
    consent_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    current_user.data_consent_given = consent_data.get("data_consent_given", False)
    if current_user.data_consent_given:
        from datetime import datetime, timezone
        current_user.consent_date = datetime.now(timezone.utc)
    
    await db.commit()
    return {"status": "success"}

@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalars().first()
    
    if not user:
        # Don't reveal if user exists or not for security
        return {"status": "success", "message": "If the email is registered, a reset link will be sent."}
    
    # Generate a temporary reset token (JWT) valid for 1 hour
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    token_data = {"sub": user.school_id, "exp": expire, "action": "password_reset"}
    reset_token = jwt.encode(token_data, settings.SECRET_KEY, algorithm="HS256")
    
    # Send email
    sent = send_reset_password_email(user.email, reset_token)
    
    if not sent:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send reset email"
        )
        
    return {"status": "success", "message": "Reset link sent to your email"}

@router.post("/reset-password")
async def reset_password(data: ResetPassword, db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(data.token, settings.SECRET_KEY, algorithms=["HS256"])
        school_id = payload.get("sub")
        action = payload.get("action")
        
        if not school_id or action != "password_reset":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid reset token"
            )
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired"
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid reset token"
        )

    result = await db.execute(select(User).where(User.school_id == school_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
        
    # Update password
    hashed_password = get_password_hash(data.new_password)
    user.password = hashed_password
    
    await db.commit()
    return {"status": "success", "message": "Password updated successfully"}
