from flask import Flask, request, jsonify
from flask_cors import CORS
from utils.preprocess import clean_text
from model.scam_detector import detect_scam
from model.ai_detector import detect_ai_text

import re
import os
import tempfile
import base64
import requests
from PyPDF2 import PdfReader
from PIL import Image

def unroll_url(url):
    try:
        # Don't follow redirects too deep (prevent loops)
        res = requests.head(url, allow_redirects=True, timeout=3)
        final_url = res.url
        is_suspicious = any(x in final_url.lower() for x in [".ru", ".cn", ".xyz", "verify-account", "login-bank"])
        return final_url, is_suspicious
    except:
        return url, False
import pytesseract
import pyttsx3

app = Flask(__name__)
# Enable CORS so the frontend (React/Extension/Android) can fetch from API
CORS(app) 

@app.route('/')
def home():
    return "Backend is running 🚀"

# ==========================================
# FUTURE SCOPE:
# - Machine learning model integration
# - Hindi NLP support (e.g. using specific tokenizers for Hindi)
# - Voice output integration
# - Database (MongoDB) to save analyzed logs and user feedback
# ==========================================

def get_hindi_explanation(result):
    """Helper function to generate Hindi explanations based on the result."""
    if result == "Scam":
        return "Yeh message fake ho sakta hai. Paise mat bhejein."
    elif result == "Suspicious":
        return "Yeh message thoda suspicious lag raha hai."
    else:
        return "Yeh message safe lag raha hai."

def summarize_text(text, status, scam_score, ai_score):
    """Generates a dynamic summary of the analysis."""
    origin = "highly likely AI-generated" if ai_score > 70 else "likely human-written" if ai_score < 30 else "of mixed/uncertain origin"
    risk = f"high-risk {status}" if scam_score > 70 else f"suspicious" if scam_score > 40 else "safe"
    
    summary = f"The content appears to be {origin}. From a safety perspective, it is classified as {risk}."
    
    if len(text) > 50:
        summary += f" The text discusses topics related to '{text[:40].strip()}...'."
        
    return summary

def simplify_text(status, scam_score):
    """Generates an easy-to-understand advice for the user."""
    if status == "Scam":
        return "🛑 Action Required: DO NOT click any links or share information. This message aims to steal your data or money."
    elif status == "Suspicious":
        return "⚠️ Caution: Be careful. This message has some markers of a scam. Verify the sender before taking any action."
    else:
        return "✅ Safe: No major risk detected. However, always stay vigilant when interacting with unknown senders."

def explain_reason(text, scam_score):
    reasons = []
    lower_text = text.lower()

    # 1. Template Matching Patterns for Explanation
    patterns = {
        r"accident|hospital|emergency|police|arrest|jail|family|relative": "Manipulation of emotions via reported family emergency or legal trouble.",
        r"premium rate|090|098|0871|0844": "Contains a high-cost premium rate phone number for contact.",
        r"bank|account|pan|aadhar|kyc|otp|verify|withdraw|transfer": "Request for sensitive financial action or identity information.",
        r"bill|electricity|bijli|disconnect|cut": "Utility service threat (e.g. electricity disconnection).",
        r"part-time|job|earn|commission|salary": "Involves part-time job or high-earning promise (common job scam signal).",
        r"win|won|lottery|prize|gift|reward|rupee|ruppee": "Promise of unexpected financial gain or large reward.",
        r"customs|unclaimed|parcel|police|fine": "Authority impersonation or parcel-related fraud signals.",
        r"urgent|immediately|now|asap|deadline|soon": "High urgency tone designed to pressure quick decisions.",
        r"click|link|bit\.ly|tinyurl|www\.": "Contains an external link, potentially a phishing vector."
    }

    for pattern, reason in patterns.items():
        if re.search(pattern, lower_text):
            reasons.append(reason)

    if scam_score >= 80:
        reasons.append("High overall scam score indicates critical risk signals.")
    elif scam_score >= 50:
        reasons.append("Moderate risk detected via combined pattern matching.")

    if not reasons:
        reasons.append("No common risk markers detected in the text structure.")

    # Deduced deduplication
    return list(dict.fromkeys(reasons))


