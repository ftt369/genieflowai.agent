import { GoogleGenerativeAI } from '@google/generative-ai';
import { useModelStore } from '../store/modelStore';

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  initialize() {
    const models = useModelStore.getState().models;
    const activeModelId = useModelStore.getState().activeModelId;
    const activeModel = models.find(m => m.id === activeModelId);
    
    if (!activeModel?.apiKey) {
      throw new Error('No API key found. Please add your Gemini API key in settings.');
    }

    this.genAI = new GoogleGenerativeAI(activeModel.apiKey);
    this.model = this.genAI.getGenerativeModel({ model: activeModel.model });
  }

  async chat(messages: { role: 'user' | 'assistant'; content: string }[]) {
    if (!this.model) {
      this.initialize();
    }

    try {
      const chat = this.model.startChat({
        generationConfig: {
          temperature: useModelStore.getState().models.find(
            m => m.id === useModelStore.getState().activeModelId
          )?.temperature || 0.7,
          maxOutputTokens: useModelStore.getState().models.find(
            m => m.id === useModelStore.getState().activeModelId
          )?.maxTokens || 2048,
        },
      });

      const history = messages.map(msg => ({
        role: msg.role,
        parts: msg.content,
      }));

      const result = await chat.sendMessage(history[history.length - 1].parts);
      const response = await result.response;
      
      return {
        role: 'assistant' as const,
        content: response.text(),
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get response from Gemini');
    }
  }

  async testConnection() {
    if (!this.model) {
      this.initialize();
    }

    try {
      const result = await this.model.generateContent('Test connection');
      return result.response.text() ? true : false;
    } catch (error) {
      return false;
    }
  }
}

export const gemini = new GeminiService(); 