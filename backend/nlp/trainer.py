import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report
try:
    from .preprocessor import MedicalPreprocessor
except ImportError:
    from preprocessor import MedicalPreprocessor

class MedicalTrainer:
    def __init__(self, data_path, model_dir):
        self.data_path = data_path
        self.model_dir = model_dir
        self.preprocessor = MedicalPreprocessor()
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)

    def train(self):
        print("Loading data...")
        df = pd.read_csv(self.data_path)
        
        # Limit to 1000 samples for faster processing
        df = df.sample(n=min(1000, len(df)), random_state=42)
        
        # Drop rows with missing transcription or medical_specialty
        df = df.dropna(subset=['transcription', 'medical_specialty'])
        
        print("Preprocessing transcriptions...")
        # For efficiency, let's take a subset if the dataset is too huge, 
        # or just process it all if possible.
        # mtsamples usually has ~5000 rows.
        df['cleaned_text'] = df['transcription'].apply(self.preprocessor.clean_text)
        
        X = df['cleaned_text']
        y = df['medical_specialty']
        
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        print("Training model (Logistic Regression + TF-IDF)...")
        pipeline = Pipeline([
            ('tfidf', TfidfVectorizer(ngram_range=(1, 2))),
            ('clf', LogisticRegression(max_iter=1000))
        ])
        
        pipeline.fit(X_train, y_train)
        
        print("Evaluating model...")
        y_pred = pipeline.predict(X_test)
        print(classification_report(y_test, y_pred))
        
        # Save model and vectorizer
        import joblib
        model_path = os.path.join(self.model_dir, 'medical_model.joblib')
        joblib.dump(pipeline, model_path)
        print(f"Model saved to {model_path}")
        return pipeline

if __name__ == "__main__":
    # Path to mtsamples.csv
    mtsamples_path = r"c:\Users\kpriy\Desktop\NLP\dataset\mtsamples.csv"
    model_directory = r"c:\Users\kpriy\Desktop\NLP\VitalLog\backend\models"
    
    trainer = MedicalTrainer(mtsamples_path, model_directory)
    trainer.train()
