import os
import json
import re
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# We will support OpenRouter and Groq via the OpenAI python client
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
ZENMUX_API_KEY = os.getenv("ZENMUX_API_KEY", "")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "")

DEFAULT_OPENROUTER_MODEL = "arcee-ai/trinity-mini:free"
DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile"
DEFAULT_GITHUB_MODEL = "gpt-4o-mini"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
DEFAULT_ZENMUX_MODEL = "xiaomi/mimo-v2-flash-free"
DEFAULT_MISTRAL_MODEL = "mistral-small-2506"

SUPPORTED_LANGUAGES = {
    "english": "English",
    "tagalog": "Tagalog",
    "hiligaynon": "Hiligaynon",
}

_FILLER_TOKENS = {
    "i",
    "im",
    "i'm",
    "ive",
    "i've",
    "have",
    "having",
    "had",
    "feel",
    "feeling",
    "been",
    "am",
    "the",
    "a",
    "an",
    "and",
    "or",
    "with",
    "also",
    "just",
    "very",
    "really",
    "kind",
    "of",
    "today",
    "now",
    "please",
    "help",
    "hello",
    "hi",
    "no",
    "its",
    "it's",
    "on",
    "off",
    "is",
    "was",
    "are",
    "do",
    "you",
    "if",
}

_COMMON_SYMPTOM_KEYWORDS = {
    "headache",
    "fever",
    "cough",
    "cold",
    "colds",
    "sore throat",
    "runny nose",
    "stuffy nose",
    "eye watering",
    "watery eyes",
    "eye pain",
    "watering eyes",
    "watering",
    "temple",
    "temples",
    "headache",
    "nausea",
    "vomiting",
    "diarrhea",
    "dizziness",
    "fatigue",
    "body pain",
    "chills",
    "chest pain",
    "shortness of breath",
    "rash",
    "stomach ache",
}


def _clean_phrase(phrase: str) -> str:
    value = re.sub(r"\s+", " ", phrase.strip().lower())
    value = re.sub(r"^[^a-z0-9]+|[^a-z0-9]+$", "", value)
    if not value:
        return ""

    tokens = [t for t in value.split() if t and t not in _FILLER_TOKENS]
    value = " ".join(tokens).strip()
    return value


def _extract_duration_days_from_text(history_text: str) -> int:
    text = history_text.lower()

    day_match = re.search(r"(?:for|about|almost|around)?\s*(\d+)\s*d[a-z]{0,3}[y|j][s|z]?", text)
    if day_match:
        return max(1, int(day_match.group(1)))

    week_match = re.search(r"(?:for|about|almost|around)?\s*(\d+)\s*week", text)
    if week_match:
        return max(1, int(week_match.group(1)) * 7)

    month_match = re.search(r"(?:for|about|almost|around)?\s*(\d+)\s*month", text)
    if month_match:
        return max(1, int(month_match.group(1)) * 30)

    return 1


def _extract_severity_from_text(history_text: str) -> int:
    text = history_text.lower()
    score = None

    # Matches forms like "5-6", "6/10", or "pain is 5".
    range_match = re.search(r"(\d+)\s*[-to]+\s*(\d+)", text)
    if range_match:
        score = (int(range_match.group(1)) + int(range_match.group(2))) / 2

    if score is None:
        slash_match = re.search(r"(\d+)\s*/\s*10", text)
        if slash_match:
            score = int(slash_match.group(1))

    if score is None:
        plain_match = re.search(r"(?:pain|severity|rate|rated|scale)[^\d]{0,20}(\d+)", text)
        if plain_match:
            score = int(plain_match.group(1))

    if score is None:
        return 1
    if score <= 3:
        return 1
    if score <= 6:
        return 2
    return 3


