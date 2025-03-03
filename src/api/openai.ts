import axios from 'axios';
import type { Message } from '../services/modelService';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const openai = axios.create({
  baseURL: 'https://api.openai.com/v1',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_KEY}`,
  },
});

export interface OpenAIResponse {
  success: boolean;
  content: string;
  error?: string;
}

export const generateOpenAIResponse = async (messages: Message[]): Promise<OpenAIResponse> => {
  try {
    if (!API_KEY) {
      return {
        success: false,
        content: '',
        error: 'OpenAI API key not configured'
      };
    }

    const response = await openai.post('/chat/completions', {
      model: 'gpt-4-0125-preview',
      messages: messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      })),
      temperature: 0.7,
      max_tokens: 1000,
    });

    return {
      success: true,
      content: response.data.choices[0].message.content
    };
  } catch (error: any) {
    console.error('OpenAI API Error:', error.response?.data || error);
    return {
      success: false,
      content: '',
      error: error.response?.data?.error?.message || 'Failed to generate response'
    };
  }
}; 