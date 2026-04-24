import re
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from nltk.tokenize import word_tokenize

# Download necessary NLTK data sparingly
def download_nltk_resources():
    resources = [
        ('corpora', 'stopwords'),
        ('tokenizers', 'punkt'),
        ('corpora', 'wordnet')
    ]
    for category, resource in resources:
        try:
            nltk.data.find(f'{category}/{resource}')
        except LookupError:
            nltk.download(resource, quiet=True)

download_nltk_resources()

class MedicalPreprocessor:
    def __init__(self):
        self.stop_words = set(stopwords.words('english'))
        self.lemmatizer = WordNetLemmatizer()

    def clean_text(self, text):
        if not text:
            return ""
        # Lowercase
        text = text.lower()
        # Remove punctuation and special characters
        text = re.sub(r'[^a-zA-Z\s]', '', text)
        # Tokenization
        tokens = word_tokenize(text)
        # Stopword removal and lemmatization
        cleaned_tokens = [
            self.lemmatizer.lemmatize(token) 
            for token in tokens 
            if token not in self.stop_words
        ]
        return " ".join(cleaned_tokens)

if __name__ == "__main__":
    preprocessor = MedicalPreprocessor()
    sample = "The patient has low hemoglobin and is feeling tired."
    print(f"Original: {sample}")
    print(f"Cleaned: {preprocessor.clean_text(sample)}")
