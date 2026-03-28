import re
import joblib
import os
import numpy as np

MODEL_PATH = 'model/ai_detector_model.pkl'
VECTORIZER_PATH = 'model/tfidf_vectorizer.pkl'

def simple_tokenize(text):
    """Robust tokenization without NLTK dependencies"""
    return re.findall(r'\b\w+\b', text.lower()) if isinstance(text, str) else []

def extract_features_hybrid(text):
    """
    Checklist 5B: Advanced Stylometric Features (Regex-based)
    - Sentence variation
    - Word length
    - Punctuation density
    - Vocabulary richness (TTR)
    """
    if not text or len(text) < 10:
        return 0, {}

    try:
        words = simple_tokenize(text)
        sentences = text.split('.')
        
        avg_sentence_len = len(words) / len(sentences) if len(sentences) > 0 else 0
        avg_word_length = sum(len(word) for word in words) / len(words) if len(words) > 0 else 0
        ttr = len(set(words)) / len(words) if len(words) > 0 else 0
        
        punct_count = len(re.findall(r'[.,!?;:]', text))
        para_count = len(text.split('\n\n'))
        
        # AI markers (LLM typical phrases)
        ai_markers = ["furthermore", "moreover", "in conclusion", "additionally", "delve", "crucial", "essential", "notably"]
        marker_count = sum(1 for m in ai_markers if m in text.lower())

        # Combining for a heuristic score (0-100)
        h_score = 0
        if avg_word_length > 5.5: h_score += 25
        if marker_count > 1: h_score += 30
        if ttr < 0.65: h_score += 25 # Low richness usually AI
        
        return h_score, {
            "avg_sentence_length": round(avg_sentence_len, 2),
            "word_richness": round(ttr, 2),
            "marker_signals": marker_count,
            "punctuation_count": punct_count
        }
    except Exception as e:
        print(f"Feature extraction error: {e}")
        return 0, {}

def detect_ai_text(text):
    """
    Checklist 6: Model Implementation (Random Forest Fallback)
    - Uses Random Forest ML model if pkl exists
    - Uses Stylometric Heuristics if pkl missing
    """
    if not text:
        return 0

    # 1. Try ML Model Inference (Checklist 6/10)
    if os.path.exists(MODEL_PATH) and os.path.exists(VECTORIZER_PATH):
        try:
            model = joblib.load(MODEL_PATH)
            vectorizer = joblib.load(VECTORIZER_PATH)
            
            # Use small chunks of preprocessing (lowercase + strip)
            X = vectorizer.transform([text.lower()])
            # Predict the probability of AI (label 1)
            proba = model.predict_proba(X)[0][1]
            return int(proba * 100)
        except Exception as e:
            print(f"ML Model Inference error: {e}. Falling back to Rule-based.")
    
    # 2. Fallback to Hybrid Heuristics (Stylometric + Markers) (Checklist 5B)
    h_score, details = extract_features_hybrid(text)
    return min(100, h_score)
