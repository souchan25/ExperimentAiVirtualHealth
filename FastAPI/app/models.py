from sqlalchemy import (
    Column, Integer, BigInteger, String, Boolean, DateTime, ForeignKey, 
    Text, JSON, Float, UUID, Date, Time
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    school_id = Column(String(20), unique=True, index=True, nullable=False)
    name = Column(String(150), default="")
    role = Column(String(10), default="student")  # 'student' or 'staff'
    department = Column(String(100), default="")
    cpsu_address = Column(String(255), default="")
    email = Column(String(255), unique=True, nullable=True)
    password = Column(String(255), nullable=False)  # Hashed password
    
    is_active = Column(Boolean, default=True)
    is_staff = Column(Boolean, default=False)
    is_superuser = Column(Boolean, default=False)  # Django PermissionsMixin compat
    date_joined = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)  # Django AbstractBaseUser compat
    
    data_consent_given = Column(Boolean, default=False)
    consent_date = Column(DateTime(timezone=True), nullable=True)
    has_seen_tour = Column(Boolean, default=False)

    # Relationships
    symptom_records = relationship("SymptomRecord", back_populates="student")
    follow_ups = relationship("FollowUp", back_populates="student", foreign_keys="FollowUp.student_id")
    chat_sessions = relationship("ChatSession", back_populates="student")
    emergency_alerts = relationship("EmergencyAlert", back_populates="student", foreign_keys="EmergencyAlert.student_id")
    medications = relationship("Medication", back_populates="student", foreign_keys="Medication.student_id")
    sent_messages = relationship("Message", back_populates="sender", foreign_keys="Message.sender_id")
    received_messages = relationship("Message", back_populates="recipient", foreign_keys="Message.recipient_id")
    appointments = relationship("Appointment", back_populates="student", foreign_keys="Appointment.student_id")
    medical_documents = relationship("MedicalDocument", back_populates="student", foreign_keys="MedicalDocument.student_id")
    excuse_slips = relationship("ExcuseSlip", back_populates="student", foreign_keys="ExcuseSlip.student_id")
    wellness_checkins = relationship("WellnessCheckin", back_populates="student")
    notifications = relationship("Notification", back_populates="user")
    health_profile = relationship("HealthProfile", back_populates="user", uselist=False)
    settings = relationship("UserSettings", back_populates="user", uselist=False)

class HealthProfile(Base):
    __tablename__ = "health_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(BigInteger, ForeignKey("users.id"), unique=True)
    
    age = Column(Integer, nullable=True)
    sex = Column(String(20), nullable=True)
    blood_type = Column(String(10), nullable=True)
    
    allergies = Column(Text, default="")
    pre_existing_conditions = Column(Text, default="")
    emergency_contact_name = Column(String(150), default="")
    emergency_contact_phone = Column(String(50), default="")
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="health_profile")

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(BigInteger, ForeignKey("users.id"), unique=True)
    
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    theme = Column(String(20), default="light") # 'light', 'dark'
    language = Column(String(10), default="en") # 'en', 'fil'
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="settings")

class SymptomRecord(Base):
    __tablename__ = "symptom_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(BigInteger, ForeignKey("users.id"))
    
    symptoms = Column(JSON, nullable=False)
    duration_days = Column(Integer, default=1)
    severity = Column(Integer, default=1)  # 1: Mild, 2: Moderate, 3: Severe
    
    patient_age = Column(Integer, nullable=True)
    patient_sex = Column(String(10), default="")
    
    predicted_disease = Column(String(100), default="")
    confidence_score = Column(Float, nullable=True)
    top_predictions = Column(JSON, nullable=True)
    
    on_medication = Column(Boolean, default=False)
    medication_adherence = Column(Boolean, nullable=True)
    
    is_communicable = Column(Boolean, default=False)
    is_acute = Column(Boolean, default=True)
    icd10_code = Column(String(10), default="")
    status = Column(String(20), default="pending")  # 'pending', 'under_review', 'referred', 'resolved', 'closed'
    staff_notes = Column(Text, nullable=True)
    
    requires_referral = Column(Boolean, default=False)
    referral_triggered = Column(Boolean, default=False)
    referral_date = Column(DateTime(timezone=True), nullable=True)
    
    staff_diagnosis = Column(String(200), default="")
    final_diagnosis = Column(String(200), default="")
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    student = relationship("User", back_populates="symptom_records")

