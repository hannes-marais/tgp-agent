import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import 'dotenv/config';

async function main() {
  console.log('🤖 TGP Agent - AI SDK Example\n');

  try {
    // Example with OpenAI
    if (process.env.OPENAI_API_KEY) {
      console.log('📝 Generating text with OpenAI...');
      const { text } = await generateText({
        model: openai('gpt-3.5-turbo'),
        prompt: 'What is the Vercel AI SDK and why is it useful?',
      });
      console.log('OpenAI Response:', text);
    }

    // Example with Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      console.log('\n📝 Generating text with Anthropic...');
      const { text } = await generateText({
        model: anthropic('claude-3-haiku-20240307'),
        prompt: 'Explain the benefits of using AI SDKs in modern applications.',
      });
      console.log('Anthropic Response:', text);
    }

    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      console.log('⚠️  No API keys found. Please add OPENAI_API_KEY or ANTHROPIC_API_KEY to your .env file');
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main().catch(console.error);
