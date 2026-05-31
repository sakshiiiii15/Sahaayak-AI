import re
import joblib
import os
import numpy as np

SPAM_MODEL_PATH = 'model/spam_model.pkl'
SPAM_VECTORIZER_PATH = 'model/spam_vectorizer.pkl'
PHISHING_MODEL_PATH = 'model/phishing_model.pkl'
PHISHING_VECTORIZER_PATH = 'model/phishing_vectorizer.pkl'

def detect_scam(text):
    """
    Hybrid Scam & Spam Detection.
    Checklist 1: Problem Definition (detecting spam vs ham).
    Checklist 6: Model Implementation (Naive Bayes ML Classifier).
    Checklist 5: TF-IDF Feature Extraction.
    """
    if not isinstance(text, str): return 0
    normalized = text.lower().strip()
    score = 0

    # 1. Template Matching (Rule-based layer for high precision)
    templates = [
        (r"(bill|electricity|bijli|meter|power).*?(cut|disconnect|pending|unpaid|tonight|off)", 55),
        (r"(part-time|job|earn|work from home|salary).*?(daily|income|salary|whatsapp|telegram)", 50),
        (r"(kyc|verify|update|blocked|suspended|disabled).*?(bank|account|pan|aadhar|link|today)", 50),
        (r"(win|won|winner|lottery|prize|gift|reward|offer|kbc|congrats).*?(claim|click|collect|withdraw|redeem|soon)", 45),
        (r"(gift card|amazon|itunes|google play).*?(order|buy|urgent|ASAP|reimburse|meeting|send)", 60),
        (r"(customs|unclaimed|parcel|delivery|fine|police|seized|stuck|fedex|dhl).*?(pay|release|amount|account)", 40),
        (r"(rupee|ruppee|rs|amount|money|cash).*?(withdraw|win|prize|claim|transfer|reward)", 40),
        (r"(accident|hospital|emergency|police|arrest|jail|family|relative).*?(call|contact|number|help|money|pay|premium)", 65)
    ]
    for pattern, weight in templates:
        if re.search(pattern, normalized): score += weight

    # 2. Keyword Weighted Categories
    categories = {
        "urgency": (["now", "immediately", "urgent", "asap", "hurry", "today", "deadline", "soon", "accident", "emergency", "arrest", "stuck"], 25),
        "banking": (["otp", "cvv", "pin", "password", "bank", "account", "transaction", "verify", "pan", "aadhar"], 15),
        "phishing": (["click", "link", "visit", "open", "bit.ly", "tinyurl", "form", "claim", "redeem", "call this", "contact now"], 15),
        "scam_markers": (["gift card", "amazon", "congratulations", "lucky", "shortlisted", "exclusive", "bonus", "won", "winner", "lottery", "premium rate", "payment needed"], 15)
    }
    found_categories = set()
    for cat, (keywords, weight) in categories.items():
        for k in keywords:
            if k in normalized:
                score += weight
                found_categories.add(cat)
                break

    # 3. Structural Boosters (Urgency is a key signal - User Feedback)
    if "urgency" in found_categories:
        # If any other red flag exists with urgency, it's highly suspicious
        if len(found_categories) > 1: score += 30 
    
    if "urgency" in found_categories and "phishing" in found_categories: score += 35
    if "banking" in found_categories and "urgency" in found_categories: score += 40
    if re.search(r"http|https|www\.|\.\w{2,3}/", normalized): score += 20

    # 4. ML Layer: Phishing/Spam Classification
    ml_paths = [
        (PHISHING_MODEL_PATH, PHISHING_VECTORIZER_PATH, 50),
        (SPAM_MODEL_PATH, SPAM_VECTORIZER_PATH, 30)
    ]

    for model_path, vectorizer_path, weight in ml_paths:
        if os.path.exists(model_path) and os.path.exists(vectorizer_path):
            try:
                model = joblib.load(model_path)
                vectorizer = joblib.load(vectorizer_path)

                X = vectorizer.transform([normalized])
                prediction = model.predict(X)[0]
                confidence = model.predict_proba(X)[0][1] if hasattr(model, 'predict_proba') else 0.5

                if prediction:
                    score += confidence * weight
            except Exception as e:
                print(f"ML Inference Error ({model_path}): {e}")

    # Cap score
    return min(100, max(0, score))
