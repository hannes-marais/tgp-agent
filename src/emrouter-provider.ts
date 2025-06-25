// EMRouter provider for AI SDK
import { LanguageModelV1 } from '@ai-sdk/provider';

interface EMRouterConfig {
  endpoint: string;
  apiKey: string;
  model: string;
}

export function createEMRouter(config: EMRouterConfig): LanguageModelV1 {
  return {
    specificationVersion: 'v1',
    provider: 'emrouter',
    modelId: config.model,
    
    async doGenerate(options) {
      const response = await fetch(`${config.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: options.messages.map(msg => ({
            role: msg.role,
            content: Array.isArray(msg.content) 
              ? msg.content.map(part => 
                  part.type === 'text' ? part.text : ''
                ).join('')
              : msg.content
          })),
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`EMRouter error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      return {
        text: content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0
        },
        finishReason: 'stop'
      };
    },

    async doStream(options) {
      const response = await fetch(`${config.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: config.model,
          messages: options.messages.map(msg => ({
            role: msg.role,
            content: Array.isArray(msg.content) 
              ? msg.content.map(part => 
                  part.type === 'text' ? part.text : ''
                ).join('')
              : msg.content
          })),
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`EMRouter error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      
      return {
        stream: new ReadableStream({
          async start(controller) {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) {
                  controller.close();
                  break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                  if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                    try {
                      const data = JSON.parse(line.slice(6));
                      const content = data.choices?.[0]?.delta?.content;
                      const finishReason = data.choices?.[0]?.finish_reason;
                      
                      if (content) {
                        controller.enqueue({
                          type: 'text-delta',
                          textDelta: content
                        });
                      }
                      
                      if (finishReason === 'stop') {
                        controller.enqueue({
                          type: 'finish',
                          finishReason: 'stop',
                          usage: {
                            promptTokens: 0,
                            completionTokens: 0
                          }
                        });
                      }
                    } catch (e) {
                      // Skip invalid JSON
                    }
                  } else if (line.includes('[DONE]')) {
                    controller.enqueue({
                      type: 'finish',
                      finishReason: 'stop',
                      usage: {
                        promptTokens: 0,
                        completionTokens: 0
                      }
                    });
                  }
                }
              }
            } catch (error) {
              controller.error(error);
            }
          }
        })
      };
    }
  };
}

// Create EMRouter instances for different archetypes
export function emrouter(model: string) {
  return createEMRouter({
    endpoint: 'http://localhost:8123',
    apiKey: 'emr-prod-2024-xa7k9m3n5p',
    model
  });
}
