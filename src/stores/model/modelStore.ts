import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelService, GeminiService, OpenAIService } from '@services/modelService';

export type ModelType = 'gemini' | 'gpt4' | 'claude' | 'grok' | 'mistral';

interface ModelConfig {
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

interface ModelStore {
  activeModel: ModelType;
  modelConfigs: Record<ModelType, ModelConfig>;
  modelService: ModelService;
  setActiveModel: (model: ModelType) => void;
  updateModelConfig: (model: ModelType, config: ModelConfig) => void;
}

// Get environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const DEFAULT_CONFIGS: Record<ModelType, ModelConfig> = {
  gemini: {
    apiKey: GEMINI_API_KEY,
    temperature: 0.7,
    maxTokens: 8192,
  },
  gpt4: {
    apiKey: OPENAI_API_KEY,
    temperature: 0.7,
    maxTokens: 8192,
    topP: 0.95,
  },
  claude: {},
  grok: {},
  mistral: {},
};

const isApiKeyValid = (key?: string) => {
  return !!key && key.length > 0 && key !== 'your_api_key_here';
};

const createModelService = (model: ModelType): ModelService => {
  try {
    switch (model) {
      case 'gemini':
        return new GeminiService();
      case 'gpt4':
        return new OpenAIService();
      default:
        // Try Gemini first, if it fails try OpenAI
        try {
          return new GeminiService();
        } catch {
          return new OpenAIService();
        }
    }
  } catch (error) {
    // If primary model fails, try the other one
    console.warn(`Failed to initialize ${model}, trying fallback`);
    try {
      return model === 'gemini' ? new OpenAIService() : new GeminiService();
    } catch {
      throw new Error('Failed to initialize any model service');
    }
  }
};

// Determine initial model based on available API keys
const getInitialModel = (): ModelType => {
  if (isApiKeyValid(GEMINI_API_KEY)) return 'gemini';
  if (isApiKeyValid(OPENAI_API_KEY)) return 'gpt4';
  return 'gemini'; // Default to Gemini but will throw error if no keys are valid
};

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      activeModel: getInitialModel(),
      modelConfigs: DEFAULT_CONFIGS,
      modelService: createModelService(getInitialModel()),
      setActiveModel: (model) =>
        set((state) => {
          try {
            const service = createModelService(model);
            return {
              activeModel: model,
              modelService: service,
            };
          } catch (error) {
            console.error('Failed to set active model:', error);
            // Keep existing model if switch fails
            return state;
          }
        }),
      updateModelConfig: (model, config) =>
        set((state) => {
          const newConfigs = {
            ...state.modelConfigs,
            [model]: { ...state.modelConfigs[model], ...config },
          };
          
          if (model === state.activeModel) {
            try {
              const service = createModelService(model);
              return {
                modelConfigs: newConfigs,
                modelService: service,
              };
            } catch (error) {
              console.error('Failed to update model config:', error);
              return state;
            }
          }
          
          return { modelConfigs: newConfigs };
        }),
    }),
    {
      name: 'model-store',
      partialize: (state) => ({
        activeModel: state.activeModel,
        modelConfigs: Object.fromEntries(
          Object.entries(state.modelConfigs).map(([key, value]) => [
            key,
            {
              temperature: value.temperature,
              maxTokens: value.maxTokens,
              apiKey: value.apiKey,
            },
          ])
        ),
      }),
    }
  )
); 