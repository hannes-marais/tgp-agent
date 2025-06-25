import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createServer } from 'http';
import { URL } from 'url';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import 'dotenv/config';

// Create EMRouter client using OpenAI SDK
const emrouter = createOpenAI({
  baseURL: process.env.EMROUTER_ENDPOINT || "http://localhost:8123/v1",
  apiKey: process.env.EMROUTER_API_KEY || "your-emrouter-api-key"
});

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

  // API route for PIN validation
  if (pathname === '/api/validate-pin' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { pin } = JSON.parse(body);
        const correctPin = process.env.APP_PIN_CODE || '7893';
        const isValid = pin === correctPin;
        
        res.setHeader('Content-Type', 'application/json');
        res.writeHead(200);
        res.end(JSON.stringify({ valid: isValid }));
      } catch {
        res.writeHead(400);
        res.end('Invalid request');
      }
    });
    return;
  }

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
          model = emrouter(process.env.EMROUTER_BRUCE_MODEL || 'bruce-cleveland');
        } else if (provider === 'anthropic') {
          model = emrouter(process.env.EMROUTER_EMMA_MODEL || 'emma');
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

  // Serve static assets from public folder (favicon, logo, images)
  if (pathname === '/favicon.ico' || pathname.startsWith('/favicon') || pathname.startsWith('/tgp-logo') || pathname.startsWith('/bruce-thumb') || pathname.startsWith('/tgp-favicon')) {
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
        } else if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) {
          res.setHeader('Content-Type', 'image/jpeg');
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


  // 404 for unknown routes
  res.writeHead(404);
  res.end('Not Found');
});

const PORT = process.env.PORT || 3001;
server.listen(Number(PORT), '127.0.0.1', () => {
  console.log(`Bruce Cleveland EM web server running on 127.0.0.1:${PORT}`);
  console.log(`React app: http://localhost:${PORT}`);
});
