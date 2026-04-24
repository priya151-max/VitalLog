# Medical Knowledge Base (Simplified)
# Supports English and Tamil

MEDICAL_DICT = {
    "hemoglobin": {
        "low": {
            "en": "Your hemoglobin level is low. This may cause tiredness or weakness. Please consult a doctor for proper advice.",
            "ta": "உங்கள் இரத்தத்தில் ஹீமோகுளோபின் அளவு குறைவாக உள்ளது. இது சோர்வு அல்லது பலவீனத்தை ஏற்படுத்தலாம். மருத்துவரை அணுகவும்."
        },
        "normal": {
            "en": "Your hemoglobin level is normal. This indicates healthy blood oxygen levels.",
            "ta": "உங்கள் ஹீமோகுளோபின் அளவு சாதாரணமாக உள்ளது. இது ஆரோக்கியமான இரத்த ஆக்ஸிஜன் அளவைக் குறிக்கிறது."
        },
        "high": {
            "en": "Your hemoglobin level is high. This may indicate dehydration or other issues. Consult a doctor.",
            "ta": "உங்கள் ஹீமோகுளோபின் அளவு அதிகமாக உள்ளது. இது நீரிழப்பு அல்லது பிற பிரச்சினைகளைக் குறிக்கலாம்."
        }
    },
    "glucose": {
        "high": {
            "en": "Your sugar level is high. This may indicate diabetes risk. Avoid sugary foods and consult a doctor.",
            "ta": "உங்கள் சர்க்கரை அளவு அதிகமாக உள்ளது. இது நீரிழிவு நோய்க்கான அறிகுறியாக இருக்கலாம். இனிப்புகளைத் தவிர்க்கவும்."
        },
        "low": {
            "en": "Your sugar level is low (hypoglycemia). This can cause dizziness. Eat something sweet and see a doctor.",
            "ta": "உங்கள் சர்க்கரை அளவு குறைவாக உள்ளது. இது மயக்கத்தை ஏற்படுத்தலாம். இனிப்பான ஒன்றை சாப்பிட்டு மருத்துவரை அணுகவும்."
        },
        "normal": {
            "en": "Your blood sugar levels are within the normal range. Good job maintaining a healthy diet.",
            "ta": "உங்கள் இரத்த சர்க்கரை அளவு சாதாரணமாக உள்ளது. ஆரோக்கியமான உணவைத் தொடரவும்."
        }
    },
    "blood pressure": {
        "high": {
            "en": "Your blood pressure is high (hypertension). This can lead to heart issues. Reduce salt and see a doctor.",
            "ta": "உங்கள் இரத்த அழுத்தம் அதிகமாக உள்ளது. இது இதயப் பிரச்சினைகளை ஏற்படுத்தலாம். உப்பைக் குறைத்து மருத்துவரை அணுகவும்."
        },
        "low": {
            "en": "Your blood pressure is low (hypotension). This may cause fainting. Stay hydrated and consult a doctor.",
            "ta": "உங்கள் இரத்த அழுத்தம் குறைவாக உள்ளது. இது மயக்கத்தை ஏற்படுத்தலாம். தாராளமாகத் தண்ணீர் குடிக்கவும்."
        }
    },
    "wbc": {
        "high": {
            "en": "Your White Blood Cell count is high. This often means your body is fighting an infection.",
            "ta": "உங்கள் வெள்ளை இரத்த அணுக்களின் எண்ணிக்கை அதிகமாக உள்ளது. இது ஒரு தொற்றுநோய்க்கு எதிரான போராட்டத்தைக் குறிக்கலாம்."
        }
    }
}

HEALTH_TIPS = [
    {"en": "Drink at least 8 glasses of water daily to stay hydrated.", "ta": "உடலில் நீர்ச்சத்தை பராமரிக்க தினமும் குறைந்தது 8 கிளாஸ் தண்ணீர் குடிக்கவும்."},
    {"en": "30 minutes of walking every day can improve your heart health.", "ta": "தினமும் 30 நிமிடங்கள் நடப்பது உங்கள் இதய ஆரோக்கியத்தை மேம்படுத்தும்."},
    {"en": "Include leafy greens in your diet for essential vitamins.", "ta": "அத்தியாவசிய வைட்டமின்களுக்கு உங்கள் உணவில் கீரைகளைச் சேர்த்துக்கொள்ளுங்கள்."},
    {"en": "Avoid excessive salt to maintain healthy blood pressure.", "ta": "ஆரோக்கியமான இரத்த அழுத்தத்தை பராமரிக்க அதிகப்படியான உப்பைத் தவிர்க்கவும்."},
    {"en": "Getting 7-8 hours of sleep is crucial for mental well-being.", "ta": "மன ஆரோக்கியத்திற்கு 7-8 மணிநேர தூக்கம் அவசியம்."}
]

HEALTH_QUOTES = [
    {"en": "Health is wealth.", "ta": "நோயற்ற வாழ்வே குறைவற்ற செல்வம்."},
    {"en": "A healthy outside starts from the inside.", "ta": "ஆரோக்கியமான வெளித்தோற்றம் உட்புறத்திலிருந்து தொடங்குகிறது."},
    {"en": "The greatest wealth is health.", "ta": "மிகப்பெரிய செல்வம் ஆரோக்கியம்."}
]

DEFAULT_ADVICE = {
    "en": "I couldn't find specific details, but please keep a healthy lifestyle. Consult a doctor for confirmation.",
    "ta": "குறிப்பிட்ட விவரங்கள் கிடைக்கவில்லை, ஆனால் ஆரோக்கியமான வாழ்க்கை முறையைப் பின்பற்றுங்கள். ஆலோசனைக்கு மருத்துவரை அணுகவும்."
}