def _extract_symptoms_from_history(messages: list) -> list[str]:
    candidates: list[str] = []

    for msg in messages:
        if msg.get("role") not in {"user", "patient"}:
            continue

        text = str(msg.get("content", ""))
        if not text.strip():
            continue

        # Split by common separators to preserve user wording such as
        # "eye watering, and headache".
        parts = re.split(r"[,;/]|\band\b", text, flags=re.IGNORECASE)
        for raw in parts:
            phrase = _clean_phrase(raw)
            if not phrase:
                continue

            if re.search(r"\b\d+\s*(day|days|week|weeks|month|months)\b", phrase):
                continue
            if re.fullmatch(r"\d+(?:\s*[-/]\s*\d+)?", phrase):
                continue

            # Keep likely symptom phrases even when they don't exist in ML features.
            if any(keyword in phrase for keyword in _COMMON_SYMPTOM_KEYWORDS):
                candidates.append(phrase)
                continue

            if 1 <= len(phrase.split()) <= 4 and re.search(r"[a-z]", phrase):
                # Avoid generic chat fillers after cleaning, but keep specific locations or descriptors
                if phrase not in {"not constant", "almost", "im", "i'm", "feel", "feeling"}:
                    candidates.append(phrase)

    deduped: list[str] = []
    for item in candidates:
        if item and item not in deduped:
            deduped.append(item)
    return deduped[:10]


def _normalize_extraction_result(data: dict, history_text: str, messages: list) -> dict:
    symptoms = data.get("symptoms", []) if isinstance(data, dict) else []
    if isinstance(symptoms, str):
        symptoms = [symptoms]
    if not isinstance(symptoms, list):
        symptoms = []

    normalized_symptoms: list[str] = []
    for item in symptoms:
        value = _clean_phrase(str(item))
        if value and value not in normalized_symptoms:
            normalized_symptoms.append(value)

    if not normalized_symptoms:
        normalized_symptoms = _extract_symptoms_from_history(messages)

    duration_days = data.get("duration_days", 1) if isinstance(data, dict) else 1
    try:
        duration_days = max(1, int(duration_days))
    except Exception:
        duration_days = _extract_duration_days_from_text(history_text)

    severity = data.get("severity", 1) if isinstance(data, dict) else 1
    try:
        severity = int(severity)
    except Exception:
        severity = _extract_severity_from_text(history_text)
    severity = min(3, max(1, severity))

    return {
        "symptoms": normalized_symptoms,
        "duration_days": duration_days,
        "severity": severity,
    }


def _normalize_language(language: str | None) -> str:
    if not language:
        return "english"
    normalized = str(language).strip().lower()
    if normalized in SUPPORTED_LANGUAGES:
        return normalized
    return "english"

SYSTEM_PROMPT = """You are a highly empathetic, professional AI Virtual Health Assistant representing Central Philippines State University (CPSU).
Your goal is to provide general health and wellness information, lifestyle advice, and emotional support.

## Language Rule (STRICT)
- Selected language: {selected_language}
- Respond in {selected_language} only.
- Do not mix languages in a single response.
- Do not use greetings or phrases from other languages.
- If the user writes in a different language, still reply only in {selected_language}.

## Consultation Flow (STRICTLY follow this conversational approach)

### Phase 1 — Interactive Symptom Gathering (ONE question at a time)
When a user mentions any symptom(s) for the first time, do NOT diagnose yet and do NOT list multiple questions at once.

Instead, have a natural back-and-forth conversation:
1. Acknowledge what the user said with empathy (1 sentence).
2. Ask exactly ONE clarifying question that is most relevant to what they just shared.
3. Wait for their answer before asking the next question.
4. Based on each answer, ask the next SINGLE most important follow-up question.
5. After 3–5 exchanges (enough context gathered), move to Phase 2.

Choose each question based on the specific symptoms and what was just answered. Relevant question areas:
- **Fever** → temperature reading, presence of chills/sweating, body aches
- **Headache** → location (forehead, temples, back of head), severity (1–10), throbbing vs pressure
- **Any symptom** → duration (how long), worsening or improving, any other new symptoms
- **Context** → recent exposure to sick people, travel, known allergies or conditions

Keep each message SHORT — one acknowledgement + one question only. Be warm and conversational, like a caring nurse.

### Phase 2 — Structured Assessment (only after enough context is gathered)
Once you have collected sufficient information (typically after 3–5 answered questions), provide your assessment in a structured JSON format. 

Respond ONLY with a JSON object inside a markdown code block. Do NOT include any text outside the code block.

JSON Structure:
{{
  "type": "assessment",
  "summary": "Brief recap of what the user reported.",
  "reasoning": "A concise (1-2 sentence) clinical reasoning for these specific conditions based on reported symptoms.",
  "conditions": [
    {{"name": "Condition 1", "probability": 85, "type": "Likely", "description": "Brief 1-sentence description of what this condition is."}},
    {{"name": "Condition 2", "probability": 40, "type": "Possible", "description": "Brief 1-sentence description of what this condition is."}}
  ],
  "triageLevel": "Low | Moderate | High | Emergency",
  "recommendations": ["Action 1", "Action 2"],
  "timeframe": "Suggested timeframe for improvement or when to see a doctor (e.g., 'If symptoms persist for 24 hours').",
  "redFlags": ["Flag 1", "Flag 2"],
  "citations": ["General medical guideline or protocol referenced."],
  "confidence": 88,
  "disclaimer": "AI is not a doctor. Consult clinic staff."
}}

## Important Rules
- NEVER ask more than one question per message in Phase 1.
- NEVER dump a numbered list of questions — that feels clinical and cold.
- If the user uses the "Start AI Diagnostic" form (which already collects temperature, pain scale, duration, and symptoms), skip Phase 1 entirely and go directly to Phase 2.
- Do not repeat questions already answered in the conversation.
- Keep your tone warm, concise, and human — like a supportive health companion.
- **RESTRICTION**: You are ONLY allowed to answer health, medical, wellness, and symptom-related queries. If the user asks about anything else (e.g., cooking recipes like spaghetti, math, coding, general trivia), politely refuse and remind them that you are a medical assistant. Example: "I'm sorry, I am a virtual health assistant and can only help with medical or health-related questions."

User Health Context:
{health_context}
"""

