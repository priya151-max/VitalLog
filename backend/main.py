import os
import shutil
import random
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
#from nlp.predictor import MedicalPredictor
from backend.nlp.predictor import MedicalPredictor
from nlp.preprocessor import MedicalPreprocessor
from ocr.engine import OCREngine
from utils.llm_client import llm_client
from utils.local_db import (
    get_or_create_user, get_user_conversations,
    create_local_conversation, save_local_message,
    get_local_chat_history, get_all_local_metadata,
    delete_conversation
)
from utils.knowledge_base import HEALTH_TIPS, HEALTH_QUOTES
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

import logging

# Setup logging
logging.basicConfig(
    filename='api_debug.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="VitalLog API - Production")
logger.info("API Starting...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "medical_model.joblib")
predictor = MedicalPredictor(MODEL_PATH)
preprocessor = MedicalPreprocessor()
ocr_engine = OCREngine()

_sw = set(stopwords.words('english'))
_lemmatizer = WordNetLemmatizer()

# ─── NLP Trace Builder ─────────────────────────────────────────────────────

MEDICAL_VOCAB = {
    "fever","pain","headache","chest","cough","blood","glucose","hemoglobin",
    "pressure","heart","kidney","infection","diabetes","cancer","swelling",
    "nausea","vomiting","fatigue","breathe","breath","stroke","acute","severe",
    "creatinine","cholesterol","platelets","wbc","prescription","medication",
    "tablet","dosage","lab","report","result","test","scan","diagnosis",
    "symptom","treatment","surgery","allergy","inflammation","migraine","arthritis",
    "ph", "pco2", "po2", "abg", "hco3", "oxygen", "respiratory", "arterial", "metabolic"
}

def build_nlp_trace(text: str) -> dict:
    """
    Full NLP from-scratch pipeline trace.
    Returns every intermediate step so the frontend can display exactly
    what the backend does — tokenization → stopword removal → lemmatization → keyword detection.
    """
    try:
        raw_tokens = word_tokenize(text)
    except Exception:
        raw_tokens = text.split()

    raw_tokens_display = raw_tokens[:30]

    try:
        lowered = [t.lower() for t in raw_tokens]
        no_sw = [t for t in lowered if t.isalpha() and t not in _sw]
        lemmatized = [_lemmatizer.lemmatize(t) for t in no_sw]
    except Exception:
        lowered = [t.lower() for t in raw_tokens]
        no_sw = [t for t in lowered if t.isalpha()]
        lemmatized = no_sw[:]

    keywords = [t for t in lemmatized if t in MEDICAL_VOCAB]

    # Compute reduction stats
    removed_stopwords = len(lowered) - len(no_sw)
    compression_ratio = round((len(lemmatized) / max(len(raw_tokens), 1)) * 100, 1)

    return {
        "raw_tokens": raw_tokens_display,
        "after_lowercase": lowered[:25],
        "after_stopword_removal": no_sw[:20],
        "after_lemmatization": lemmatized[:20],
        "medical_keywords_identified": keywords,
        "token_count": len(raw_tokens),
        "meaningful_token_count": len(lemmatized),
        "stopwords_removed": removed_stopwords,
        "compression_ratio": compression_ratio,
    }

def build_nlp_first_reply(analysis: dict, lang: str = 'en') -> str:
    lines = []
    specialty = analysis.get('specialty', 'General Medicine')
    urgency = analysis.get('urgency', 'low')
    entities = analysis.get('entities', [])
    explanations = analysis.get('explanations', [])
    instructions = analysis.get('instructions', [])
    negation = analysis.get('negation_check', {})
    meds = analysis.get('medications', [])
    emotional = analysis.get('emotional_status', 'Stable')

    if entities:
        lines.append("**Extracted Medical Values:**")
        for e in entities:
            lines.append(f"- {e['name'].title()}: {e['value']}")
        lines.append("")

    if explanations:
        lines.append("**Clinical Interpretation:**")
        for exp in explanations:
            lines.append(f"- {exp}")
        lines.append("")

    if instructions:
        lines.append("**Medical Instructions Found:**")
        for inst in instructions:
            lines.append(f"- {inst}")
        lines.append("")

    confirmed = [k for k, v in negation.items() if 'Present' in v]
    absent = [k for k, v in negation.items() if 'Absent' in v]
    if confirmed:
        lines.append(f"**Confirmed Symptoms:** {', '.join(confirmed)}")
    if absent:
        lines.append(f"**Ruled Out Symptoms:** {', '.join(absent)}")
    if confirmed or absent:
        lines.append("")

    if meds:
        lines.append("**Medications Detected:**")
        for m in meds:
            lines.append(f"- {m['name']} — {m['dosage']}")

    return "\n".join(lines)

# ─── Pydantic Models ────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    conversation_id: str = "local-session"
    user_id: str = "anonymous"
    lang: str = "en"
    outputStyle: str = "paragraph"
    outputLength: int = 800
    sentiment: str = "positive"
    learningRate: float = 0.4

class ConvCreateRequest(BaseModel):
    user_id: str
    title: str

# ─── Routes ────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"status": "online", "version": "2.1.0-local-db"}

@app.get("/dashboard")
async def get_dashboard():
    return {
        "tip": random.choice(HEALTH_TIPS),
        "quote": random.choice(HEALTH_QUOTES),
        "metrics_summary": {"last_checkup": "Latest", "overall_status": "Monitored", "alerts": 0},
        "latest_metrics": {}
    }

@app.get("/analytics")
async def get_analytics():
    """Build analytics from real stored messages in local DB."""
    all_meta = get_all_local_metadata()

    urgency_map = {"low": 0, "medium": 0, "high": 0}
    emotional_map = {"Stable": 0, "Anxious": 0, "Distressed": 0}
    instruction_count = 0

    for meta in all_meta:
        u = meta.get('urgency', 'low').lower()
        if u in urgency_map:
            urgency_map[u] += 1
        e = meta.get('emotional_status', 'Stable')
        if e in emotional_map:
            emotional_map[e] += 1
        instruction_count += len(meta.get('instructions', []))

    # Seed with at least 1 to avoid empty charts on first load
    total = sum(urgency_map.values())
    if total == 0:
        urgency_map = {"low": 3, "medium": 2, "high": 1}
        emotional_map = {"Stable": 4, "Anxious": 1, "Distressed": 1}
        instruction_count = 2

    return {
        "urgency_distribution": [
            {"name": "Low", "count": urgency_map["low"]},
            {"name": "Medium", "count": urgency_map["medium"]},
            {"name": "High", "count": urgency_map["high"]},
        ],
        "emotional_status": [
            {"name": "Stable", "count": emotional_map["Stable"]},
            {"name": "Anxious", "count": emotional_map["Anxious"]},
            {"name": "Distressed", "count": emotional_map["Distressed"]},
        ],
        "instruction_trends": [{"date": "Current", "count": max(instruction_count, 1)}]
    }

# ─── Conversation Management ────────────────────────────────────────────────

@app.post("/conversations")
async def create_conversation(req: ConvCreateRequest):
    """Create a new conversation in local DB."""
    try:
        logger.info(f"Creating conversation for user {req.user_id} with title {req.title}")
        conv = create_local_conversation(req.user_id, req.title)
        return conv
    except Exception as e:
        logger.error(f"Failed to create conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{user_id}")
async def list_conversations(user_id: str):
    """List all conversations for a user from local DB."""
    convs = get_user_conversations(user_id)
    return {"conversations": convs}

@app.delete("/conversations/{conv_id}")
async def delete_conv(conv_id: str):
    """Delete a conversation and all its messages from local DB."""
    delete_conversation(conv_id)
    return {"status": "deleted", "id": conv_id}

@app.get("/history/{conversation_id}")
async def fetch_history(conversation_id: str):
    """Fetch full message history from local SQLite DB."""
    history = get_local_chat_history(conversation_id)
    return {"history": history}

# ─── User Management ────────────────────────────────────────────────────────

@app.post("/user/sync")
async def sync_user(data: dict):
    """Create or fetch a local user by email. Returns user_id."""
    email = data.get("email", "anonymous@local")
    user_id = get_or_create_user(email)
    return {"user_id": user_id, "email": email}

# ─── Chat ───────────────────────────────────────────────────────────────────

@app.post("/chat")
async def chat(request: ChatRequest):
    logger.info(f"Chat request: conv_id={request.conversation_id}, user_id={request.user_id}")
    # 1. Conversation ID
    conv_id = request.conversation_id
    is_local = conv_id == "local-session" or conv_id.startswith("local-")
    
    if is_local:
        logger.warning(f"Message in local session {conv_id} will NOT be saved to DB")

    # 2. Get history for context
    history = []
    if not is_local:
        history = get_local_chat_history(conv_id)

    # 3. Full NLP analysis from scratch (80% of work)
    local_analysis = predictor.get_full_analysis(request.message, request.lang)
    nlp_trace = build_nlp_trace(request.message)
    nlp_reply = build_nlp_first_reply(local_analysis, request.lang)

    # 4. Build LLM context (20% enrichment)
    custom_context = f"""
[NLP PIPELINE ANALYSIS]:
Specialty: {local_analysis['specialty']}
Urgency: {local_analysis['urgency']}
Emotional Status: {local_analysis['emotional_status']}
Entities: {local_analysis['entities']}
Instructions Found: {local_analysis['instructions']}

[NLP BASE REPLY ALREADY PROVIDED]:
{nlp_reply}

[OUTPUT STYLE]: {request.outputStyle}
"""
    llm_enrichment = llm_client.get_response(
        f"Enrich this medical analysis with empathy and any additional advice NOT already covered. Keep it to 2-3 short paragraphs. User asked: {request.message}",
        medical_context=custom_context,
        history=[{"role": m["role"], "content": m["content"]} for m in history[-6:]],
        temperature=request.learningRate
    )

    disclaimer = "\n\n> **Please keep in mind that I am not a doctor, and personalized advice from a healthcare professional is always the best course of action.**"
    
    if not llm_enrichment.startswith("Error"):
        final_reply = f"{nlp_reply}\n\n{llm_enrichment}{disclaimer}".strip()
    else:
        final_reply = f"{nlp_reply}{disclaimer}".strip()

    # 5. Save to local DB
    if not is_local:
        save_local_message(conv_id, "user", request.message)
        save_local_message(conv_id, "assistant", final_reply, metadata={
            "analysis": local_analysis,
            "nlp_trace": nlp_trace
        })

    return {
        "reply": final_reply,
        "analysis": local_analysis,
        "nlp_trace": nlp_trace,
        "context_tags": {
            "specialty": local_analysis['specialty'],
            "urgency": local_analysis['urgency']
        }
    }

# ─── Upload ─────────────────────────────────────────────────────────────────

@app.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    conversation_id: str = Form("local-session"),
    lang: str = Form("en"),
    user_id: str = Form("anonymous")
):
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        text = ocr_engine.extract_text(temp_path)
        if not text or len(text.strip()) < 10:
            text = "Medical report uploaded. Unable to extract sufficient text via OCR."

        local_analysis = predictor.get_full_analysis(text, lang)
        nlp_trace = build_nlp_trace(text)
        nlp_reply = build_nlp_first_reply(local_analysis, lang)

        context = f"REPORT TEXT (OCR):\n{text[:1000]}\n\nNLP ANALYSIS:\n{local_analysis}"
        llm_enrichment = llm_client.get_response(
            "Briefly interpret this medical report with empathy. 2-3 short paragraphs only.",
            medical_context=context
        )

        disclaimer = "\n\n> **Please keep in mind that I am not a doctor, and personalized advice from a healthcare professional is always the best course of action.**"
        
        if not llm_enrichment.startswith("Error"):
            final_reply = f"{nlp_reply}\n\n{llm_enrichment}{disclaimer}".strip()
        else:
            final_reply = f"{nlp_reply}{disclaimer}".strip()

        is_local = conversation_id == "local-session" or conversation_id.startswith("local-")
        if not is_local:
            save_local_message(conversation_id, "user", f"[Uploaded Report: {file.filename}]")
            save_local_message(conversation_id, "assistant", final_reply, metadata={
                "analysis": local_analysis,
                "nlp_trace": nlp_trace
            })

        return {
            "text": text,
            "analysis": local_analysis,
            "nlp_trace": nlp_trace,
            "reply": final_reply
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload processing failed: {str(e)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
