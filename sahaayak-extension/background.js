chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "analyze-sahaayak",
    title: "Analyse with Sahaayak AI",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "analyze-sahaayak") {
    // Try sending message, if fails, inject content script manually
    chrome.tabs.sendMessage(tab.id, {
      action: "ANALYZE_TEXT",
      text: info.selectionText
    }, (response) => {
      if (chrome.runtime.lastError) {
        // Content script not ready? Inject it first
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }, () => {
          // Retry message
          chrome.tabs.sendMessage(tab.id, {
            action: "ANALYZE_TEXT",
            text: info.selectionText
          });
        });
      }
    });
  }
});
