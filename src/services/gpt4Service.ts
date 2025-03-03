import OpenAI from 'openai';
import { ModelService } from './modelService';

export interface GPT4Config {
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

type MessageContent = 
  | string 
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } };

export class GPT4Service implements ModelService {
  private client: OpenAI;
  private config: GPT4Config;

  constructor(config: GPT4Config) {
    if (!config.apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.config = config;
    this.client = new OpenAI({
      apiKey: config.apiKey,
      maxRetries: 3,
    });
  }

  async generateText(prompt: string, onStream?: (chunk: string) => void): Promise<string> {
    try {
      if (onStream) {
        const stream = await this.client.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 1000,
          stream: true,
        });

        let fullResponse = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          onStream(content);
        }
        return fullResponse;
      } else {
        const response = await this.client.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{ role: 'user', content: prompt }],
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 1000,
        });
        return response.choices[0]?.message?.content || '';
      }
    } catch (error: any) {
      console.error('Error generating text with GPT-4:', error);
      if (error.message?.includes('API key')) {
        throw new Error('Invalid OpenAI API key');
      } else if (error.message?.includes('rate_limit')) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      }
      throw new Error(error.message || 'Failed to generate text with GPT-4');
    }
  }

  async generateChat(messages: { role: 'user' | 'assistant'; content: string }[], onStream?: (chunk: string) => void): Promise<string> {
    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      if (onStream) {
        const stream = await this.client.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: formattedMessages,
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 1000,
          stream: true,
        });

        let fullResponse = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          onStream(content);
        }
        return fullResponse;
      } else {
        const response = await this.client.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: formattedMessages,
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 1000,
        });
        return response.choices[0]?.message?.content || '';
      }
    } catch (error: any) {
      console.error('Error in chat with GPT-4:', error);
      if (error.message?.includes('API key')) {
        throw new Error('Invalid OpenAI API key');
      } else if (error.message?.includes('rate_limit')) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      }
      throw new Error(error.message || 'Failed to generate chat response with GPT-4');
    }
  }

  async generateWithImage(prompt: string, imageUrl: string, onStream?: (chunk: string) => void): Promise<string> {
    try {
      const messages = [{
        role: 'user' as const,
        content: [
          { type: 'text' as const, text: prompt },
          { type: 'image_url' as const, image_url: { url: imageUrl } }
        ]
      }];

      if (onStream) {
        const stream = await this.client.chat.completions.create({
          model: 'gpt-4-vision-preview',
          messages,
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 1000,
          stream: true,
        });

        let fullResponse = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          onStream(content);
        }
        return fullResponse;
      } else {
        const response = await this.client.chat.completions.create({
          model: 'gpt-4-vision-preview',
          messages,
          temperature: this.config.temperature ?? 0.7,
          max_tokens: this.config.maxTokens ?? 1000,
        });
        return response.choices[0]?.message?.content || '';
      }
    } catch (error: any) {
      console.error('Error in GPT-4 vision:', error);
      if (error.message?.includes('API key')) {
        throw new Error('Invalid OpenAI API key');
      } else if (error.message?.includes('rate_limit')) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      }
      throw new Error(error.message || 'Failed to generate image response with GPT-4');
    }
  }

  updateConfig(config: Partial<GPT4Config>): void {
    if (config.apiKey && config.apiKey !== this.config.apiKey) {
      if (!config.apiKey) {
        throw new Error('OpenAI API key is required');
      }
      this.client = new OpenAI({
        apiKey: config.apiKey,
        maxRetries: 3,
      });
    }
    this.config = { ...this.config, ...config };
  }
} 