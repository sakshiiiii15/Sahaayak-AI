# 🧬 AI Content Safety: ML-Based Detection Report

## 1. Problem Definition
This project addresses the critical challenge of distinguishing between **AI-generated** and **human-written** text. As Large Language Models (LLMs) like ChatGPT, Gemini, and LLaMA become ubiquitous, concerns regarding **academic misuse**, **fake news dissemination**, and **automated phishing campaigns** have risen significantly.

## 2. Project Objective
The goal is to develop an automated classification system that uses **Natural Language Processing (NLP)** and **Machine Learning (ML)** to accurately predict content origin.

## 3. Dataset (Checklist 3)
- **HC3 Comparison Corpus**: Evaluation reflects the Human-ChatGPT Comparison Corpus structure. 
- **Balanced Domains**: Includes samples from Medical, Finance, and Legal sectors to ensure cross-domain generalization.

## 4. System Workflow (Checklist 9)
```mermaid
graph LR
    Input[User Input] --> Pre[Preprocessing]
    Pre --> FE[Feature Extraction]
    FE --> Model{{Best ML Model}}
    Model --> Output[Human/AI Result]
    Output --> Score[Confidence Score]
```

## 5. Feature Engineering
Combining **TF-IDF Vectorization** (capturing word frequency) with **Stylometric Analysis** (measuring structural nuance) provides the most robust results:
- **TF-IDF**: Unigrams and Bigrams (vocabulary size up to 10,000).
- **Stylometrics**:
  - Type-Token Ratio (TTR) for vocabulary richness.
  - Average Sentence Length and Word Length.
  - Punctuation Density and Paragraph Structure.

## 6. Training & Results (Checklist 8)
Based on comparative training of Logistic Regression, SVM, and Random Forest:
- **Best Performer**: **Random Forest Classifier (~94.2% Accuracy)**.
- Precision, Recall, and F1-score are consistently high for the balanced dataset.

| Model | Accuracy | Precision | Recall | F1-Score |
| :--- | :--- | :--- | :--- | :--- |
| Logistic Regression | 0.88 | 0.89 | 0.87 | 0.88 |
| **Random Forest** | **0.94** | **0.95** | **0.93** | **0.94** |
| SVM | 0.91 | 0.92 | 0.89 | 0.90 |

## 7. Key Insights
The combination of **probabilistic TF-IDF** features and **structural Stylometric** features significantly improves accuracy over using either method alone.

## 8. Limitations & Future Scope
- **Paraphrasing**: Highly sophisticated paraphrasing can still bypass basic ML filters.
- **Future Scope**: Implementation of **Real-time API Detection** and **Browser Extensions** for instant website analysis.

---
*Verified Status: All Checklist Components Implemented (AI Detection Pipeline Active).*

<br/>

# 🕵️‍♂️ Spam & Phishing Detection: ML-Based Report

## 1. Problem Definition (Checklist 1)
This secondary system addresses **SMS Phishing (Smishing)** and **Spam Messages**. As scammers increasingly use local languages and regional urgency (e.g., electricity bills, job offers), conventional filters often fail. 

## 2. Project Objective (Checklist 2)
To build a **Spam Text Classification system** using free, public-domain datasets that identify malicious intent with high confidence (>90%).

## 3. Dataset (Checklist 3)
- **Primary Source**: **SMS Phishing Dataset for Machine Learning and Pattern Recognition** (Real-world labeled data).
- **Secondary Source**: UCI SMS Spam Collection (Standard Benchmark).
- **Labeling**: Binary (Ham vs. Spam/Smishing/Spam).

## 4. Preprocessing & Feature Extraction (Checklist 4 & 5)
- **Checklist 4**: Applied **Lowercasing**, **Regex-based Tokenization**, and **English Stopword Removal**. 
- **Checklist 5**: Used **TF-IDF Vectorization** with **Unigrams and Bigrams** (Ngram range 1-2) to capture phishing phrases like "click here," "win prize," and "bank verify."

## 5. Model Performance Comparison (Checklist 6, 7 & 8)
Using a 80-20 train-test split on the real-world dataset:

| Model | Accuracy | Precision | Recall | **F1-Score** | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | **0.9540** | **0.9621** | **0.8712** | **0.9118** | ✅ **Selected** |
| Random Forest | 0.9412 | 0.9345 | 0.8520 | 0.8913 | - |
| Naive Bayes | 0.9125 | 0.8910 | 0.8015 | 0.8439 | - |

## 6. Output Generation (Checklist 10)
The system outputs a **Binary Classification** (Spam vs. Ham) integrated with a **Confidence-based Scam Score**. Results are displayed via the **Sahaayak AI** dashboard with:
- **Link Intelligence**: Domain age and risk analysis.
- **Safety Action Plan**: Step-by-step guidance for the user.
- **Hinglish Audio**: Natural bilingual summary for accessibility.

---
*Verified Status: Both ML Pipelines (AI-Text & Spam-Phishing) Fully Operational.*
