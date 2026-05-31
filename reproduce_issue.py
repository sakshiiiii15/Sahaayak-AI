import sys
import os

# Root of the project
project_root = os.path.dirname(os.path.abspath(__file__))
# sahaayak-ai folder
backend_path = os.path.join(project_root, 'sahaayak-ai')

if backend_path not in sys.path:
    sys.path.append(backend_path)

try:
    from model.scam_detector import detect_scam
    
    test_message = "A family member of yours has been in an accident. Call this premium rate number for details: 0906-123-4567"
    score = detect_scam(test_message)

    print(f"Message: {test_message}")
    print(f"Scam Score: {score}")

    if score > 70:
        print("Classification: Scam")
    elif score >= 40:
        print("Classification: Suspicious")
    else:
        print("Classification: Safe")
except ImportError as e:
    print(f"ImportError: {e}")
    print(f"Current Sys Path: {sys.path}")
