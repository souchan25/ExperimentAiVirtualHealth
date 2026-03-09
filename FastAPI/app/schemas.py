from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any, Literal
from datetime import datetime, date, time
from uuid import UUID

# User Schemas
class UserBase(BaseModel):
    school_id: str
    name: str
    department: str
    email: Optional[EmailStr] = None
    role: str = "student"

class UserCreate(UserBase):
    password: str

class UserProfile(UserBase):
    id: int
    is_active: bool
    is_staff: bool
    date_joined: datetime
    data_consent_given: bool
    consent_date: Optional[datetime] = None
    has_seen_tour: bool

    class Config:
        from_attributes = True

# Symptom Schemas
class SymptomBase(BaseModel):
    symptoms: List[str]
    duration_days: int = 1
    severity: int = 1
    patient_age: Optional[int] = None
    patient_sex: Optional[str] = ""

class SymptomCreate(SymptomBase):
    on_medication: bool = False
    medication_adherence: Optional[bool] = None

class SymptomResponse(SymptomBase):
    id: UUID
    predicted_disease: str
    confidence_score: Optional[float] = None
    top_predictions: Optional[List[dict]] = None
    is_communicable: bool
    is_acute: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SymptomAssessmentResponse(SymptomResponse):
    summary: str = ""
    recommendations: List[str] = []
    red_flags: List[str] = []
    disclaimer: str = ""
    description: str = ""
    precautions: List[str] = []

# Emergency Schemas
class EmergencyTrigger(BaseModel):
    location: str
    symptoms: List[str] = []
    description: str = ""

class EmergencyUpdate(BaseModel):
    location: Optional[str] = None
    status: Optional[str] = None

class EmergencyResponse(BaseModel):
    id: UUID
    location: str
    symptoms: List[str]
    description: str
    status: str
    priority: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Medication Schemas  
class MedicationCreate(BaseModel):
    name: str
    dosage: str
    frequency: str
    schedule_times: List[str] = []
    start_date: date
    end_date: date
    instructions: str = ""
    purpose: str = ""
    symptom_record_id: Optional[UUID] = None

class MedicationResponse(MedicationCreate):
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class MedicationLogResponse(BaseModel):
    id: UUID
    medication_id: UUID
    scheduled_date: date
    scheduled_time: time
    status: str
    taken_at: Optional[datetime] = None
    notes: str
    
    class Config:
        from_attributes = True

# Follow-Up Schemas
class FollowUpResponse(BaseModel):
    id: UUID
    symptom_record_id: UUID
    scheduled_date: date
    status: str
    outcome: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# Chat Schemas
class ChatSessionCreate(BaseModel):
    language: Literal["english", "tagalog", "hiligaynon"] = "english"

class ChatSessionResponse(BaseModel):
    id: UUID
    started_at: datetime
    language: str

    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[UUID] = None
    history: Optional[List[dict]] = None

class HealthInsightResponse(BaseModel):
    id: UUID
    category: str = "General"  # Adding a default to map to the LLM response
    insight_text: str
    reliability_score: float

    class Config:
        from_attributes = True

# Auth Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user: Optional[UserProfile] = None

class TokenData(BaseModel):
    school_id: Optional[str] = None

class UserLogin(BaseModel):
    school_id: str
    password: str

# Medical Document Schemas
class MedicalDocumentBase(BaseModel):
    document_type: str
    file_name: str

class MedicalDocumentCreate(MedicalDocumentBase):
    pass

class MedicalDocumentResponse(MedicalDocumentBase):
    id: UUID
    student_id: int
    file_path: str
    extracted_data: dict = {}
    ai_confidence: Optional[float] = None
    uploaded_at: datetime
    reviewed_by_id: Optional[int] = None
    review_notes: str = ""
    status: str
    
    class Config:
        from_attributes = True

# Excuse Slip Schemas
class ExcuseSlipBase(BaseModel):
    start_date: date
    end_date: date
    reason: str

class ExcuseSlipCreate(ExcuseSlipBase):
    student_id: int
    symptom_record_id: Optional[UUID] = None

