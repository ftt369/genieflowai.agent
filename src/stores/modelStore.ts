import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelService, GeminiService } from '../services/modelService';

export type ModelType = 'gemini' | 'gpt4' | 'claude' | 'grok' | 'mistral';

interface ModelConfig {
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
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

const DEFAULT_CONFIGS: Record<ModelType, ModelConfig> = {
  gemini: {
    apiKey: GEMINI_API_KEY,
    temperature: 0.7,
    maxTokens: 1000,
  },
  gpt4: {},
  claude: {},
  grok: {},
  mistral: {},
};

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      activeModel: 'gemini',
      modelConfigs: DEFAULT_CONFIGS,
      modelService: new GeminiService(),
      setActiveModel: (model) =>
        set((state) => ({
          activeModel: model,
          modelService: new GeminiService(), // TODO: Add factory for other models
        })),
      updateModelConfig: (model, config) =>
        set((state) => {
          const newConfigs = {
            ...state.modelConfigs,
            [model]: { ...state.modelConfigs[model], ...config },
          };
          
          // Update the service if the active model's config changed
          if (model === state.activeModel) {
            state.modelService.updateConfig(newConfigs[model]);
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