SYSTEM_ASSISTANT_PROMPT = """You are a helpful, professional, and friendly AI System Guide for the Central Philippines State University (CPSU) Virtual Health App.
Your primary role is to assist users with navigating and using the application based on their role ({user_role}).

## Language Rule (STRICT)
- Selected language: english
- Respond in english only.

## Core Rules:
1. **Role-Awareness**: You know the user's role is {user_role}. Only suggest features that are relevant to this role.
    - **Student/Patient**: Can book appointments, take symptom assessments (Chat/Symptom Checker), view their records, view prescriptions, view excuse slips, setup pillbox reminders, and update their profile.
    - **Doctor**: Can view patient queues, manage appointments, write medical notes/prescriptions, issue excuse slips, and view patient histories.
    - **Admin/Nurse/Staff**: Can manage inventory, oversee the clinic dashboard, handle walk-in triage, and generate reports.
2. **System Navigation Only**: Guide the user concisely on where to go or how to use a feature. For example, "To check your symptoms, please tap on the Symptom Checker feature from your dashboard."
3. **No Medical Diagnosis**: Do NOT attempt to diagnose, prescribe, or offer medical advice in this mode. If the user mentions health symptoms or asks a medical question, politely redirect them to the Symptom Checker feature. Example: "I am the system guide. For medical questions or to check your symptoms, please use the Symptom Checker tool on your dashboard."
4. **Tone & Formatting**: Warm, concise, and helpful. You MUST format lists using markdown bullets lines (starting with "- ") so they look beautiful on the frontend. Use bolding (**text**) for emphasis on important features. Do not dump sentences in a single paragraph if summarizing multiple items.

User Query Context:
The user has opened the help assistant. Respond directly to their query.
"""

