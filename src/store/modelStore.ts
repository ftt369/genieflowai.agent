import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ModelType } from '../components/ModelSelector';

interface ModelConfig {
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ModelState {
  activeModel: ModelType;
  modelConfigs: Record<ModelType, ModelConfig>;
  setActiveModel: (model: ModelType) => void;
  setModelConfig: (model: ModelType, config: Partial<ModelConfig>) => void;
  getModelConfig: (model: ModelType) => ModelConfig;
}

export const useModelStore = create<ModelState>()(
  persist(
    (set, get) => ({
      activeModel: 'gemini',
      modelConfigs: {
        gemini: {
          temperature: 0.7,
          maxTokens: 2048,
        },
        gpt4: {
          temperature: 0.7,
          maxTokens: 4096,
        },
        claude: {
          temperature: 0.7,
          maxTokens: 4096,
        },
        grok: {
          temperature: 0.7,
          maxTokens: 2048,
        },
        mistral: {
          temperature: 0.7,
          maxTokens: 2048,
        },
      },
      setActiveModel: (model) => set({ activeModel: model }),
      setModelConfig: (model, config) =>
        set((state) => ({
          modelConfigs: {
            ...state.modelConfigs,
            [model]: {
              ...state.modelConfigs[model],
              ...config,
            },
          },
        })),
      getModelConfig: (model) => get().modelConfigs[model],
    }),
    {
      name: 'model-store',
      partialize: (state) => ({
        modelConfigs: state.modelConfigs,
        activeModel: state.activeModel,
      }),
    }
  )
); 