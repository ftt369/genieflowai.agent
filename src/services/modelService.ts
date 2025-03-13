import { ModelType } from '@stores/model/modelStore';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { generateOpenAIResponse } from '../api/openai';
import { usePromptStore } from '../stores/promptStore';

// Get environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelConfig {
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface ModelService {
  generateChat(messages: Message[]): Promise<string>;
  generateChatStream(messages: Message[]): AsyncGenerator<string, void, unknown>;
  updateConfig(config: ModelConfig): void;
  getCurrentModel(): string;
}

export class OpenAIService implements ModelService {
  private config: ModelConfig = {};

  async generateChat(messages: Message[]): Promise<string> {
    try {
      // Get proprietary prompt
      const { proprietaryPrompt } = usePromptStore.getState();
      
      // Add proprietary prompts to the messages
      const enhancedMessages: Message[] = [
        { role: 'system', content: proprietaryPrompt.systemPrompt },
        { role: 'system', content: proprietaryPrompt.contextPrompt },
        ...messages
      ];

      const response = await generateOpenAIResponse(enhancedMessages);
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate response');
      }

      // Format response according to proprietary format if specified
      if (proprietaryPrompt.responseFormat) {
        return this.formatResponse(response.content, proprietaryPrompt.responseFormat);
      }

      return response.content;
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      throw error;
    }
  }

  async *generateChatStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    try {
      // Get proprietary prompt
      const { proprietaryPrompt } = usePromptStore.getState();
      
      // Add proprietary prompts to the messages
      const enhancedMessages: Message[] = [
        { role: 'system', content: proprietaryPrompt.systemPrompt },
        { role: 'system', content: proprietaryPrompt.contextPrompt },
        ...messages
      ];

      const stream = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey || import.meta.env.VITE_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: enhancedMessages,
          stream: true
        })
      });

      const reader = stream.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Failed to create stream reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.warn('Failed to parse streaming response:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('OpenAI Streaming Error:', error);
      throw error;
    }
  }

  private formatResponse(content: string, format: string): string {
    // Apply response formatting based on the proprietary format
    // This is a placeholder - implement your formatting logic here
    return content;
  }

  updateConfig(config: ModelConfig) {
    this.config = { ...this.config, ...config };
  }

  getCurrentModel(): string {
    return 'gpt4';
  }
}