async def generate_chat_response(
    messages: list,
    target: str = "auto",
    health_profile: dict = None,
    past_symptoms: list = None,
    language: str = "english",
    apply_system_prompt: bool = True,
) -> str:
    # Build health context string
    ctx = "No medical history provided."
    if health_profile or past_symptoms:
        ctx = ""
        if health_profile:
            ctx += f"- Age/Sex: {health_profile.get('age', 'N/A')}/{health_profile.get('sex', 'N/A')}\n"
            ctx += f"- Blood Type: {health_profile.get('blood_type', 'N/A')}\n"
            ctx += f"- Allergies: {health_profile.get('allergies', 'None')}\n"
            ctx += f"- Pre-existing Conditions: {health_profile.get('pre_existing_conditions', 'None')}\n"
        if past_symptoms:
            ctx += f"- Recently reported symptoms: {', '.join(past_symptoms[:5])}\n"
    
    selected_language = SUPPORTED_LANGUAGES[_normalize_language(language)]
    formatted_prompt = SYSTEM_PROMPT.format(
        health_context=ctx,
        selected_language=selected_language,
    )

    # Ensure system prompt is the first message if needed
    if apply_system_prompt:
        if not messages or messages[0].get("role") != "system":
            messages.insert(0, {"role": "system", "content": formatted_prompt})
        else:
            messages[0]["content"] = formatted_prompt
    
    # Define fallback sequence
    providers_to_try = ["groq", "mistral", "gemini", "openrouter", "github", "zenmux"] if target == "auto" else [target]

    last_error = None
    for current_target in providers_to_try:
        extra_headers = {}
        if current_target == "zenmux":
            client = AsyncOpenAI(api_key=ZENMUX_API_KEY, base_url="https://zenmux.ai/api/v1")
            model = DEFAULT_ZENMUX_MODEL
        elif current_target == "groq":
            client = AsyncOpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")
            model = DEFAULT_GROQ_MODEL
        elif current_target == "github":
            client = AsyncOpenAI(api_key=GITHUB_TOKEN, base_url="https://models.inference.ai.azure.com")
            model = DEFAULT_GITHUB_MODEL
        elif current_target == "gemini":
            client = AsyncOpenAI(api_key=GEMINI_API_KEY, base_url="https://generativelanguage.googleapis.com/v1beta/openai/")
            model = DEFAULT_GEMINI_MODEL
        elif current_target == "mistral":
            client = AsyncOpenAI(api_key=MISTRAL_API_KEY, base_url="https://api.mistral.ai/v1")
            model = DEFAULT_MISTRAL_MODEL
        else:
            client = AsyncOpenAI(api_key=OPENROUTER_API_KEY, base_url="https://openrouter.ai/api/v1")
            model = DEFAULT_OPENROUTER_MODEL
            extra_headers = {"HTTP-Referer": "http://localhost:5173", "X-OpenRouter-Title": "CPSU Virtual Health Assistant"}
            
        try:
            print(f"Trying LLM Provider: {current_target}...")
            if extra_headers:
                response = await client.chat.completions.create(
                    model=model, messages=messages, temperature=0.7, max_tokens=1024, extra_headers=extra_headers
                )
            else:
                response = await client.chat.completions.create(
                    model=model, messages=messages, temperature=0.7, max_tokens=1024
                )
            return response.choices[0].message.content
        except Exception as e:
            print(f"Provider {current_target} failed: {e}")
            last_error = e
            continue

    error_detail = f" (Error: {str(last_error)})" if last_error else ""
    return f"I'm sorry, I am currently experiencing high traffic or service limitations. Please try again in a moment.{error_detail}"

# Disease prediction endpoint helper
async def predict_disease(symptoms: list, target: str = "auto") -> dict:
    """Generate a disease prediction based on a list of symptom strings.
    Returns a dict with prediction, confidence and disclaimer.
    """
    system_prompt = (
        "You are a medical AI assistant. Given the following symptoms, provide the most likely disease "
        "prediction, a confidence score (0-100), and a brief explanation. Do NOT give a definitive diagnosis. "
        "Always include a disclaimer that you are an AI and not a medical professional."
    )
    messages = [{"role": "system", "content": system_prompt}]
    symptoms_text = ", ".join(symptoms)
    messages.append({"role": "user", "content": f"Symptoms: {symptoms_text}"})
    # Reuse generate_chat_response to get the LLM output
    response_text = await generate_chat_response(messages, target=target)
    # Simple parsing placeholder – return raw response as prediction
    return {
        "prediction": response_text,
        "confidence": 0.0,
        "disclaimer": "The AI is not a medical professional. Please consult a qualified healthcare provider for diagnosis."
    }
