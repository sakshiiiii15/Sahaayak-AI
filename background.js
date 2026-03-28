chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyzeText",
    title: "Analyze with Sahaayak",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyzeText") {
    const selectedText = info.selectionText;

    fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: selectedText })
    })
      .then(res => res.json())
      .then(data => {
        // Store the analysis result and selected text
        chrome.storage.local.set({
          analysisResult: data,
          selectedText: selectedText
        });

        // Also send message to popup if it's open
        chrome.runtime.sendMessage({
          action: "updateResult",
          result: data,
          text: selectedText
        });
      })
      .catch(() => {
        const errorMsg = "Error connecting to backend";
        chrome.storage.local.set({
          analysisError: errorMsg
        });
        chrome.runtime.sendMessage({
          action: "updateError",
          error: errorMsg
        });
      });
  }
});