def analyze_text(text):
    if not text or not text.strip():
        return {
            "status": "Safe",
            "summary": "No text provided.",
            "simplified": "",
            "why": ["Input was empty."],
            "scam_score": 0,
            "message": "Yeh message safe lag raha hai."
        }

    cleaned_text = clean_text(text)
    lower_text = text.lower()
    scam_score = detect_scam(cleaned_text)
    ai_score = detect_ai_text(cleaned_text)

    if scam_score > 70:
        status = "Scam"
    elif 40 <= scam_score <= 70:
        status = "Suspicious"
    else:
        status = "Safe"

    # 5. Link Intelligence (REAL UNMASKING)
    link_intel = None
    urls = re.findall(r"(https?://\S+|www\.\S+|bit\.ly/\S+|tinyurl\.com/\S+)", text)
    if urls:
        real_url, is_bad = unroll_url(urls[0])
        link_intel = {
            "risk": "Very High" if is_bad else ("High" if "bit.ly" in urls[0] or "tinyurl" in urls[0] else "Medium"),
            "original": urls[0],
            "unmasked": real_url,
            "warning": "Suspicious destination (.ru/.cn/.xyz) detected!" if is_bad else "Shortened link detected. Proceed with caution."
        }
        if is_bad: scam_score += 15 

    # 6. Safety Action Plan
    action_plan = []
    if status == "Scam":
        action_plan = [
            "Block this sender on WhatsApp/iMessage immediately.",
            "Report the fraud to your local Cyber Cell at 1930.",
            "Do NOT share any OTP or personal identity documents."
        ]
    elif status == "Suspicious":
        action_plan = [
            "Verify the caller's identity through official channels.",
            "Avoid clicking any shortened links (bit.ly/tinyurl).",
            "Report the message as spam to your service provider."
        ]
    else:
        action_plan = [
            "Stay vigilant. Official banks never ask for passwords.",
            "Always check for HTTPS secure lock icon on websites."
        ]

    # 7. Hinglish Message for Audio Assistant (Checklist 4)
    if status == "Scam":
        hinglish_msg = f"Alert! Yeh message ek Scam lag raha hai. "
        hinglish_msg += "Kripya karkey koi link click na karein. Yeh fraud ho sakta hai."
    elif status == "Suspicious":
        hinglish_msg = f"Alert! Yeh message ek Suspicious lag raha hai. "
        hinglish_msg += "Hoshiyaar rahein. Yeh suspicious signals de raha hai."
    else:
        hinglish_msg = "Alert! Yeh message abhi safe lag raha hai, lekin kripya saavdhan rahein."

    # 8. Risky Segments for Heatmap
    risky_segments = []
    patterns_to_check = {
        r"accident|hospital|emergency|police|arrest|jail|family|relative": "EMOTIONAL_MANIPULATION",
        r"premium rate|090|098|0871|0844": "PREMIUM_NUMBER",
        r"bank|account|pan|aadhar|kyc|otp|verify|withdraw|transfer": "SENSITIVE_DATA",
        r"bill|electricity|bijli|disconnect|cut": "SERVICE_THREAT",
        r"part-time|job|earn|commission|salary": "JOB_SCAM",
        r"win|won|lottery|prize|gift|reward|rupee|ruppee": "FINANCIAL_BAIT",
        r"customs|unclaimed|parcel|police|fine": "AUTHORITY_IMPERSONATION",
        r"urgent|immediately|now|asap|deadline|soon": "URGENCY",
        r"(https?://\S+|www\.\S+|bit\.ly/\S+|tinyurl\.com/\S+)": "EXTERNAL_LINK"
    }
    
    for pattern, risk_type in patterns_to_check.items():
        matches = re.finditer(pattern, lower_text, re.IGNORECASE)
        for match in matches:
            risky_segments.append({
                "segment": text[match.start():match.end()],
                "type": risk_type,
                "start": match.start(),
                "end": match.end()
            })

    return {
        "status": status,
        "summary": summarize_text(text, status, scam_score, ai_score),
        "simplified": simplify_text(status, scam_score),
        "why": explain_reason(text, scam_score),
        "scam_score": scam_score,
        "ai_score": ai_score,
        "message": hinglish_msg,
        "link_intel": link_intel,
        "action_plan": action_plan,
        "analyzed_text": text,
        "risky_segments": risky_segments
    }


@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data.get('text', '')
    result = analyze_text(text)
    return jsonify(result)


@app.route('/upload', methods=['POST'])
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files['file']
    filename = file.filename.lower()
    
    # Save to temp file
    temp = tempfile.NamedTemporaryFile(delete=False)
    file.save(temp.name)
    temp.close()

    extracted_text = ""
    try:
        if filename.endswith(".pdf"):
            reader = PdfReader(temp.name)
            for page in reader.pages:
                t = page.extract_text()
                if t: extracted_text += t + " "
        elif filename.endswith((".png", ".jpg", ".jpeg")):
            try:
                extracted_text = pytesseract.image_to_string(Image.open(temp.name))
            except:
                extracted_text = f"Warning: OCR engine not found. Contact support. Filename: {file.filename}"
        else:
            return jsonify({"error": "Unsupported file format"}), 400
    except Exception as e:
        extracted_text = f"Error processing file: {str(e)}"
    finally:
        if os.path.exists(temp.name):
            os.unlink(temp.name)

    if not extracted_text.strip():
        return jsonify({"error": "No text could be extracted from file"}), 400

    results = analyze_text(extracted_text)
    return jsonify(results)


@app.route('/read', methods=['POST'])
def read_text():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    text = data.get('text', '')
    temp_file = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    temp_path = temp_file.name
    temp_file.close()

    engine = pyttsx3.init()
    engine.save_to_file(text, temp_path)
    engine.runAndWait()

    with open(temp_path, 'rb') as f:
        audio_data = f.read()

    os.unlink(temp_path)
    return jsonify({"audio": base64.b64encode(audio_data).decode('utf-8')})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