class ExcuseSlipResponse(ExcuseSlipBase):
    id: UUID
    student_id: int
    issued_by_id: int
    symptom_record_id: Optional[UUID] = None
    file_path: str
    issued_at: datetime
    is_valid: bool

    class Config:
        from_attributes = True

# Inventory Schemas
class InventoryItemBase(BaseModel):
    name: str
    category: str = "Medicine"
    description: str = ""
    current_stock: int = 0
    min_stock_level: int = 10
    unit: str = "pcs"

class InventoryItemCreate(InventoryItemBase):
    pass

class InventoryItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    current_stock: Optional[int] = None
    min_stock_level: Optional[int] = None
    unit: Optional[str] = None

class InventoryItemResponse(InventoryItemBase):
    id: UUID
    last_restocked: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class StockTransactionBase(BaseModel):
    item_id: UUID
    transaction_type: str # 'addition', 'deduction', 'adjustment'
    quantity: int
    source: str = "Manual"
    notes: str = ""

class StockTransactionCreate(StockTransactionBase):
    pass

class StockTransactionResponse(StockTransactionBase):
    id: UUID
    user_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Wellness Check-in Schemas
class WellnessCheckinBase(BaseModel):
    mood: str
    stress_level: int
    sleep_hours: float
    physical_activity: str
    notes: Optional[str] = ""

class WellnessCheckinCreate(WellnessCheckinBase):
    pass

class WellnessCheckinResponse(WellnessCheckinBase):
    id: UUID
    student_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Notification Schemas
class NotificationBase(BaseModel):
    title: str
    message: str
    notification_type: str
    link: Optional[str] = None

class NotificationCreate(NotificationBase):
    user_id: int

class NotificationResponse(NotificationBase):
    id: UUID
    user_id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# First-Aid Knowledge Base Schemas
class FirstAidArticleBase(BaseModel):
    title: str
    content: str
    category: str
    tags: Optional[str] = None
    is_published: bool = True

class FirstAidArticleCreate(FirstAidArticleBase):
    pass

class FirstAidArticleResponse(FirstAidArticleBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Campus Alert Schemas
class CampusAlertBase(BaseModel):
    title: str
    message: str
    severity: str # 'Low', 'Medium', 'High', 'Critical'
    target_role: str = "all"
    is_active: bool = True
    expires_at: Optional[datetime] = None

class CampusAlertCreate(CampusAlertBase):
    pass

class CampusAlertResponse(CampusAlertBase):
    id: UUID
    created_at: datetime
    created_by_id: int
    
    class Config:
        from_attributes = True

# Health Profile Schemas
class HealthProfileBase(BaseModel):
    age: Optional[int] = None
    sex: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = ""
    pre_existing_conditions: Optional[str] = ""
    emergency_contact_name: Optional[str] = ""
    emergency_contact_phone: Optional[str] = ""

class HealthProfileCreate(HealthProfileBase):
    pass

class HealthProfileResponse(HealthProfileBase):
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    scheduled_date: date
    scheduled_time: time
    purpose: str
    notes: Optional[str] = ""

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentResponse(AppointmentBase):
    id: UUID
    student_id: int
    staff_id: Optional[int] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Message Schemas
class MessageCreate(BaseModel):
    recipient_id: int
    content: str

class MessageResponse(BaseModel):
    id: str
    sender_id: int
    recipient_id: int
    sender_name: Optional[str] = None
    recipient_name: Optional[str] = None
    content: str
    is_read: bool
    timestamp: datetime

    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogResponse(BaseModel):
    id: UUID
    user_id: Optional[UUID] = None
    action: str
    model_name: str
    object_id: str
    changes: dict
    timestamp: datetime
    success: bool

    class Config:
        from_attributes = True

# User Settings Schemas
class UserSettingsBase(BaseModel):
    email_notifications: bool = True
    push_notifications: bool = True
    theme: str = "light"
    language: str = "en"

class UserSettingsUpdate(BaseModel):
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    theme: Optional[str] = None
    language: Optional[str] = None

class UserSettingsResponse(UserSettingsBase):
    user_id: int
    updated_at: datetime

    class Config:
        from_attributes = True

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class ForgotPassword(BaseModel):
    email: EmailStr

class ResetPassword(BaseModel):
    token: str
    new_password: str
