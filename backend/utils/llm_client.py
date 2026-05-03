import os
from pathlib import Path
from openai import OpenAI
from dotenv import load_dotenv

BACKEND_DIR = Path(__file__).resolve().parents[1]
load_dotenv(BACKEND_DIR / ".env", override=True)
load_dotenv(BACKEND_DIR / ".env.example", override=False)

class LLMClient:
    def __init__(self):
        # OpenRouter uses an OpenAI-compatible API
        self.api_key = (os.getenv("OPENROUTER_API_KEY") or "").strip()
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = (os.getenv("LLM_MODEL") or "openai/gpt-4o-mini").strip()
        
        if self.api_key:
            self.client = OpenAI(
                api_key=self.api_key, 
                base_url=self.base_url
            )
        else:
            self.client = None

    def get_response(self, user_message, medical_context=None, history=None, temperature=0.7):
        if not self.client:
            return "Error connecting to LLM: missing OPENROUTER_API_KEY in backend/.env"

        system_prompt = """You are VitalLog, a premium medical AI assistant. 
        Your goal is to simplify complex medical reports into plain language.
        
        RULES:
        1. Be empathetic but professional.
        2. Always include a disclaimer that you are not a doctor.
        3. Use the provided medical context (Specialty, Urgency, Entities) to make your answer highly relevant.
        4. If a value is abnormal (Low/High), explain what that means in simple terms.
        5. Structure your response with clear headings and bullet points for readability.
        6. DO NOT use any emojis in your response. Use text and standard punctuation only.
        7. IMPORTANT: Respond in the language requested by the user. If they speak in Tamil or the language setting is Tamil, respond ENTIRELY in Tamil.
        """
        
        if medical_context:
            system_prompt += f"\n\nCURRENT ANALYSIS CONTEXT:\n{medical_context}"

        messages = [{"role": "system", "content": system_prompt}]
        
        if history:
            for msg in history:
                messages.append({"role": msg["role"], "content": msg["content"]})
        
        messages.append({"role": "user", "content": user_message})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                max_tokens=1000,
                extra_headers={
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "VitalLog Medical Assistant",
                }
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Error connecting to LLM: {str(e)}"

# Singleton instance
llm_client = LLMClient()