class FollowUp(Base):
    __tablename__ = "follow_ups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    symptom_record_id = Column(UUID(as_uuid=True), ForeignKey("symptom_records.id"))
    student_id = Column(BigInteger, ForeignKey("users.id"))
    
    scheduled_date = Column(Date, nullable=False)
    status = Column(String(20), default="pending")  # 'pending', 'completed', 'overdue', 'cancelled'
    
    response_date = Column(DateTime(timezone=True), nullable=True)
    outcome = Column(String(20), nullable=True)  # 'improved', 'same', 'worse', 'resolved'
    notes = Column(Text, default="")
    
    still_experiencing_symptoms = Column(Boolean, nullable=True)
    new_symptoms = Column(JSON, default=list)
    
    reviewed_by_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    review_notes = Column(Text, default="")
    requires_appointment = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    student = relationship("User", back_populates="follow_ups", foreign_keys=[student_id])
    symptom_record = relationship("SymptomRecord")
    reviewer = relationship("User", foreign_keys=[reviewed_by_id])

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(BigInteger, ForeignKey("users.id"))
    
    started_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    ended_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, default=0)
    language = Column(String(20), default="english")
    
    topics_discussed = Column(JSON, default=list)
    insights_generated_count = Column(Integer, default=0)

    student = relationship("User", back_populates="chat_sessions")
    insights = relationship("HealthInsight", back_populates="session", primaryjoin="ChatSession.id == HealthInsight.session_id", foreign_keys="[HealthInsight.session_id]")

class HealthInsight(Base):
    __tablename__ = "health_insights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(BigInteger, ForeignKey("users.id"))
    session_id = Column(UUID(as_uuid=True), index=True)  # Plain UUID, no FK (matches Django)
    
    insight_text = Column(Text, nullable=False)
    references = Column(JSON, default=list)
    reliability_score = Column(Float, default=0.0)
    
    generated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())

    session = relationship("ChatSession", back_populates="insights", primaryjoin="HealthInsight.session_id == ChatSession.id", foreign_keys="[HealthInsight.session_id]")

class EmergencyAlert(Base):
    __tablename__ = "emergency_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(BigInteger, ForeignKey("users.id"))
    
    location = Column(String(255), nullable=False)
    symptoms = Column(JSON, default=list)
    description = Column(Text, default="")
    
    status = Column(String(20), default="active")  # 'active', 'responding', 'resolved', 'false_alarm'
    priority = Column(Integer, default=100)
    
    responded_by_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    response_time = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, default="")
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    student = relationship("User", back_populates="emergency_alerts", foreign_keys=[student_id])
    responder = relationship("User", foreign_keys=[responded_by_id])

class Medication(Base):
    __tablename__ = "medications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(BigInteger, ForeignKey("users.id"))
    prescribed_by_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    
    name = Column(String(200), nullable=False)
    dosage = Column(String(100), nullable=False)
    frequency = Column(String(50), nullable=False)
    schedule_times = Column(JSON, default=list)
    
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    instructions = Column(Text, default="")
    purpose = Column(String(200), default="")
    is_active = Column(Boolean, default=True)
    
    symptom_record_id = Column(UUID(as_uuid=True), ForeignKey("symptom_records.id"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    student = relationship("User", back_populates="medications", foreign_keys=[student_id])
    prescriber = relationship("User", foreign_keys=[prescribed_by_id])
    logs = relationship("MedicationLog", back_populates="medication")

class MedicationLog(Base):
    __tablename__ = "medication_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    medication_id = Column(UUID(as_uuid=True), ForeignKey("medications.id"))
    
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(Time, nullable=False)
    
    status = Column(String(20), default="pending")  # 'pending', 'taken', 'missed', 'skipped'
    taken_at = Column(DateTime(timezone=True), nullable=True)
    notes = Column(Text, default="")
    
    reminder_sent = Column(Boolean, default=False)
    reminder_sent_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    medication = relationship("Medication", back_populates="logs")

class Message(Base):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sender_id = Column(BigInteger, ForeignKey("users.id"))
    recipient_id = Column(BigInteger, ForeignKey("users.id"))
    
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())

    sender = relationship("User", back_populates="sent_messages", foreign_keys=[sender_id])
    recipient = relationship("User", back_populates="received_messages", foreign_keys=[recipient_id])

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(BigInteger, ForeignKey("users.id"))
    staff_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    
    scheduled_date = Column(Date, nullable=False)
    scheduled_time = Column(Time, nullable=False)
    
    purpose = Column(String(200), nullable=False)
    notes = Column(Text, default="")
    status = Column(String(20), default="pending")
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    student = relationship("User", back_populates="appointments", foreign_keys=[student_id])
    staff = relationship("User", foreign_keys=[staff_id])

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    
    action = Column(String(20), nullable=False)
    model_name = Column(String(50), default="")
    object_id = Column(String(50), default="")
    changes = Column(JSON, default=dict)
    
    timestamp = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, default="")
    success = Column(Boolean, default=True)
    error_message = Column(Text, default="")

class ConsentLog(Base):
    __tablename__ = "consent_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    
    action = Column(String(10), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, default="")
    timestamp = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())

