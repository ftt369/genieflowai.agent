import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import { ModelService, withRetry } from './modelService';

export interface GeminiConfig {
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export class GeminiService implements ModelService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private config: GeminiConfig;

  constructor(config: GeminiConfig) {
    if (!config.apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  async generateText(prompt: string, onStream?: (chunk: string) => void): Promise<string> {
    return withRetry(async () => {
      try {
        if (onStream) {
          const result = await this.model.generateContentStream(prompt);
          let fullResponse = '';
          
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text;
            onStream(text);
          }
          
          return fullResponse;
        } else {
          const result = await this.model.generateContent(prompt);
          if (!result.response) {
            throw new Error('No response from Gemini API');
          }
          return result.response.text();
        }
      } catch (error: any) {
        console.error('Error generating text with Gemini:', error);
        if (error.message?.includes('API key')) {
          throw new Error('Invalid Gemini API key');
        } else if (error.message?.includes('rate')) {
          throw new Error('Gemini API rate limit exceeded. Please try again later.');
        }
        throw new Error(error.message || 'Failed to generate text with Gemini');
      }
    });
  }

  async generateChat(messages: { role: 'user' | 'assistant'; content: string }[], onStream?: (chunk: string) => void): Promise<string> {
    return withRetry(async () => {
      try {
        const chat = this.model.startChat({
          generationConfig: {
            temperature: this.config.temperature ?? 0.7,
            maxOutputTokens: this.config.maxTokens ?? 1000,
          },
        });

        // Format messages for Gemini chat
        const history = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }));

        if (onStream) {
          const result = await chat.sendMessageStream(
            history[history.length - 1].parts[0].text,
            { history: history.slice(0, -1) }
          );

          let fullResponse = '';
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text;
            onStream(text);
          }
          return fullResponse;
        } else {
          const result = await chat.sendMessage(
            history[history.length - 1].parts[0].text,
            { history: history.slice(0, -1) }
          );

          if (!result.response) {
            throw new Error('No response from Gemini chat API');
          }

          return result.response.text();
        }
      } catch (error: any) {
        console.error('Error in Gemini chat:', error);
        if (error.message?.includes('API key')) {
          throw new Error('Invalid Gemini API key');
        } else if (error.message?.includes('rate')) {
          throw new Error('Gemini API rate limit exceeded. Please try again later.');
        }
        throw new Error(error.message || 'Failed to generate chat response with Gemini');
      }
    });
  }

  async generateWithImage(prompt: string, imageUrl: string, onStream?: (chunk: string) => void): Promise<string> {
    return withRetry(async () => {
      try {
        const imageModel = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });
        
        const parts: Part[] = [
          { text: prompt }
        ];

        // Add image part based on URL type
        if (imageUrl.startsWith('data:')) {
          const base64Data = imageUrl.split(',')[1];
          parts.push({
            inlineData: {
              data: base64Data,
              mimeType: 'image/jpeg'
            }
          });
        } else {
          parts.push({ text: imageUrl });
        }

        if (onStream) {
          const result = await imageModel.generateContentStream(parts);
          let fullResponse = '';
          
          for await (const chunk of result.stream) {
            const text = chunk.text();
            fullResponse += text;
            onStream(text);
          }
          
          return fullResponse;
        } else {
          const result = await imageModel.generateContent(parts);

          if (!result.response) {
            throw new Error('No response from Gemini vision API');
          }

          return result.response.text();
        }
      } catch (error: any) {
        console.error('Error in Gemini vision:', error);
        if (error.message?.includes('API key')) {
          throw new Error('Invalid Gemini API key');
        } else if (error.message?.includes('rate')) {
          throw new Error('Gemini API rate limit exceeded. Please try again later.');
        }
        throw new Error(error.message || 'Failed to generate image response with Gemini');
      }
    });
  }

  updateConfig(config: Partial<GeminiConfig>): void {
    if (config.apiKey && config.apiKey !== this.config.apiKey) {
      if (!config.apiKey) {
        throw new Error('Gemini API key is required');
      }
      this.genAI = new GoogleGenerativeAI(config.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
    this.config = { ...this.config, ...config };
  }
}