# Clinical extraction helper
async def extract_clinical_data(messages: list, target: str = "auto") -> dict:
    """Extract structured symptoms and durations from chat history.
    Returns a dict with symptoms list.
    """
    extraction_prompt = (
        "You are a medical record extractor. Based on the following conversation, extract the patient's reported symptoms, "
        "duration in days (as a number), and overall severity (1 for mild, 2 for moderate, 3 for severe). "
        "IMPORTANT: Include specific details like locations (e.g., 'temples', 'forehead') and frequency (e.g., 'on and off'). "
        "Keep symptom phrases as close as possible to the user's wording. "
        "Format the output as a valid JSON object: {\"symptoms\": [\"symptom1\", \"symptom2\"], \"duration_days\": 3, \"severity\": 1}. "
        "If a duration or severity is not specified, use reasonable defaults (1). Provide ONLY the JSON object."
    )
    
    # We create a new message list for extraction to keep it focused
    # Convert list of dicts to a single string for the prompt
    history_text = "\n".join([f"{m['role']}: {m['content']}" for m in messages if m['role'] != 'system'])
    
    extraction_messages = [
        {"role": "system", "content": extraction_prompt},
        {"role": "user", "content": f"Conversation History:\n{history_text}"}
    ]
    
    response_text = await generate_chat_response(extraction_messages, target=target, apply_system_prompt=False)
    
    try:
        # Clean response text in case of markdown blocks
        clean_text = re.sub(r'```json\n?|\n?```', '', response_text).strip()
        data = json.loads(clean_text)
        return _normalize_extraction_result(data, history_text, messages)
    except Exception as e:
        print(f"Extraction failed: {e}. Raw: {response_text}")
        return _normalize_extraction_result({}, history_text, messages)