class DepartmentStats(Base):
    __tablename__ = "department_stats"

    id = Column(Integer, primary_key=True)
    department = Column(String(100), unique=True, index=True)
    
    total_students = Column(Integer, default=0)
    students_with_symptoms = Column(Integer, default=0)
    percentage_with_symptoms = Column(Float, default=0.0)
    
    top_diseases = Column(JSON, default=list)
    communicable_count = Column(Integer, default=0)
    non_communicable_count = Column(Integer, default=0)
    acute_count = Column(Integer, default=0)
    chronic_count = Column(Integer, default=0)
    referral_pending_count = Column(Integer, default=0)
    
    last_updated = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

class MedicalDocument(Base):
    __tablename__ = "medical_documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(BigInteger, ForeignKey("users.id"))
    
    document_type = Column(String(50), nullable=False) # e.g., 'lab_result', 'medical_certificate'
    file_path = Column(String(255), nullable=False)
    file_name = Column(String(255), nullable=False)
    
    extracted_data = Column(JSON, default=dict)
    ai_confidence = Column(Float, nullable=True)
    
    uploaded_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    reviewed_by_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)
    review_notes = Column(Text, default="")
    status = Column(String(20), default="pending") # 'pending', 'reviewed', 'rejected'

    student = relationship("User", back_populates="medical_documents", foreign_keys=[student_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by_id])

class ExcuseSlip(Base):
    __tablename__ = "excuse_slips"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(BigInteger, ForeignKey("users.id"))
    issued_by_id = Column(BigInteger, ForeignKey("users.id"))
    symptom_record_id = Column(UUID(as_uuid=True), ForeignKey("symptom_records.id"), nullable=True)
    
    file_path = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    reason = Column(Text, nullable=False)
    
    issued_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    is_valid = Column(Boolean, default=True)

    student = relationship("User", back_populates="excuse_slips", foreign_keys=[student_id])
    issuer = relationship("User", foreign_keys=[issued_by_id])
    symptom_record = relationship("SymptomRecord", foreign_keys=[symptom_record_id])

class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(50), default="Medicine") # 'Medicine', 'Supplies', 'Equipment'
    description = Column(Text, default="")
    
    current_stock = Column(Integer, default=0)
    min_stock_level = Column(Integer, default=10) # Threshold for alerts
    unit = Column(String(20), default="pcs") # 'pcs', 'bottles', 'boxes'
    
    last_restocked = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())

    transactions = relationship("StockTransaction", back_populates="item")

class StockTransaction(Base):
    __tablename__ = "stock_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    item_id = Column(UUID(as_uuid=True), ForeignKey("inventory_items.id"))
    user_id = Column(BigInteger, ForeignKey("users.id")) # Staff who performed the action
    
    transaction_type = Column(String(20), nullable=False) # 'addition', 'deduction', 'adjustment'
    quantity = Column(Integer, nullable=False)
    source = Column(String(50), default="Manual") # 'Manual', 'Prescription', 'Restock'
    notes = Column(Text, default="")
    
    timestamp = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())

    item = relationship("InventoryItem", back_populates="transactions")
    user = relationship("User")

class WellnessCheckin(Base):
    __tablename__ = "wellness_checkins"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(BigInteger, ForeignKey("users.id"))
    
    mood = Column(String(50)) # 'Happy', 'Stressed', 'Sad', 'Anxious', 'Neutral'
    stress_level = Column(Integer) # 1-10
    sleep_hours = Column(Float)
    sleep_quality = Column(String(50), nullable=True) # 'Good', 'Fair', 'Poor'
    physical_activity = Column(String(100))
    notes = Column(Text, default="")
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())

    student = relationship("User", back_populates="wellness_checkins")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50)) # 'Medication', 'System', 'Wellness', 'Emergency'
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True) # Optional URL to redirect
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())

    user = relationship("User", back_populates="notifications")

class FirstAidArticle(Base):
    __tablename__ = "first_aid_articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100)) # 'Emergency', 'Injury', 'Illness', 'General'
    tags = Column(String(255)) # Comma separated
    is_published = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class CampusAlert(Base):
    __tablename__ = "campus_alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String(20)) # 'Low', 'Medium', 'High', 'Critical'
    target_role = Column(String(20), default="all") # 'student', 'staff', 'all'
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now())
    created_by_id = Column(BigInteger, ForeignKey("users.id"))

    created_by = relationship("User")

class SystemSettings(Base):
    __tablename__ = "system_settings"

    id = Column(Integer, primary_key=True)
    setting_key = Column(String(100), unique=True, index=True, nullable=False)
    setting_value = Column(JSON, nullable=False)
    description = Column(Text, default="")
    
    updated_at = Column(DateTime(timezone=True), default=func.now(), server_default=func.now(), onupdate=func.now())
    updated_by_id = Column(BigInteger, ForeignKey("users.id"), nullable=True)

    updated_by = relationship("User")
