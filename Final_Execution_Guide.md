# 🚀 Sahaayak AI: Final Deployment & Testing Roadmap

This guide outlines exactly how to bring your project to its final, verified state. Follow these steps to ensure all components are synchronized and the detection accuracy is validated.

---

### Step 1: Initialize the AI Backend
The backend serves as the brain of the application.

1.  **Environment Check**:
    - Ensure you have **Python 3.10+**.
    - Open a terminal in `e:\Sahaayak AI\sahaayak-ai`.
    - Install all dependencies:
      ```powershell
      pip install -r requirements.txt
      ```
    - **Note on OCR (Optional)**: If you want to test image-to-text detection, ensure **Tesseract OCR** is installed on your Windows machine and added to your PATH.

2.  **Start the Server**:
    - Run the Flask application:
      ```powershell
      python app.py
      ```
    - Verify it's running by visiting `http://127.0.0.1:5000` in your browser. You should see: "Backend is running 🚀".

---

### Step 2: Launch the Frontend Dashboard
The dashboard provides the interactive UX.

1.  **Dependencies**:
    - Open a new terminal in `e:\Sahaayak AI\sahaayak-frontend`.
    - Install Node.js packages:
      ```powershell
      npm install
      ```

2.  **Start the Dev Server**:
    - Run the following command:
      ```powershell
      npm start
      ```
    - Your browser will open `http://localhost:3000`. This will connect automatically to the backend at port 5000.

---

### Step 3: Comprehensive Accuracy Testing
This is the most critical phase to verify your **~94-95%** accuracy claims.

#### 🛠️ Part A: Automated Batch Testing
Run the provided script to see if the model correctly identifies known scam templates.
- Open a terminal in `e:\Sahaayak AI\sahaayak-ai`.
- While `app.py` is running, execute:
  ```powershell
  python batch_test.py
  ```
- Compare the output against your expected status (Scam/Suspicious/Safe).

#### 🧪 Part B: Interactive Accuracy Checklist
Test the following "Edge Cases" directly in the React Dashboard:
1.  **The "Urgency" Test**: Paste a message like *"Your account is blocked. Click here now!"*
    - **Expected**: `Scam` (Status) | `Red` (UI) | `High Score` (>80%).
2.  **The "Friendly" Test**: Paste a message like *"Hey, let's meet at 5 PM for coffee at the mall."*
    - **Expected**: `Safe` (Status) | `Green` (UI) | `Low Score` (<10%).
3.  **The "URL Unrolling" Test**: Paste a message with a bit.ly link to a `.ru` or `.xyz` site.
    - **Expected**: `Link Intel` should show "Suspicious destination detected!"
4.  **The "PDF/OCR" Test**: Upload a screenshot of a suspicious email.
    - **Expected**: The system should extract text and provide a result based on the image content.

---

### Step 4: Loading the Chrome Extension
Integrate the AI directly into your browsing experience.

1.  Open Chrome and go to `chrome://extensions`.
2.  Enable **Developer Mode** (top right toggle).
3.  Click **Load unpacked**.
4.  Select the `e:\Sahaayak AI\sahaayak-extension` folder (or the root folder for the localized version).
5.  **Test**: Right-click any text on a news site or email and click "**Analyze with Sahaayak AI**."

---

### Step 5: Final Synchronization & Git Release
Now that everything is tested and working on branch `1st`:

1.  **Commit Your Work**:
    ```powershell
    git add .
    git commit -m "Finalized: Integrated ML models, enhanced UI, and added link unmasking."
    ```
2.  **Merge to Main**:
    ```powershell
    git checkout main
    git merge 1st
    ```
3.  **Push to GitHub**:
    ```powershell
    git push origin main
    ```

---

### ✅ Success Criteria
- [ ] Backend returns JSON results for both Text and File/Image uploads.
- [ ] UI background shifts from Green to Red based on scam probability.
- [ ] Audio summary reads out the "Hinglish" result in a natural voice.
- [ ] Chrome extension status shows "Backend: 🟢 Running".

> [!TIP]
> **Pro Tip**: If the OCR for images fails, it's usually because the `tesseract` binary isn't in your system path. You can manually point to it in `app.py` by adding `pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'`.
