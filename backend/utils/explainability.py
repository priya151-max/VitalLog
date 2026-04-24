# import shap
import pandas as pd
import numpy as np
import joblib
import os

class ExplainabilityModule:
    def __init__(self, model_path):
        self.model_path = model_path
        try:
            self.pipeline = joblib.load(model_path)
            self.vectorizer = self.pipeline.named_steps['tfidf']
            self.model = self.pipeline.named_steps['clf']
        except:
            self.pipeline = None
            self.model = None

    def get_important_words(self, text, top_n=5):
        if not self.model or not self.vectorizer:
            return []
            
        # Get feature names
        feature_names = self.vectorizer.get_feature_names_out()
        
        # Transform text
        X = self.vectorizer.transform([text])
        
        # Simple attribution using coefficients for Logistic Regression
        # Since SHAP can be slow on-the-fly for every request, 
        # let's use a simpler "weight-based" highlight for linear models,
        # or a basic SHAP explainer if possible.
        
        # Get coefficients for the predicted class
        class_idx = np.argmax(self.model.predict_proba(X)[0])
        try:
            coefs = self.model.coef_[class_idx]
        except:
            # For multi-class if coef_ is not 2D
            coefs = self.model.coef_
            
        # Get non-zero features in the input
        feature_indices = X.nonzero()[1]
        
        word_scores = []
        for idx in feature_indices:
            score = coefs[idx] * X[0, idx]
            if score > 0: # Interested in positive influence
                word_scores.append((feature_names[idx], score))
                
        # Sort by score
        word_scores.sort(key=lambda x: x[1], reverse=True)
        
        return [word for word, score in word_scores[:top_n]]

if __name__ == "__main__":
    # Test
    # explainer = ExplainabilityModule("models/medical_model.joblib")
    pass
