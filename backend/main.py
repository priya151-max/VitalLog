import os
import shutil
import random
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from nlp.predictor import MedicalPredictor
from ocr.engine import OCREngine
from utils.llm_client import llm_client
from utils.supabase_client import supabase, save_message, get_chat_history
from utils.knowledge_base import HEALTH_TIPS, HEALTH_QUOTES

app = FastAPI(title="VitalLog API - Production")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize modules
MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "medical_model.joblib")
predictor = MedicalPredictor(MODEL_PATH)
ocr_engine = OCREngine()

class ChatRequest(BaseModel):
    message: str
    conversation_id: str = "local-session"
    lang: str = "en"

@app.get("/")
def read_root():
    return {"status": "online", "version": "2.0.0-production"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/dashboard")
async def get_dashboard():
    return {
        "tip": random.choice(HEALTH_TIPS),
        "quote": random.choice(HEALTH_QUOTES),
        "metrics_summary": {
            "last_checkup": "2024-04-22",
            "overall_status": "Good",
            "alerts": 0
        }
    }

@app.get("/history/{conversation_id}")
async def fetch_history(conversation_id: str):
    history = get_chat_history(conversation_id)
    return {"history": history}

@app.post("/chat")
async def chat(request: ChatRequest):
    # 1. Get History (Handled by utility with try-except)
    try:
        history = get_chat_history(request.conversation_id)
    except:
        history = []
    
    # 2. Local Analysis (Expert Knowledge from Modules 1-6)
    local_analysis = predictor.get_full_analysis(request.message, request.lang)
    
    context = f"""
    Detected Specialty: {local_analysis['specialty']}
    Urgency Level: {local_analysis['urgency']}
    Detected Entities: {local_analysis['entities']}
    Local Summary: {local_analysis['summary']}
    """
    
    # 3. LLM Response (xAI/Qwen)
    llm_response = llm_client.get_response(request.message, medical_context=context, history=history)
    
    # 4. Save to DB (Persistent History)
    try:
        if request.conversation_id != "local-session":
            save_message(request.conversation_id, "user", request.message)
            save_message(request.conversation_id, "assistant", llm_response, metadata=local_analysis)
    except:
        pass

    return {
        "reply": llm_response,
        "analysis": local_analysis,
        "context_tags": {
            "specialty": local_analysis['specialty'],
            "urgency": local_analysis['urgency']
        }
    }

@app.post("/upload")
async def upload_report(file: UploadFile = File(...), conversation_id: str = Form("local-session")):
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 1. OCR Extraction
        text = ocr_engine.extract_text(temp_path)
        
        # 2. Local Analysis
        local_analysis = predictor.get_full_analysis(text)
        
        context = f"MEDICAL REPORT CONTENT:\n{text}\n\nANALYSIS:\n{local_analysis}"
        
        # 3. LLM Interpretation
        llm_response = llm_client.get_response("Please analyze this medical report.", medical_context=context)
        
        # 4. Save to DB
        try:
            if conversation_id != "local-session":
                save_message(conversation_id, "user", f"[Uploaded Report: {file.filename}]")
                save_message(conversation_id, "assistant", llm_response, metadata=local_analysis)
        except:
            pass

        return {
            "text": text,
            "analysis": local_analysis,
            "reply": llm_response
        }
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
