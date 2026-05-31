import os
import re
import html
import requests
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import joblib

PHISHING_REPO_API = 'https://api.github.com/repos/LinkSec/phishing-templates/contents/emails'
PHISHING_RAW_BASE = 'https://raw.githubusercontent.com/LinkSec/phishing-templates/main'
DATASET_CSV = 'model/dataset/Dataset_5971.csv'
MODEL_DIR = 'model'
PHISHING_MODEL_PATH = os.path.join(MODEL_DIR, 'phishing_model.pkl')
PHISHING_VECTORIZER_PATH = os.path.join(MODEL_DIR, 'phishing_vectorizer.pkl')
PHISHING_CSV_PATH = 'model/dataset/phishing_templates.csv'


def clean_html_text(html_content):
    if not isinstance(html_content, str):
        return ''
    text = re.sub(r'<!--.*?-->', ' ', html_content, flags=re.S)
    text = re.sub(r'<script.*?>.*?</script>', ' ', text, flags=re.S | re.I)
    text = re.sub(r'<style.*?>.*?</style>', ' ', text, flags=re.S | re.I)
    text = re.sub(r'<[^>]+>', ' ', text)
    text = html.unescape(text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()


def fetch_phishing_template_paths():
    response = requests.get(PHISHING_REPO_API, timeout=20)
    response.raise_for_status()
    items = response.json()
    return [item for item in items if item.get('type') == 'dir']


def fetch_file_list_for_template(template_dir):
    response = requests.get(template_dir['url'], timeout=20)
    response.raise_for_status()
    items = response.json()
    return [item for item in items if item.get('type') == 'file']


def download_phishing_samples():
    samples = []
    template_dirs = fetch_phishing_template_paths()
    print(f"Found {len(template_dirs)} phishing template categories.")

    for template_dir in template_dirs:
        files = fetch_file_list_for_template(template_dir)
        print(f"  - {template_dir['name']} -> {len(files)} files")
        for file_item in files:
            download_url = file_item.get('download_url')
            if not download_url:
                continue
            try:
                file_resp = requests.get(download_url, timeout=20)
                file_resp.raise_for_status()
                text = clean_html_text(file_resp.text)
                if len(text) < 50:
                    continue
                samples.append({
                    'text': text,
                    'source': template_dir['name'],
                    'filename': file_item['name'],
                    'target': 1
                })
            except Exception as exc:
                print(f"Failed to download {file_item['path']}: {exc}")

    print(f"Downloaded {len(samples)} phishing samples.")
    return pd.DataFrame(samples)


def preprocess_text(text):
    if not isinstance(text, str):
        return ''
    text = text.lower()
    text = re.sub(r'[^a-z0-9\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by',
        'is', 'are', 'was', 'were', 'be', 'of', 'this', 'that', 'from', 'it', 'as', 'your'
    }
    return ' '.join([token for token in text.split() if token not in stop_words])


def load_base_dataset():
    if not os.path.exists(DATASET_CSV):
        raise FileNotFoundError(f"Base dataset not found: {DATASET_CSV}")
    df = pd.read_csv(DATASET_CSV)
    if 'TEXT' not in df.columns or 'LABEL' not in df.columns:
        raise ValueError('Expected CSV with TEXT and LABEL columns.')
    df['LABEL'] = df['LABEL'].astype(str).str.lower().str.strip()
    df['target'] = df['LABEL'].apply(lambda x: 0 if x == 'ham' else 1)
    return df[['TEXT', 'target']]


def build_training_data():
    phishing_df = download_phishing_samples()
    if phishing_df.empty:
        raise ValueError('No phishing samples were downloaded from the GitHub templates repo.')

    if not os.path.exists(os.path.dirname(PHISHING_CSV_PATH)):
        os.makedirs(os.path.dirname(PHISHING_CSV_PATH), exist_ok=True)
    phishing_df[['text', 'target']].to_csv(PHISHING_CSV_PATH, index=False)

    base_df = load_base_dataset()
    combined = pd.concat([
        base_df.rename(columns={'TEXT': 'text'}),
        phishing_df[['text', 'target']]
    ], ignore_index=True)
    combined.drop_duplicates(subset=['text'], inplace=True)
    combined['clean_text'] = combined['text'].apply(preprocess_text)
    combined = combined[combined['clean_text'].str.len() > 20]
    return combined


def train_phishing_model():
    df = build_training_data()
    print(f"Training dataset size: {len(df)}")
    counts = df['target'].value_counts(normalize=True).to_dict()
    print(f"Class distribution: {counts}")

    vectorizer = TfidfVectorizer(ngram_range=(1, 2), max_features=7000)
    X = vectorizer.fit_transform(df['clean_text'])
    y = df['target']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.18, random_state=42, stratify=y)

    clf = LogisticRegression(max_iter=2000, solver='liblinear')
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    print('Evaluation metrics:')
    print(f"  Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print(f"  Precision: {precision_score(y_test, y_pred, zero_division=0):.4f}")
    print(f"  Recall: {recall_score(y_test, y_pred, zero_division=0):.4f}")
    print(f"  F1: {f1_score(y_test, y_pred, zero_division=0):.4f}")

    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(clf, PHISHING_MODEL_PATH)
    joblib.dump(vectorizer, PHISHING_VECTORIZER_PATH)
    print(f"Saved phishing model: {PHISHING_MODEL_PATH}")
    print(f"Saved phishing vectorizer: {PHISHING_VECTORIZER_PATH}")


if __name__ == '__main__':
    train_phishing_model()
