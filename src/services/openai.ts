import OpenAI from 'openai';
import { useModelStore } from '../store/modelStore';

class OpenAIService {
  private client: OpenAI | null = null;

  initialize() {
    const models = useModelStore.getState().models;
    const activeModelId = useModelStore.getState().activeModelId;
    const activeModel = models.find(m => m.id === activeModelId);
    
    if (!activeModel?.apiKey) {
      throw new Error('No API key found. Please add your OpenAI API key in settings.');
    }

    this.client = new OpenAI({
      apiKey: activeModel.apiKey,
      dangerouslyAllowBrowser: true
    });
  }

  async chat(messages: { role: 'user' | 'assistant'; content: string }[]) {
    if (!this.client) {
      this.initialize();
    }

    try {
      const completion = await this.client!.chat.completions.create({
        model: useModelStore.getState().models.find(
          m => m.id === useModelStore.getState().activeModelId
        )?.model || 'gpt-4-turbo-preview',
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        temperature: useModelStore.getState().models.find(
          m => m.id === useModelStore.getState().activeModelId
        )?.temperature || 0.7,
        max_tokens: useModelStore.getState().models.find(
          m => m.id === useModelStore.getState().activeModelId
        )?.maxTokens || 4096,
      });

      return {
        role: 'assistant' as const,
        content: completion.choices[0]?.message?.content || 'No response generated.',
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to get response from OpenAI');
    }
  }

  async testConnection() {
    if (!this.client) {
      this.initialize();
    }

    try {
      const completion = await this.client!.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 5
      });
      return completion.choices[0]?.message?.content ? true : false;
    } catch (error) {
      return false;
    }
  }
}

export const openai = new OpenAIService(); 