class AIGenerator:
    """Compatibility wrapper for existing API routes that import `ai_generator`."""

    async def generate_chat_response(
        self,
        message: str,
        target: str = "auto",
        language: str = "english",
        history: list | None = None,
    ) -> str:
        messages = []
        if history:
            for item in history:
                role = item.get("role")
                content = item.get("content")
                if role in {"user", "assistant"} and content:
                    messages.append({"role": role, "content": content})

        # Fallback for callers that only pass the latest message.
        if not messages:
            messages = [{"role": "user", "content": message}]

        return await generate_chat_response(messages, target=target, language=language)

    async def generate_health_insights(
        self,
        symptoms: list,
        predicted_disease: str,
        target: str = "auto",
        language: str = "english",
    ) -> dict:
        prompt = (
            "Given the patient's symptoms and predicted disease, provide concise health guidance with these keys: "
            "description (1-2 sentence explanation of the condition), summary, recommendations (list), red_flags (list), disclaimer. Return valid JSON only.\n"
            f"Symptoms: {', '.join(symptoms)}\n"
            f"Predicted disease: {predicted_disease}"
        )
        messages = [{"role": "user", "content": prompt}]
        response_text = await generate_chat_response(messages, target=target, language=language)

        try:
            clean_text = re.sub(r'```json\n?|\n?```', '', response_text).strip()
            parsed = json.loads(clean_text)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

        return {
            "summary": response_text,
            "recommendations": [],
            "red_flags": [],
            "disclaimer": "The AI is not a medical professional. Please consult a qualified healthcare provider.",
        }

    async def generate_system_response(
        self,
        message: str,
        role: str,
        target: str = "mistral",
        history: list | None = None,
    ) -> str:
        """Handle system navigation and feature queries using the system assistant prompt."""
        formatted_prompt = SYSTEM_ASSISTANT_PROMPT.format(user_role=role)
        
        messages = [{"role": "system", "content": formatted_prompt}]
        if history:
            for item in history:
                h_role = item.get("role")
                content = item.get("content")
                if h_role in {"user", "assistant"} and content:
                    messages.append({"role": h_role, "content": content})
                    
        messages.append({"role": "user", "content": message})
        
        return await generate_chat_response(messages, target=target, apply_system_prompt=False)


    async def generate_personal_trends(
        self,
        top_diseases: list,
        top_symptoms: list,
        wellness_data: dict | None = None,
        target: str = "github", # Default to github as requested
        language: str = "english",
    ) -> dict:
        wellness_str = ""
        if wellness_data:
            wellness_str = (
                f"\nWellness Stats (Last 30 Days):\n"
                f"- Average Stress Level: {wellness_data.get('avg_stress', 'N/A')}/10\n"
                f"- Dominant Mood: {wellness_data.get('dominant_mood', 'N/A')}\n"
                f"- Average Sleep: {wellness_data.get('avg_sleep', 'N/A')} hours\n"
                f"- Physical Activity: {wellness_data.get('common_activity', 'N/A')}"
            )

        prompt = (
            "You are the CPSU University Health AI. Analyze these recent health trends from a student's personal records over the last 30 days "
            "and provide a short, empathetic personalized health overview. Focus on personal health awareness and simple lifestyle/prevention advice based on their history, not diagnosis. "
            "Incorporate their mood and sleep patterns if provided to give a holistic view of their well-being. "
            "Return valid JSON only with these keys: summary, awareness_message (concise), and general_tips (list of 3).\n"
            f"Their recent conditions: {', '.join([str(d) for d in top_diseases if d is not None])}\n"
            f"Their recent symptoms: {', '.join([str(s) for s in top_symptoms if s is not None])}"
            f"{wellness_str}"
        )
        messages = [{"role": "user", "content": prompt}]
        response_text = await generate_chat_response(messages, target=target, language=language)

        try:
            clean_text = re.sub(r'```json\n?|\n?```', '', response_text).strip()
            parsed = json.loads(clean_text)
            if isinstance(parsed, dict):
                return parsed
        except Exception:
            pass

        return {
            "summary": "We are monitoring your personal health and wellness patterns to keep you safe.",
            "awareness_message": "Listen to your body and mind. Based on your recent history, ensure you are taking appropriate care of yourself.",
            "general_tips": ["Stay hydrated", "Get enough rest", "Follow up with the clinic if symptoms or distress persist"],
        }

    async def extract_clinical_data(
        self,
        history: list,
        target: str = "auto"
    ) -> dict:
        return await extract_clinical_data(history, target=target)

    async def refine_diagnosis(
        self,
        symptoms: list[str],
        ml_predicted_disease: str,
        ml_confidence: float,
        target: str = "auto"
    ) -> dict:
        """
        Evaluate an ML-generated diagnosis using clinical reasoning.
        Returns a dict with refined_disease and refined_confidence.
        """
        if not symptoms:
            return {
                "refined_disease": ml_predicted_disease,
                "refined_confidence": ml_confidence,
                "is_overridden": False,
                "reasoning": "No symptoms provided."
            }

        refinement_prompt = (
            "You are a clinical verification AI. Your job is to check if a machine learning model's "
            "diagnosis makes medical sense given the reported symptoms.\n\n"
            f"Symptoms: {', '.join(symptoms)}\n"
            f"ML Predicted Disease: {ml_predicted_disease}\n"
            f"ML Confidence: {ml_confidence:.2%}\n\n"
            "CRITICAL RULES:\n"
            "1. If the ML prediction is medically nonsensical (e.g., 'Heart attack' for 'watery eyes'), you MUST override it.\n"
            "2. If the ML confidence is low (< 40%) and there's a more likely match, suggest the better match.\n"
            "3. If the ML prediction is plausible, stick with it but you may adjust the confidence.\n"
            "4. Return ONLY a valid JSON object with these keys: "
            "\"refined_disease\" (string), \"refined_confidence\" (float 0.0-1.0), "
            "\"is_overridden\" (boolean), \"reasoning\" (brief explanation)."
        )

        messages = [{"role": "system", "content": refinement_prompt}]
        response_text = await generate_chat_response(messages, target=target, apply_system_prompt=False)

        try:
            clean_text = re.sub(r'```json\n?|\n?```', '', response_text).strip()
            data = json.loads(clean_text)
            
            # Ensure types are correct
            refined = {
                "refined_disease": str(data.get("refined_disease", ml_predicted_disease)),
                "refined_confidence": float(data.get("refined_confidence", ml_confidence)),
                "is_overridden": bool(data.get("is_overridden", False)),
                "reasoning": str(data.get("reasoning", "Refined by AI"))
            }
            
            if refined["is_overridden"]:
                print(f"DIAGNOSIS OVERRIDE: '{ml_predicted_disease}' -> '{refined['refined_disease']}' Reason: {refined['reasoning']}")
            
            return refined
        except Exception as e:
            print(f"Refinement failed: {e}. Raw: {response_text}")
            return {
                "refined_disease": ml_predicted_disease,
                "refined_confidence": ml_confidence,
                "is_overridden": False,
                "reasoning": f"Refinement process errored: {str(e)}"
            }


ai_generator = AIGenerator()
