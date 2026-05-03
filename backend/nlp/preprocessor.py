import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

def _has_nltk_resource(path):
    try:
        nltk.data.find(path)
        return True
    except LookupError:
        return False

class MedicalPreprocessor:
    def __init__(self):
        self.has_stopwords = _has_nltk_resource('corpora/stopwords')
        self.has_punkt = _has_nltk_resource('tokenizers/punkt')
        self.has_wordnet = _has_nltk_resource('corpora/wordnet')

        self.stop_words = set(stopwords.words('english')) if self.has_stopwords else set()
        self.lemmatizer = WordNetLemmatizer() if self.has_wordnet else None

    def clean_text(self, text):
        if not text:
            return ""
        # Lowercase
        text = text.lower()
        # Remove punctuation and special characters
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Tokenization
        tokens = word_tokenize(text) if self.has_punkt else text.split()
        # Stopword removal and lemmatization
        cleaned_tokens = [
            self.lemmatizer.lemmatize(token) if self.lemmatizer else token
            for token in tokens 
            if token not in self.stop_words
        ]
        return " ".join(cleaned_tokens)

if __name__ == "__main__":
    preprocessor = MedicalPreprocessor()
    sample = "The patient has low hemoglobin and is feeling tired."
    print(f"Original: {sample}")
    print(f"Cleaned: {preprocessor.clean_text(sample)}")
