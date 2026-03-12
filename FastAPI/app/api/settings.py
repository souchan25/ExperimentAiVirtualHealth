from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from ..database import get_db
from ..models import User, UserSettings, SystemSettings
from ..schemas import UserSettingsUpdate, UserSettingsResponse, PasswordChange, SystemSettingsResponse, SystemSettingsUpdate
from ..auth import get_current_user, get_password_hash, verify_password, require_role

router = APIRouter(prefix="/settings", tags=["settings"])

@router.get("/", response_model=UserSettingsResponse)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    user_settings = result.scalars().first()
    
    if not user_settings:
        # Create default settings if they don't exist
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)
        await db.commit()
        await db.refresh(user_settings)
        
    return user_settings

@router.patch("/", response_model=UserSettingsResponse)
async def update_settings(
    settings_in: UserSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = await db.execute(select(UserSettings).where(UserSettings.user_id == current_user.id))
    user_settings = result.scalars().first()
    
    if not user_settings:
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)
    
    update_data = settings_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user_settings, field, value)
        
    await db.commit()
    await db.refresh(user_settings)
    return user_settings

@router.post("/password")
async def change_password(
    password_in: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(password_in.current_password, current_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    current_user.password = get_password_hash(password_in.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}

# System Settings (Dynamic Permissions)

@router.get("/system", response_model=list[SystemSettingsResponse])
async def get_system_settings(
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(SystemSettings))
    # If empty, create defaults
    settings = result.scalars().all()
    if not settings:
        default_settings = [
            SystemSettings(setting_key="student_can_delete_records", setting_value={"enabled": False}, description="Allow students to delete their symptom records"),
            SystemSettings(setting_key="student_can_view_staff_notes", setting_value={"enabled": False}, description="Allow students to view internal staff notes on their records"),
        ]
        db.add_all(default_settings)
        await db.commit()
        
        result = await db.execute(select(SystemSettings))
        settings = result.scalars().all()
        
    return settings

@router.put("/system/{setting_key}", response_model=SystemSettingsResponse)
async def update_system_setting(
    setting_key: str,
    setting_in: SystemSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    result = await db.execute(select(SystemSettings).where(SystemSettings.setting_key == setting_key))
    setting_record = result.scalars().first()
    
    if not setting_record:
        raise HTTPException(status_code=404, detail="System setting not found")
        
    if setting_in.setting_value is not None:
        setting_record.setting_value = setting_in.setting_value
    if setting_in.description is not None:
        setting_record.description = setting_in.description
        
    setting_record.updated_by_id = current_user.id
    await db.commit()
    await db.refresh(setting_record)
    
    return setting_record
