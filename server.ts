import { serve } from "@std/http";
import { join } from "@std/path";
import { contentType } from "@std/mime";

const PORT = parseInt(Deno.env.get("PORT") || "3001");

// Simple in-memory store for chat messages
const chatSessions = new Map<string, any[]>();

// HTML template for the chat interface
const getChatHTML = () => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bruce Cleveland EM - TGP</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; height: 100vh; display: flex; }
    
    /* Sidebar */
    .sidebar { width: 300px; background: #36164A; color: white; padding: 2rem; display: flex; flex-direction: column; gap: 2rem; }
    .sidebar h1 { font-size: 1.5rem; font-weight: 600; }
    .sidebar .subtitle { font-size: 0.875rem; opacity: 0.8; margin-top: 0.5rem; }
    .example-questions { display: flex; flex-direction: column; gap: 1rem; }
    .example-question { background: rgba(255,255,255,0.1); padding: 1rem; border-radius: 0; cursor: pointer; transition: background 0.2s; border: none; color: white; text-align: left; }
    .example-question:hover { background: rgba(255,255,255,0.2); }
    
    /* Main chat area */
    .main { flex: 1; display: flex; flex-direction: column; background: white; }
    .messages { flex: 1; overflow-y: auto; padding: 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
    .message { display: flex; gap: 1rem; }
    .message.user { justify-content: flex-end; }
    .message.assistant .content { background: #f0f0f0; }
    .message .content { max-width: 70%; padding: 1rem; background: #36164A; color: white; white-space: pre-wrap; }
    .message.user .content { background: #36164A; color: white; }
    .message.assistant .content { background: transparent; color: #333; }
    
    /* Input area */
    .input-area { padding: 1.5rem; border-top: 1px solid #e0e0e0; display: flex; gap: 1rem; }
    .input-area textarea { flex: 1; padding: 0.75rem; border: 1px solid #ddd; font-size: 1rem; resize: none; font-family: inherit; min-height: 50px; }
    .input-area button { padding: 0 1.5rem; background: linear-gradient(135deg, #36164A 0%, #542375 100%); color: white; border: none; font-size: 1rem; cursor: pointer; }
    .input-area button:hover { opacity: 0.9; }
    .input-area button:disabled { opacity: 0.5; cursor: not-allowed; }
  </style>
</head>
<body>
  <div class="sidebar">
    <div>
      <h1>Bruce Cleveland EM</h1>
      <div class="subtitle">Market Engineering Insights</div>
    </div>
    <div class="example-questions">
      <button class="example-question" onclick="askQuestion('What is Market Engineering and how does it differ from traditional marketing?')">
        What is Market Engineering?
      </button>
      <button class="example-question" onclick="askQuestion('How can TGP portfolio companies implement ME principles effectively?')">
        Implementing ME at Portfolio Companies
      </button>
      <button class="example-question" onclick="askQuestion('What are the key metrics for measuring Market Engineering success?')">
        Key ME Metrics
      </button>
      <button class="example-question" onclick="askQuestion('How does ME approach product-market fit differently?')">
        ME and Product-Market Fit
      </button>
    </div>
  </div>
  
  <div class="main">
    <div class="messages" id="messages"></div>
    <div class="input-area">
      <textarea id="input" placeholder="Ask Bruce about Market Engineering..." onkeydown="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(); }"></textarea>
      <button onclick="sendMessage()" id="sendButton">Send</button>
    </div>
  </div>
  
  <script>
    const messagesEl = document.getElementById('messages');
    const inputEl = document.getElementById('input');
    const sendButton = document.getElementById('sendButton');
    
    function askQuestion(question) {
      inputEl.value = question;
      sendMessage();
    }
    
    function addMessage(content, isUser) {
      const messageEl = document.createElement('div');
      messageEl.className = 'message ' + (isUser ? 'user' : 'assistant');
      messageEl.innerHTML = '<div class="content">' + content + '</div>';
      messagesEl.appendChild(messageEl);
      messagesEl.scrollTop = messagesEl.scrollHeight;
    }
    
    async function sendMessage() {
      const message = inputEl.value.trim();
      if (!message) return;
      
      addMessage(message, true);
      inputEl.value = '';
      sendButton.disabled = true;
      
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        addMessage(data.response, false);
      } catch (error) {
        addMessage('Error: Could not connect to Bruce. Please try again.', false);
      } finally {
        sendButton.disabled = false;
        inputEl.focus();
      }
    }
    
    // Auto-resize textarea
    inputEl.addEventListener('input', () => {
      inputEl.style.height = 'auto';
      inputEl.style.height = inputEl.scrollHeight + 'px';
    });
    
    inputEl.focus();
  </script>
</body>
</html>
`;

// Simple chat API handler (mock implementation)
async function handleChat(message: string): Promise<string> {
  // In a real implementation, this would call the AI service
  // For now, return a mock response
  return `I understand you're asking about "${message}". As Bruce Cleveland's Market Engineering methodology teaches us, this is an important consideration for building category-defining companies. Let me provide some insights...

[This is a mock response. In production, this would connect to the actual AI service.]`;
}

// Main server
serve(async (req) => {
  const url = new URL(req.url);
  const path = url.pathname;
  
  // Enable CORS
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  
  // Handle OPTIONS
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }
  
  // API endpoint
  if (path === "/api/chat" && req.method === "POST") {
    try {
      const { message } = await req.json();
      const response = await handleChat(message);
      
      headers.set("Content-Type", "application/json");
      return new Response(
        JSON.stringify({ response }),
        { status: 200, headers }
      );
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Invalid request" }),
        { status: 400, headers }
      );
    }
  }
  
  // Serve static files from dist/
  if (path.startsWith("/assets/") || path.endsWith(".ico") || path.endsWith(".png")) {
    try {
      const filePath = join(Deno.cwd(), "dist", path);
      const file = await Deno.readFile(filePath);
      const mimeType = contentType(path) || "application/octet-stream";
      
      headers.set("Content-Type", mimeType);
      return new Response(file, { status: 200, headers });
    } catch {
      // File not found, continue
    }
  }
  
  // Serve the chat interface
  if (path === "/" || path === "/simple") {
    headers.set("Content-Type", "text/html");
    return new Response(getChatHTML(), { status: 200, headers });
  }
  
  // 404
  return new Response("Not Found", { status: 404, headers });
}, { port: PORT });

console.log(`🚀 Bruce Cleveland EM server running on http://localhost:${PORT}`);
console.log(`📦 Single binary server with embedded chat interface`);
console.log(`🔧 Build production binary: deno task build`);