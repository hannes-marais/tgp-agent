import { streamText, generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { createServer } from 'http';
import { URL } from 'url';
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

  if (pathname === '/') {
    // Serve a simple HTML page
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>TGP Agent - AI SDK Server</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .endpoint { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
            .example { background: #e8f4f8; padding: 10px; margin: 10px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>🤖 TGP Agent - AI SDK Server</h1>
          <p>Your AI agent is running! Try these endpoints:</p>
          
          <div class="endpoint">
            <h3>Chat with OpenAI</h3>
            <p><strong>GET:</strong> <a href="/chat/openai?message=Hello, tell me about AI">/chat/openai?message=Hello, tell me about AI</a></p>
          </div>
          
          <div class="endpoint">
            <h3>Chat with Anthropic</h3>
            <p><strong>GET:</strong> <a href="/chat/anthropic?message=Explain quantum computing">/chat/anthropic?message=Explain quantum computing</a></p>
          </div>

          <div class="endpoint">
            <h3>Stream Response (OpenAI)</h3>
            <p><strong>GET:</strong> <a href="/stream/openai?message=Write a short story about AI">/stream/openai?message=Write a short story about AI</a></p>
          </div>

          <div class="example">
            <h3>Example Usage:</h3>
            <code>curl "http://localhost:3000/chat/openai?message=What is the Vercel AI SDK?"</code>
          </div>
        </body>
      </html>
    `);
    return;
  }

  if (pathname.startsWith('/chat/')) {
    const provider = pathname.split('/')[2];
    const message = url.searchParams.get('message') || 'Hello!';

    try {
      let model;
      if (provider === 'openai') {
        model = openai('gpt-3.5-turbo');
      } else if (provider === 'anthropic') {
        model = anthropic('claude-3-haiku-20240307');
      } else {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid provider. Use "openai" or "anthropic"' }));
        return;
      }

      // Use generateText for non-streaming responses
      const { text } = await generateText({
        model,
        prompt: message,
      });
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({ 
        provider, 
        message, 
        response: text,
        timestamp: new Date().toISOString()
      }));

    } catch (error) {
      console.error('AI request failed:', error);
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'AI request failed', details: (error as Error).message }));
    }
    return;
  }

  if (pathname.startsWith('/stream/')) {
    const provider = pathname.split('/')[2];
    const message = url.searchParams.get('message') || 'Hello!';

    try {
      let model;
      if (provider === 'openai') {
        model = openai('gpt-3.5-turbo');
      } else if (provider === 'anthropic') {
        model = anthropic('claude-3-haiku-20240307');
      } else {
        res.writeHead(400);
        res.end('Invalid provider. Use "openai" or "anthropic"');
        return;
      }

      const result = await streamText({
        model,
        prompt: message,
      });

      // Set up streaming response
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.writeHead(200);

      // Stream the response
      for await (const textPart of result.textStream) {
        res.write(textPart);
      }
      
      res.end();

    } catch (error) {
      console.error('Stream request failed:', error);
      res.writeHead(500);
      res.end(`Error: ${(error as Error).message}`);
    }
    return;
  }

  // 404 for unknown routes
  res.writeHead(404);
  res.end('Not Found');
});

const PORT = process.env.PORT || 3000;
server.listen(Number(PORT), "127.0.0.1", () => {
  console.log(`🚀 TGP Agent server running on 127.0.0.1:${PORT}`);
  console.log(`📖 Open http://localhost:${PORT} to see available endpoints`);
});
