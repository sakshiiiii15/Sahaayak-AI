chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ANALYZE_TEXT") {
    showSahaayakAnalysis(request.text);
  }
});

function showSahaayakAnalysis(text) {
  // Remove existing modals
  const oldModal = document.getElementById('sahaayak-modal-container');
  if (oldModal) oldModal.remove();

  const container = document.createElement('div');
  container.id = 'sahaayak-modal-container';
  container.innerHTML = `
    <div id="sahaayak-overlay"></div>
    <div id="sahaayak-modal">
      <div class="sahaayak-loading">
        <div class="sahaayak-spinner"></div>
        <p>Analyzing with Sahaayak AI...</p>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  // Styling for the modal (glassmorphism)
  const style = document.createElement('style');
  style.textContent = `
    #sahaayak-modal-container { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; position: fixed; inset: 0; z-index: 100000; }
    #sahaayak-overlay { position: absolute; inset: 0; background: rgba(15, 17, 26, 0.85); backdrop-filter: blur(8px); }
    #sahaayak-modal { 
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 500px; max-height: 80vh; background: #1a1c2e; border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); overflow-y: auto; padding: 30px;
    }
    .sahaayak-loading { text-align: center; color: #818cf8; font-weight: bold; }
    .sahaayak-spinner { border: 4px solid rgba(255,255,255,0.1); border-top: 4px solid #818cf8; border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    .s_status { font-size: 24px; font-weight: 800; margin-bottom: 15px; }
    .s_grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
    .s_card { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; }
    .s_label { font-size: 10px; color: #64748b; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
    .s_value { font-size: 20px; font-weight: 800; margin-top: 5px; }
    .s_close { position: absolute; top: 20px; right: 20px; background: transparent; border: none; font-size: 24px; color: #64748b; cursor: pointer; }
    .s_close:hover { color: white; }
    .s_explanation { line-height: 1.6; color: #94a3b8; font-size: 14px; margin-top: 15px; }
  `;
  document.head.appendChild(style);

  // Fetch real analysis from flask
  fetch('http://127.0.0.1:5000/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  })
  .then(res => res.json())
  .then(data => {
    const modal = document.getElementById('sahaayak-modal');
    const color = data.status === "Scam" ? "#ef4444" : (data.status === "Suspicious" ? "#f59e0b" : "#10b981");
    
    modal.innerHTML = `
      <button class="s_close" onclick="document.getElementById('sahaayak-modal-container').remove()">×</button>
      <div style="border-top: 6px solid ${color}; padding-top: 10px;">
        <p class="s_label">SAHAAYAK AI REPORT</p>
        <h2 class="s_status" style="color: ${color}">${data.status} Detected</h2>
        <div class="s_grid">
          <div class="s_card"><p class="s_label">SCAM RISK</p><p class="s_value" style="color: #ef4444">${data.scam_score}%</p></div>
          <div class="s_card"><p class="s_label">AI-CONTENT</p><p class="s_value" style="color: #818cf8">${data.ai_score}%</p></div>
        </div>
        <div class="s_card">
          <p class="s_label">WHATSAPP SUMMARY</p>
          <p class="s_explanation" style="color: white; font-style: italic">"${data.summary}"</p>
        </div>
        <div class="s_card" style="margin-top: 15px; background: ${color}10; border: 1px solid ${color}30">
          <p class="s_label" style="color: ${color}">Action Plan</p>
          <ul style="color: #94a3b8; font-size: 13px; margin: 10px 0; padding-left: 20px;">
            ${data.action_plan.map(step => `<li>${step}</li>`).join('')}
          </ul>
        </div>
        <p class="s_explanation">${data.simplified}</p>
      </div>
    `;
  })
  .catch(err => {
    document.getElementById('sahaayak-modal').innerHTML = `
      <p style="color: #ef4444">Error: Sahaayak API not connected. Please start Flask backend locally.</p>
      <button onclick="document.getElementById('sahaayak-modal-container').remove()">Close</button>
    `;
  });
}
