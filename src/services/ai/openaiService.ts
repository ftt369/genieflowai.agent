import OpenAI from 'openai';

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAIService {
  private openai: OpenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }

    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true
    });

    console.log('OpenAI Service initialized');
  }

  async generateResponse(context: string, query: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: context
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return response.choices[0]?.message?.content || 'No response available.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async analyzeContext(messages: AIMessage[], prompt: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          ...messages.map(m => ({
            role: m.role,
            content: m.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      return response.choices[0]?.message?.content || 'No analysis available.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  async executeFlowStep(step: any, context: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `Execute the following ${step.type} step with the given context.`
          },
          {
            role: 'user',
            content: `Context: ${context}\n\nStep Content: ${step.content}`
          }
        ],
        temperature: step.config?.temperature || 0.7,
        max_tokens: step.config?.maxTokens || 500
      });

      return response.choices[0]?.message?.content || 'No execution result available.';
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }
}

export const openAIService = new OpenAIService(); 