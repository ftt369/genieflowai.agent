import { useState, useCallback } from 'react';
import { ModelType } from '../components/ModelSelector';
import { modelServiceFactory } from '../services/modelService';
import { useModelStore } from '../stores/modelStore';

interface UseModelReturn {
  loading: boolean;
  error: string | null;
  streamingContent: string;
  generateText: (prompt: string, stream?: boolean) => Promise<string>;
  generateChat: (messages: { role: 'user' | 'assistant'; content: string }[], stream?: boolean) => Promise<string>;
  generateWithImage?: (prompt: string, imageUrl: string, stream?: boolean) => Promise<string>;
  clearStreamingContent: () => void;
}

export function useModel(): UseModelReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const { activeModel, getModelConfig } = useModelStore();

  const handleError = useCallback((error: any) => {
    console.error('Model error:', error);
    if (error.message?.includes('API key')) {
      setError('Please configure your API key in the model settings');
    } else if (error.message?.includes('rate limit')) {
      setError('Rate limit exceeded. Please try again later.');
    } else {
      setError(error.message || 'An error occurred while processing your request');
    }
    setLoading(false);
  }, []);

  const clearStreamingContent = useCallback(() => {
    setStreamingContent('');
  }, []);

  const handleStream = useCallback((chunk: string) => {
    setStreamingContent(prev => prev + chunk);
  }, []);

  const generateText = useCallback(async (prompt: string, stream?: boolean) => {
    setLoading(true);
    setError(null);
    if (stream) {
      setStreamingContent('');
    }
    
    try {
      const config = getModelConfig(activeModel as ModelType);
      const service = modelServiceFactory.getService(activeModel as ModelType, config);
      const response = await service.generateText(prompt, stream ? handleStream : undefined);
      setLoading(false);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [activeModel, getModelConfig, handleError, handleStream]);

  const generateChat = useCallback(async (messages: { role: 'user' | 'assistant'; content: string }[], stream?: boolean) => {
    setLoading(true);
    setError(null);
    if (stream) {
      setStreamingContent('');
    }

    try {
      const config = getModelConfig(activeModel as ModelType);
      const service = modelServiceFactory.getService(activeModel as ModelType, config);
      const response = await service.generateChat(messages, stream ? handleStream : undefined);
      setLoading(false);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [activeModel, getModelConfig, handleError, handleStream]);

  const generateWithImage = useCallback(async (prompt: string, imageUrl: string, stream?: boolean) => {
    setLoading(true);
    setError(null);
    if (stream) {
      setStreamingContent('');
    }

    try {
      const config = getModelConfig(activeModel as ModelType);
      const service = modelServiceFactory.getService(activeModel as ModelType, config);
      if (!service.generateWithImage) {
        throw new Error(`${activeModel} does not support image generation`);
      }
      const response = await service.generateWithImage(prompt, imageUrl, stream ? handleStream : undefined);
      setLoading(false);
      return response;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [activeModel, getModelConfig, handleError, handleStream]);

  return {
    loading,
    error,
    streamingContent,
    generateText,
    generateChat,
    generateWithImage,
    clearStreamingContent,
  };
} 