export class GeminiService implements ModelService {
  private config: ModelConfig = {};
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  private initModel() {
    const apiKey = this.config.apiKey || GEMINI_API_KEY;
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
          temperature: this.config.temperature || 0.7,
          maxOutputTokens: this.config.maxTokens || 8192,
          topK: 40,
          topP: 0.95,
        }
      });
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      throw new Error('Failed to initialize Gemini model');
    }
  }

  async generateChat(messages: Message[]): Promise<string> {
    if (!this.model) {
      this.initModel();
    }

    try {
      // Format messages for better continuity
      const enhancedMessages = messages.map(msg => {
        if (msg.role === 'system') {
          return {
            role: 'user',
            content: `[System Instruction] ${msg.content}`
          };
        }
        return msg;
      });

      // For conversations, use chat
      const chat = this.model.startChat({
        history: enhancedMessages.slice(0, -1).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      });
      
      // Send the last message and get the response
      const lastMessage = enhancedMessages[enhancedMessages.length - 1];
      const result = await chat.sendMessage(lastMessage.content);
      
      if (!result.response) {
        throw new Error('No response from Gemini chat API');
      }

      let response = result.response.text();

      // Check if response was cut off
      if (response.endsWith('...') || response.endsWith('…') || !response.trim().endsWith('.')) {
        console.log('Response appears to be cut off, attempting to continue...');
        const continuationResult = await chat.sendMessage('Please continue your previous response.');
        if (continuationResult.response) {
          response += '\n\n' + continuationResult.response.text();
        }
      }

      return response;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate response');
    }
  }

  async *generateChatStream(messages: Message[]): AsyncGenerator<string, void, unknown> {
    if (!this.model) {
      this.initModel();
    }

    const MAX_RETRIES = 3;
    let retryCount = 0;
    let success = false;

    while (!success && retryCount < MAX_RETRIES) {
      try {
        // Format messages for better continuity
        const enhancedMessages = messages.map(msg => {
          if (msg.role === 'system') {
            return {
              role: 'user',
              content: `[System Instruction] ${msg.content}`
            };
          }
          return msg;
        });

        // For conversations, use chat
        const chat = this.model.startChat({
          history: enhancedMessages.slice(0, -1).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          }))
        });
        
        // Send the last message and get the streaming response
        const lastMessage = enhancedMessages[enhancedMessages.length - 1];
        const streamingResponse = await chat.sendMessageStream(lastMessage.content);
        
        let fullResponse = '';
        try {
          for await (const chunk of streamingResponse.stream) {
            if (chunk.text) {
              const text = chunk.text();
              fullResponse += text;
              yield text;
            }
          }
          
          // Check if response was cut off and continue if needed
          if (fullResponse.endsWith('...') || fullResponse.endsWith('…') || !fullResponse.trim().endsWith('.')) {
            console.log('Response appears to be cut off, attempting to continue...');
            try {
              const continuationResponse = await chat.sendMessageStream('Please continue your previous response.');
              for await (const chunk of continuationResponse.stream) {
                if (chunk.text) {
                  const text = chunk.text();
                  yield text;
                }
              }
            } catch (continuationError) {
              console.warn('Failed to get continuation, but returning partial response:', continuationError);
              // We'll still consider this a success since we got the initial response
            }
          }
          
          success = true; // Mark as successful if we get here
        } catch (streamError) {
          console.error('Stream processing error:', streamError);
          if (fullResponse.length > 0) {
            console.log('Returning partial response despite stream error');
            success = true; // Consider it a success if we got some response
            return;
          }
          throw streamError; // Re-throw if we got no response at all
        }
      } catch (error) {
        retryCount++;
        console.error(`Gemini API Error (attempt ${retryCount}/${MAX_RETRIES}):`, error);
        
        if (retryCount >= MAX_RETRIES) {
          // If this was our last retry, throw the error
          throw new Error(error instanceof Error ? error.message : 'Failed to generate response after multiple attempts');
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 8000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // For retries, simplify the prompt slightly to avoid potential issues
        if (messages.length > 2 && retryCount > 1) {
          console.log('Simplifying prompt for retry...');
          // Keep system message and last user message only
          messages = messages.filter(msg => 
            msg.role === 'system' || 
            msg === messages[messages.length - 1]
          );
        }
      }
    }
  }

  updateConfig(config: ModelConfig) {
    this.config = { ...this.config, ...config };
    // Reset model instance when config changes
    this.genAI = null;
    this.model = null;
  }

  getCurrentModel(): string {
    return 'gemini-2.0-flash';
  }
}

class ModelServiceFactory {
  private static instance: ModelServiceFactory;
  private services: Map<ModelType, ModelService> = new Map();

  private constructor() {}

  static getInstance(): ModelServiceFactory {
    if (!ModelServiceFactory.instance) {
      ModelServiceFactory.instance = new ModelServiceFactory();
    }
    return ModelServiceFactory.instance;
  }

  getService(model: ModelType): ModelService {
    let service = this.services.get(model);
    if (!service) {
      service = this.createService(model);
      this.services.set(model, service);
    }
    return service;
  }

  private createService(model: ModelType): ModelService {
    switch (model) {
      case 'gemini':
        return new GeminiService();
      case 'gpt4':
        return new OpenAIService();
      default:
        throw new Error(`Model ${model} not implemented`);
    }
  }

  updateConfig(model: ModelType, config: ModelConfig) {
    const service = this.getService(model);
    service.updateConfig(config);
  }
}

export const modelServiceFactory = ModelServiceFactory.getInstance(); 