import pandas as pd
import numpy as np
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib
import os

CSV_PATH = 'model/dataset/Dataset_5971.csv'
MODEL_DIR = 'model'

def preprocess_text(text):
    if not isinstance(text, str): return ""
    text = text.lower()
    # Remove special chars
    text = re.sub(r'[^a-zA-Z0-9\s]', '', text)
    # Simple stopword removal
    stop_words = {"the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "with", "by", "is", "are", "was", "be", "of"}
    return " ".join([t for t in text.split() if t not in stop_words])

def train_real_spam_model():
    if not os.path.exists(CSV_PATH):
        print(f"Error: Dataset not found at {CSV_PATH}")
        return

    print(f"--- [Loading Real Dataset: {CSV_PATH}] ---")
    df = pd.read_csv(CSV_PATH)
    
    # 1. Label Normalization (Checklist: ham=0, others=1)
    df['LABEL'] = df['LABEL'].str.lower().str.strip()
    df['target'] = df['LABEL'].apply(lambda x: 0 if x == 'ham' else 1)
    
    print(f"Dataset Structure: {len(df)} rows found.")
    print("Class Distribution:\n", df['target'].value_counts())

    # 2. Preprocessing
    print("Preprocessing text (Checklist 4)...")
    df['clean_text'] = df['TEXT'].apply(preprocess_text)
    
    # 3. TF-IDF Extraction (Checklist 5: Unigram + Bigram)
    print("Extracting TF-IDF Features...")
    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=5000)
    X = vectorizer.fit_transform(df['clean_text'])
    y = df['target']
    
    # 4. Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 5. Model Comparison (Checklist 6)
    print("Training comparison models...")
    models = {
        "Naive Bayes": MultinomialNB(),
        "LogReg": LogisticRegression(max_iter=1000),
        "Random Forest": RandomForestClassifier(n_estimators=100)
    }
    
    best_f1 = 0
    best_model = None
    best_name = ""

    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        
        print(f"[{name}] Acc: {acc:.4f} | Prec: {prec:.4f} | Rec: {rec:.4f} | F1: {f1:.4f}")
        
        if f1 > best_f1:
            best_f1 = f1
            best_model = model
            best_name = name

    # 6. Save Best Model
    joblib.dump(best_model, os.path.join(MODEL_DIR, 'spam_model.pkl'))
    joblib.dump(vectorizer, os.path.join(MODEL_DIR, 'spam_vectorizer.pkl'))
    print(f"\n[SUCCESS] Best model '{best_name}' (F1: {best_f1:.4f}) saved to disk.")

if __name__ == "__main__":
    train_real_spam_model()
