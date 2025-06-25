import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createServer } from 'http';
import { URL } from 'url';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

const server = createServer(async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const pathname = url.pathname;

  // API Routes for chat - Compatible with useChat hook
  if (pathname.startsWith('/api/chat/') && req.method === 'POST') {
    const provider = pathname.split('/').pop();
    
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(body);

        let model;
        if (provider === 'openai') {
          model = openai('gpt-4o');
        } else if (provider === 'anthropic') {
          model = anthropic('claude-3-haiku-20240307');
        } else {
          res.writeHead(400);
          res.end('Invalid provider');
          return;
        }

        const result = await streamText({
          model,
          messages,
        });

        // Use the built-in response handler for useChat compatibility
        const response = result.toDataStreamResponse();
        
        // Copy headers from the response
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        
        res.writeHead(response.status);
        
        // Stream the response body
        const reader = response.body?.getReader();
        if (reader) {
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              res.write(value);
            }
          } finally {
            reader.releaseLock();
          }
        }
        
        res.end();

      } catch (error: any) {
        console.error('API Error:', error);
        res.writeHead(500);
        res.end(`Error: ${error.message}`);
      }
    });
    return;
  }

  // Serve static assets from public folder (favicon, logo)
  if (pathname.startsWith('/favicon') || pathname.startsWith('/tgp-logo')) {
    try {
      const filePath = join(process.cwd(), 'dist', pathname);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath);
        
        // Set appropriate content type
        if (pathname.endsWith('.ico')) {
          res.setHeader('Content-Type', 'image/x-icon');
        } else if (pathname.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        } else if (pathname.endsWith('.webp')) {
          res.setHeader('Content-Type', 'image/webp');
        }
        
        res.writeHead(200);
        res.end(content);
        return;
      }
    } catch (error) {
      // Fall through to next handler
    }
  }

  // Serve static assets from dist folder
  if (pathname.startsWith('/assets/')) {
    try {
      const filePath = join(process.cwd(), 'dist', pathname);
      if (existsSync(filePath)) {
        const content = readFileSync(filePath);
        
        // Set appropriate content type
        if (pathname.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (pathname.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
        
        res.writeHead(200);
        res.end(content);
        return;
      }
    } catch (error) {
      // Fall through to 404
    }
  }

  // Serve React app for all other routes
  if (pathname === '/' || !pathname.includes('.')) {
    try {
      const html = readFileSync(join(process.cwd(), 'dist', 'index.html'), 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(html);
    } catch (error) {
      res.writeHead(404);
      res.end('File not found');
    }
    return;
  }

  // Simple chat interface (fallback)
  if (pathname === '/simple') {
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bruce Cleveland EM - Enterprise Management</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .chat { border: 1px solid #ddd; height: 400px; overflow-y: scroll; padding: 10px; margin: 10px 0; }
            .input-area { display: flex; gap: 10px; }
            input { flex: 1; padding: 10px; }
            button { padding: 10px 20px; }
            .message { margin: 10px 0; padding: 10px; border-radius: 5px; }
            .user { background: #e3f2fd; text-align: right; }
            .assistant { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h1>Bruce Cleveland EM - Enterprise Management</h1>
          <select id="provider">
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
          </select>
          <div id="chat" class="chat"></div>
          <div class="input-area">
            <input type="text" id="message" placeholder="Type your message..." />
            <button onclick="sendMessage()">Send</button>
          </div>
          
          <script>
            async function sendMessage() {
              const input = document.getElementById('message');
              const chat = document.getElementById('chat');
              const provider = document.getElementById('provider').value;
              
              if (!input.value.trim()) return;
              
              chat.innerHTML += '<div class="message user"><strong>You:</strong> ' + input.value + '</div>';
              
              const userMessage = input.value;
              input.value = '';
              
              chat.innerHTML += '<div class="message assistant" id="loading"><strong>AI:</strong> <em>Thinking...</em></div>';
              chat.scrollTop = chat.scrollHeight;
              
              try {
                const response = await fetch('/api/chat/' + provider, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 
                    messages: [{ role: 'user', content: userMessage }] 
                  })
                });
                
                document.getElementById('loading').remove();
                
                const aiMessage = document.createElement('div');
                aiMessage.className = 'message assistant';
                aiMessage.innerHTML = '<strong>AI:</strong> <span id="ai-response"></span>';
                chat.appendChild(aiMessage);
                
                const responseSpan = document.getElementById('ai-response');
                const reader = response.body.getReader();
                let fullResponse = '';
                
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  
                  const chunk = new TextDecoder().decode(value);
                  fullResponse += chunk;
                  responseSpan.textContent = fullResponse;
                  chat.scrollTop = chat.scrollHeight;
                }
              } catch (error) {
                document.getElementById('loading').innerHTML = '<strong>AI:</strong> <em>Error: ' + error.message + '</em>';
              }
            }
            
            document.getElementById('message').addEventListener('keypress', function(e) {
              if (e.key === 'Enter') sendMessage();
            });
          </script>
        </body>
      </html>
    `);
    return;
  }

  // 404 for unknown routes
  res.writeHead(404);
  res.end('Not Found - Try /simple for a chat interface');
});

const PORT = process.env.PORT || 3001;
server.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`Bruce Cleveland EM web server running on 127.0.0.1:${PORT}`);
  console.log(`Chat interface: http://localhost:${PORT}/simple`);
  console.log(`Available from network: http://[your-ip]:${PORT}/simple`);
});
