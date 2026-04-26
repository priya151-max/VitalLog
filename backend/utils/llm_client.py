import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class LLMClient:
    def __init__(self):
        # OpenRouter uses an OpenAI-compatible API
        self.api_key = os.getenv("OPENROUTER_API_KEY")
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = os.getenv("LLM_MODEL", "google/gemini-2.0-flash-001")
        
        if self.api_key:
            self.client = OpenAI(
                api_key=self.api_key, 
                base_url=self.base_url
            )
        else:
            self.client = None

    def get_response(self, user_message, medical_context=None, history=None, temperature=0.7):
        if not self.client:
            return "LLM integration is pending API Key configuration. Please check your .env file."

        system_prompt = """You are VitalLog, a premium medical AI assistant. 
        Your goal is to simplify complex medical reports into plain language.
        
        RULES:
        1. Be empathetic but professional.
        2. Always include a disclaimer that you are not a doctor.
        3. Use the provided medical context (Specialty, Urgency, Entities) to make your answer highly relevant.
        4. If a value is abnormal (Low/High), explain what that means in simple terms.
        5. Structure your response with clear headings and bullet points for readability.
        6. DO NOT use any emojis in your response. Use text and standard punctuation only.
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
