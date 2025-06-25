import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import 'dotenv/config';

export async function POST(request: Request) {
  const { messages } = await request.json();
  
  // Extract provider from URL path
  const url = new URL(request.url);
  const provider = url.pathname.split('/').pop();

  let model;
  if (provider === 'openai') {
    model = openai('gpt-3.5-turbo');
  } else if (provider === 'anthropic') {
    model = anthropic('claude-3-haiku-20240307');
  } else {
    return new Response('Invalid provider', { status: 400 });
  }

  const result = await streamText({
    model,
    messages,
  });

  return result.toAIStreamResponse();
}
