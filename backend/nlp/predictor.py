import re
import joblib
import os
try:
    from .preprocessor import MedicalPreprocessor
    from ..utils.knowledge_base import MEDICAL_DICT, DEFAULT_ADVICE
except ImportError:
    import sys
    sys.path.append(os.path.join(os.path.dirname(__file__), '..'))
    from nlp.preprocessor import MedicalPreprocessor
    from utils.knowledge_base import MEDICAL_DICT, DEFAULT_ADVICE

class MedicalPredictor:
    def __init__(self, model_path):
        self.model_path = model_path
        self.preprocessor = MedicalPreprocessor()
        try:
            self.model = joblib.load(model_path)
        except:
            self.model = None
            print(f"Warning: Model not found at {model_path}. Classification will be disabled.")

    def extract_entities(self, text):
        entities = []
        patterns = {
            "hemoglobin": r"(?:hemoglobin|hb)\D*(\d+\.?\d*)",
            "glucose": r"(?:glucose|sugar)\D*(\d+\.?\d*)",
            "blood pressure": r"(?:bp|blood pressure)\D*(\d{2,3}/\d{2,3})",
            "wbc": r"(?:wbc|white blood cell)\D*(\d+\.?\d*)",
            "platelets": r"(?:platelets|plt)\D*(\d+\.?\d*)",
            "cholesterol": r"(?:cholesterol|ldl)\D*(\d+\.?\d*)",
            "creatinine": r"(?:creatinine|creat)\D*(\d+\.?\d*)",
            "fever": r"(?:fever|temp|temperature)\D*(\d+\.?\d*)"
        }
        
        for name, pattern in patterns.items():
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                value = match.group(1)
                entities.append({"name": name, "value": value})
        
        return entities

    def analyze_findings(self, entities, lang='en'):
        explanations = []
        for ent in entities:
            name = ent['name']
            val_str = ent['value']
            
            # Simple threshold logic
            status = "normal"
            if name == "hemoglobin":
                val = float(val_str)
                if val < 12.0: status = "low"
                elif val > 17.0: status = "high"
            elif name == "glucose":
                val = float(val_str)
                if val > 140: status = "high"
                elif val < 70: status = "low"
            elif name == "platelets":
                val = float(val_str)
                if val < 150000: status = "low"
                elif val > 450000: status = "high"
            elif name == "cholesterol":
                val = float(val_str)
                if val > 200: status = "high"
            elif name == "creatinine":
                val = float(val_str)
                if val > 1.2: status = "high"
                elif val < 0.6: status = "low"
            elif name == "fever":
                val = float(val_str)
                if val > 100.4: status = "high"
            elif name == "blood pressure":
                try:
                    sys_bp = int(val_str.split('/')[0])
                    if sys_bp > 130: status = "high"
                    elif sys_bp < 90: status = "low"
                except: pass
            
            if name in MEDICAL_DICT and status in MEDICAL_DICT[name]:
                explanations.append(MEDICAL_DICT[name][status][lang])
        
        if not explanations:
            explanations.append(DEFAULT_ADVICE[lang])
            
        return explanations

    def detect_urgency(self, text):
        text = text.lower()
        high_terms = ["severe", "critical", "bleeding", "emergency", "chest pain", "stroke", "trauma", "acute", "shortness of breath", "icu"]
        medium_terms = ["moderate", "fever", "infection", "pain", "swelling", "nausea", "headache", "vomiting", "persistent", "abnormal"]
        low_terms = ["normal", "stable", "routine", "follow-up", "mild", "improved", "discharge", "well", "negative"]

        high_score = sum(term in text for term in high_terms)
        medium_score = sum(term in text for term in medium_terms)
        low_score = sum(term in text for term in low_terms)

        if high_score >= max(medium_score, low_score) and high_score > 0:
            return "high"
        if medium_score >= max(high_score, low_score) and medium_score > 0:
            return "medium"
        return "low"

    def predict_specialty(self, text):
        if not self.model:
            return "General Medicine"
        cleaned_text = self.preprocessor.clean_text(text)
        prediction = self.model.predict([cleaned_text])[0]
        return prediction

    def get_full_analysis(self, text, lang='en'):
        specialty = self.predict_specialty(text)
        urgency = self.detect_urgency(text)
        entities = self.extract_entities(text)
        explanations = self.analyze_findings(entities, lang)
        
        return {
            "specialty": specialty,
            "urgency": urgency,
            "entities": entities,
            "explanations": explanations,
            "summary": " ".join(explanations)
        }

if __name__ == "__main__":
    # Test
    model_path = r"c:\Users\kpriy\Desktop\NLP\VitalLog\backend\models\medical_model.joblib"
    predictor = MedicalPredictor(model_path)
    test_text = "The patient has hemoglobin 10.5 and glucose 180. Suggests diabetes."
    print(predictor.get_full_analysis(test_text, lang='en'))
