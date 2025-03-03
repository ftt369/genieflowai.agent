import { ModelType } from '../stores/modelStore';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateOpenAIResponse } from '../api/openai';

// Get environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ModelConfig {
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ModelService {
  generateChat(messages: Message[]): Promise<string>;
  updateConfig(config: ModelConfig): void;
}

export class OpenAIService implements ModelService {
  private config: ModelConfig = {};

  async generateChat(messages: Message[]): Promise<string> {
    try {
      const response = await generateOpenAIResponse(messages);
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate response');
      }
      return response.content;
    } catch (error) {
      console.error('OpenAI Service Error:', error);
      throw error;
    }
  }

  updateConfig(config: ModelConfig) {
    this.config = { ...this.config, ...config };
  }
}

export class GeminiService implements ModelService {
  private config: ModelConfig = {};
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  private initModel() {
    // Use environment variable as fallback if no API key is configured
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
          maxOutputTokens: this.config.maxTokens || 1000,
        },
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
      console.log('Received messages:', messages);
      
      // Validate messages array
      if (!Array.isArray(messages)) {
        throw new Error('Messages must be an array');
      }

      if (messages.length === 0) {
        throw new Error('Please provide a message to send');
      }

      // Validate each message
      const validMessages = messages.filter(msg => 
        msg && 
        typeof msg === 'object' && 
        msg.role && 
        msg.content && 
        typeof msg.content === 'string'
      );

      if (validMessages.length === 0) {
        throw new Error('No valid messages found');
      }

      // For single messages, use generateContent
      if (validMessages.length === 1) {
        const result = await this.model.generateContent(validMessages[0].content);
        return result.response.text();
      }

      // For conversations, use chat
      const chat = this.model.startChat();
      
      // Send all messages in sequence
      for (let i = 0; i < validMessages.length - 1; i++) {
        const msg = validMessages[i];
        console.log(`Processing message ${i}:`, msg);
        await chat.sendMessage(msg.content);
      }

      // Send the last message and get the response
      const lastMessage = validMessages[validMessages.length - 1];
      console.log('Last message:', lastMessage);
      
      const result = await chat.sendMessage(lastMessage.content);
      return result.response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to generate response');
    }
  }

  updateConfig(config: ModelConfig) {
    this.config = { ...this.config, ...config };
    // Reset model instance when config changes
    this.genAI = null;
    this.model = null;
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