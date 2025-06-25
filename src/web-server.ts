import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import express from 'express';
import { join } from 'path';
import 'dotenv/config';

// Validate environment variables
if (!process.env.EMROUTER_ENDPOINT) {
  throw new Error('EMROUTER_ENDPOINT environment variable is not set.');
}
if (!process.env.EMROUTER_API_KEY) {
  throw new Error('EMROUTER_API_KEY environment variable is not set.');
}

// Create EMRouter client using OpenAI SDK
const emrouter = createOpenAI({
  baseURL: process.env.EMROUTER_ENDPOINT,
  apiKey: process.env.EMROUTER_API_KEY
});

import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());

// Serve static files from the 'dist' directory
app.use(express.static(join(process.cwd(), 'dist')));

// API route for PIN validation
app.post('/api/validate-pin', (req, res) => {
  try {
    const { pin } = req.body;
    const correctPin = process.env.APP_PIN_CODE;
    const isValid = pin === correctPin;
    res.json({ valid: isValid });
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// API route for chat
app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    const model = emrouter(process.env.EMROUTER_BRUCE_MODEL || 'bruce-cleveland');

    const result = await streamText({
      model,
      messages,
    });

    // Use the built-in response handler for useChat compatibility
    const response = result.toDataStreamResponse();
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    res.status(response.status);
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
    res.status(500).send(`Error: ${error.message}`);
  }
});

// For any other route, serve the React app
app.get('*', (req, res) => {
  res.sendFile(join(process.cwd(), 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Bruce Cleveland EM web server running on http://localhost:${PORT}`);
});