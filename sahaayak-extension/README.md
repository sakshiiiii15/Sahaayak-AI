# Sahaayak AI - Chrome Extension

A lightweight Chrome browser extension that allows users to analyze selected text for scams directly from any website.

## 📦 Files Included

- `manifest.json` - Extension configuration (Manifest V3)
- `background.js` - Service worker handling context menus and API calls
- `popup.html` - Extension popup UI
- `popup.js` - Popup logic and result display

## 🚀 Installation & Setup

### Step 1: Ensure Backend is Running

Make sure your Flask backend is running on `http://127.0.0.1:5000`

```bash
cd e:\Sahaayak AI\sahaayak-ai
python app.py
```

### Step 2: Load Extension in Chrome

1. **Open Chrome** and go to: `chrome://extensions/`

2. **Enable "Developer mode"** (toggle in top-right corner)

3. Click **"Load unpacked"**

4. Navigate to: `e:\Sahaayak AI\sahaayak-extension`

5. Select the folder and click **"Select Folder"**

6. The extension is now installed! ✅

## 📋 How to Use

1. **Select text** on any website
2. **Right-click** on the selected text
3. Click **"Analyze with Sahaayak"**
4. **Popup appears** showing the result:
   - ✅ SAFE
   - ⚠️ SUSPICIOUS
   - ❌ SCAM
   - Scam Score (0-100)
   - Hindi message

5. **(Optional)** Click **"🔊 Listen Again"** to hear the message in Hindi

## ⚙️ Features

✅ Right-click context menu
✅ Send selected text to backend API
✅ Display result with emoji indicators
✅ Show scam score
✅ Text-to-Speech in Hindi
✅ Clean, responsive UI
✅ Error handling for offline backend

## 🔧 Troubleshooting

**Issue:** "Could not connect to backend"
- **Solution:** Make sure Flask server is running on `http://127.0.0.1:5000`

**Issue:** Extension not showing in menu
- **Solution:** 
  - Check if Developer mode is ON in `chrome://extensions/`
  - Reload extension if you made changes

**Issue:** Text-to-Speech not working
- **Solution:** Check your browser's audio settings and language support

## 📝 File Structure

```
sahaayak-extension/
├── manifest.json      (Configuration)
├── background.js      (Service worker)
├── popup.html         (UI)
├── popup.js           (Logic)
└── README.md         (This file)
```

## 🎨 Customization

### Change context menu text
Edit `background.js` line 7:
```javascript
title: "Your custom title here"
```

### Change popup width
Edit `popup.html` line 18:
```css
width: 400px; /* Change this value */
```

### Change API endpoint
Edit `background.js` line 28:
```javascript
const response = await fetch("YOUR_API_URL", {
```

## 📚 Technologies Used

- Manifest V3 (Chrome Extension API)
- JavaScript (ES6+)
- HTML5 & CSS3
- Web Speech API (Text-to-Speech)
- Fetch API (HTTP requests)

## ⚠️ Important Notes

- This extension requires a local backend running on `http://127.0.0.1:5000`
- Works on Chrome, Edge, and Chromium-based browsers
- Requires "Content Scripts" and "Context Menus" permissions
- Data is sent to your local backend, not stored on Google's servers

## 🔒 Privacy

- User's selected text is sent ONLY to your local backend
- No data is stored in Chrome's cloud
- No tracking or analytics

---

**Built for Sahaayak AI - Digital Safety Assistant** 🛡️
