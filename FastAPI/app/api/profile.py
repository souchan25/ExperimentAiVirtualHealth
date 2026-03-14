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

    # Manually construct response so we can include cpsu_address from the User model
    return {
        "user_id": current_user.id,
        "age": profile.age,
        "sex": profile.sex,
        "blood_type": profile.blood_type,
        "allergies": profile.allergies,
        "pre_existing_conditions": profile.pre_existing_conditions,
        "emergency_contact_name": profile.emergency_contact_name,
        "emergency_contact_phone": profile.emergency_contact_phone,
        "cpsu_address": current_user.cpsu_address or "",
        "updated_at": profile.updated_at,
    }

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

    data = profile_in.model_dump(exclude_unset=True)
    cpsu_address = data.pop("cpsu_address", None)

    # Update health profile fields
    for field, value in data.items():
        setattr(profile, field, value)

    # Store address on the main User record
    if cpsu_address is not None:
        current_user.cpsu_address = cpsu_address

    await db.commit()
    await db.refresh(profile)
    return {
        "user_id": current_user.id,
        "age": profile.age,
        "sex": profile.sex,
        "blood_type": profile.blood_type,
        "allergies": profile.allergies,
        "pre_existing_conditions": profile.pre_existing_conditions,
        "emergency_contact_name": profile.emergency_contact_name,
        "emergency_contact_phone": profile.emergency_contact_phone,
        "cpsu_address": current_user.cpsu_address or "",
        "updated_at": profile.updated_at,
    }
