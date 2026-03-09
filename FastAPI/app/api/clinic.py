from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
from ..models import SymptomRecord, User
from ..schemas import SymptomCreate, SymptomResponse, SymptomAssessmentResponse
from ..auth import get_current_user
import uuid

router = APIRouter(prefix="/clinic", tags=["clinic"])

from ..services.ml import ml_predictor
from ..services.llm import ai_generator

@router.post("/symptoms/submit", response_model=SymptomAssessmentResponse)
async def submit_symptoms(
    symptom_in: SymptomCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ML Prediction
    prediction = ml_predictor.predict(symptom_in.symptoms)
    predicted_disease = prediction.get('predicted_disease', 'Unknown')
    confidence_score = prediction.get('confidence_score', prediction.get('confidence', 0.0))
    top_predictions = prediction.get('top_predictions', [])
    description = prediction.get('description', '')
    precautions = prediction.get('precautions', [])
    
    # AI Refinement (Clinical validation)
    refined = await ai_generator.refine_diagnosis(
        symptom_in.symptoms,
        predicted_disease,
        confidence_score
    )
    
    if refined["is_overridden"]:
        predicted_disease = refined["refined_disease"]
        confidence_score = refined["refined_confidence"]

    # AI Insights (Async)
    insights = await ai_generator.generate_health_insights(
        symptom_in.symptoms, 
        predicted_disease
    )
    
    db_symptom = SymptomRecord(
        student_id=current_user.id,
        symptoms=symptom_in.symptoms,
        duration_days=symptom_in.duration_days,
        severity=symptom_in.severity,
        patient_age=symptom_in.patient_age,
        patient_sex=symptom_in.patient_sex,
        on_medication=symptom_in.on_medication,
        medication_adherence=symptom_in.medication_adherence,
        predicted_disease=predicted_disease,
        confidence_score=confidence_score,
        top_predictions=top_predictions,
        is_communicable=False, # This could be logic-based
        is_acute=True
    )
    
    db.add(db_symptom)
    await db.commit()
    await db.refresh(db_symptom)
    return {
        "id": db_symptom.id,
        "symptoms": db_symptom.symptoms,
        "duration_days": db_symptom.duration_days,
        "severity": db_symptom.severity,
        "patient_age": db_symptom.patient_age,
        "patient_sex": db_symptom.patient_sex,
        "predicted_disease": db_symptom.predicted_disease,
        "confidence_score": db_symptom.confidence_score,
        "top_predictions": db_symptom.top_predictions,
        "is_communicable": db_symptom.is_communicable,
        "is_acute": db_symptom.is_acute,
        "created_at": db_symptom.created_at,
        "summary": insights.get("summary", ""),
        "recommendations": insights.get("recommendations", []),
        "red_flags": insights.get("red_flags", []),
        "disclaimer": insights.get(
            "disclaimer",
            "This is an AI-generated preliminary assessment and does not constitute a formal medical diagnosis.",
        ),
        "description": description,
        "precautions": precautions,
    }

@router.get("/symptoms/history", response_model=list[SymptomResponse])
async def get_symptom_history(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy.future import select
    result = await db.execute(
        select(SymptomRecord)
        .where(SymptomRecord.student_id == current_user.id)
        .order_by(SymptomRecord.created_at.desc())
    )
    return result.scalars().all()

@router.get("/symptoms/personal-trends")
async def get_personal_trends(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy import func, select, and_
    from datetime import datetime, timedelta, timezone
    import json
    import uuid
    from ..models import HealthInsight


    
    DASHBOARD_TREND_SESSION_ID = uuid.UUID("00000000-0000-0000-0000-000000000000")
    
    # Check cache first (5 days)
    five_days_ago = datetime.now(timezone.utc) - timedelta(days=5)
    cache_query = await db.execute(
        select(HealthInsight)
        .where(
            and_(
                HealthInsight.student_id == current_user.id,
                HealthInsight.session_id == DASHBOARD_TREND_SESSION_ID
            )
        )
        .order_by(HealthInsight.generated_at.desc())
        .limit(1)
    )
    cached_insight = cache_query.scalar_one_or_none()
    
    if cached_insight and cached_insight.generated_at >= five_days_ago:
        try:
            return json.loads(cached_insight.insight_text)
        except Exception:
            pass # Generate new if JSON is invalid

    # Last 30 days data gathering
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    
    # Get top diseases for this user
    disease_result = await db.execute(
        select(SymptomRecord.predicted_disease, func.count(SymptomRecord.id))
        .where(
            and_(
                SymptomRecord.created_at >= thirty_days_ago,
                SymptomRecord.student_id == current_user.id
            )
        )
        .group_by(SymptomRecord.predicted_disease)
        .order_by(func.count(SymptomRecord.id).desc())
        .limit(3)
    )
    top_diseases = [row[0] for row in disease_result.all() if row[0]]
    
    # Get all symptoms from last 30 days for this user
    symptoms_result = await db.execute(
        select(SymptomRecord.symptoms)
        .where(
            and_(
                SymptomRecord.created_at >= thirty_days_ago,
                SymptomRecord.student_id == current_user.id
            )
        )
    )
    
    all_symptoms = []
    for row in symptoms_result.all():
        if isinstance(row[0], list):
            all_symptoms.extend([s for s in row[0] if s is not None])
            
    # Simple frequency count for symptoms
    from collections import Counter
    common_symptoms = [item for item, count in Counter(all_symptoms).most_common(5)]

    # --- Wellness Data Integration ---
    from ..models import WellnessCheckin
    wellness_result = await db.execute(
        select(WellnessCheckin)
        .where(
            and_(
                WellnessCheckin.created_at >= thirty_days_ago,
                WellnessCheckin.student_id == current_user.id
            )
        )
    )
    wellness_logs = wellness_result.scalars().all()
    
    wellness_data = None
    if wellness_logs:
        avg_stress = sum(log.stress_level for log in wellness_logs if log.stress_level) / len(wellness_logs)
        avg_sleep = sum(log.sleep_hours for log in wellness_logs if log.sleep_hours) / len(wellness_logs)
        moods = [log.mood for log in wellness_logs if log.mood]
        dominant_mood = Counter(moods).most_common(1)[0][0] if moods else "Neutral"
        activities = [log.physical_activity for log in wellness_logs if log.physical_activity]
        common_activity = Counter(activities).most_common(1)[0][0] if activities else "None"
        
        wellness_data = {
            "avg_stress": round(avg_stress, 1),
            "avg_sleep": round(avg_sleep, 1),
            "dominant_mood": dominant_mood,
            "common_activity": common_activity
        }
    # ---------------------------------
    
    if not top_diseases and not common_symptoms and not wellness_data:
        return {
            "summary": "Your health status is stable.",
            "awareness_message": "No significant personal health or wellness trends detected this month. Continue practicing good hygiene!",
            "general_tips": ["Drink plenty of water", "Maintain physical activity", "Ensure 7-8 hours of sleep"]
        }

    trends = await ai_generator.generate_personal_trends(
        top_diseases=top_diseases,
        top_symptoms=common_symptoms,
        wellness_data=wellness_data
    )

    # Save to cache
    new_insight = HealthInsight(
        student_id=current_user.id,
        session_id=DASHBOARD_TREND_SESSION_ID,
        insight_text=json.dumps(trends)
    )
    db.add(new_insight)
    await db.commit()

    return trends
