// Popup Script for Sahaayak AI Extension

// Get DOM elements
const resultBox = document.getElementById("result-box");
const resultStatus = document.getElementById("result-status");
const resultMessage = document.getElementById("result-message");
const resultScore = document.getElementById("result-score");
const listenButton = document.getElementById("listen-button");
const loadingDiv = document.querySelector(".loading");
const errorBox = document.querySelector(".error-box");
const errorText = document.getElementById("error-text");
const selectHint = document.querySelector(".select-text-hint");

let lastMessage = "";

// Initialize popup on open
window.addEventListener("load", () => {
  loadStoredResult();
  
  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "updateResult") {
      displayResult(message.result, message.text);
    } else if (message.action === "updateError") {
      displayError(message.error);
    }
  });
});

// Load any stored result from Chrome storage
function loadStoredResult() {
  chrome.storage.local.get(["analysisResult", "analysisError", "selectedText"], (data) => {
    if (data.analysisError) {
      displayError(data.analysisError);
    } else if (data.analysisResult) {
      displayResult(data.analysisResult, data.selectedText || "");
    }
  });
}

// Display result in popup
function displayResult(result, text) {
  // Hide loading and error
  loadingDiv.classList.remove("show");
  errorBox.classList.remove("show");
  selectHint.classList.remove("show");

  // Determine status type
  const statusType = result.result.toLowerCase();

  // Update result box styling
  resultBox.className = "result-box show " + statusType;

  // Set status with emoji
  let emoji = "";
  if (statusType === "scam") {
    emoji = "❌ ";
  } else if (statusType === "suspicious") {
    emoji = "⚠️ ";
  } else if (statusType === "safe") {
    emoji = "✅ ";
  }

  resultStatus.className = "result-status " + statusType;
  resultStatus.textContent = emoji + result.result;

  // Set message
  resultMessage.textContent = result.message || "No additional info";

  // Set score
  resultScore.textContent = `Scam Score: ${result.scam_score || 0}/100`;

  // Store message for replay
  lastMessage = result.message;

  // Show result box
  resultBox.classList.add("show");
}

// Display error message
function displayError(message) {
  resultBox.classList.remove("show");
  loadingDiv.classList.remove("show");
  selectHint.classList.remove("show");

  errorBox.classList.add("show");
  errorText.textContent = message;
}

// Handle "Listen Again" button click
listenButton.addEventListener("click", () => {
  if (lastMessage) {
    speakText(lastMessage);
  }
});

// Text-to-Speech function
function speakText(text) {
  // Stop any ongoing speech
  speechSynthesis.cancel();

  // Create utterance
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "hi-IN"; // Hindi language
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Speak
  speechSynthesis.speak(utterance);
}
