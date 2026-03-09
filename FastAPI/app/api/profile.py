from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import User, HealthProfile
from ..schemas import HealthProfileCreate, HealthProfileResponse
from ..auth import get_current_user

router = APIRouter(prefix="/profile", tags=["profile"])

@router.get("/", response_model=HealthProfileResponse)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(HealthProfile).where(HealthProfile.user_id == current_user.id))
    profile = result.scalars().first()
    
    if not profile:
        # Create an empty profile if it doesn't exist
        profile = HealthProfile(user_id=current_user.id)
        db.add(profile)
        await db.commit()
        await db.refresh(profile)
        
    return profile

@router.put("/", response_model=HealthProfileResponse)
async def update_profile(
    profile_in: HealthProfileCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(HealthProfile).where(HealthProfile.user_id == current_user.id))
    profile = result.scalars().first()
    
    if not profile:
        profile = HealthProfile(user_id=current_user.id)
        db.add(profile)
    
    for field, value in profile_in.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
        
    await db.commit()
    await db.refresh(profile)
    return profile
