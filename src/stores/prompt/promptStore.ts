import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  is_favorite: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface PromptStore {
  prompts: Prompt[];
  setPrompts: (prompts: Prompt[]) => void;
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (prompt: Prompt) => void;
  deletePrompt: (id: string) => void;
  getPromptById: (id: string) => Prompt | undefined;
  getFavoritePrompts: () => Prompt[];
  getPromptsByTag: (tag: string) => Prompt[];
}

export const usePromptStore = create<PromptStore>()(
  persist(
    (set, get) => ({
      prompts: [],
      
      setPrompts: (prompts) => set({ prompts }),
      
      addPrompt: (prompt) => set((state) => ({
        prompts: [prompt, ...state.prompts]
      })),
      
      updatePrompt: (updatedPrompt) => set((state) => ({
        prompts: state.prompts.map((prompt) => 
          prompt.id === updatedPrompt.id ? updatedPrompt : prompt
        )
      })),
      
      deletePrompt: (id) => set((state) => ({
        prompts: state.prompts.filter((prompt) => prompt.id !== id)
      })),
      
      getPromptById: (id) => {
        return get().prompts.find((prompt) => prompt.id === id);
      },
      
      getFavoritePrompts: () => {
        return get().prompts.filter((prompt) => prompt.is_favorite);
      },
      
      getPromptsByTag: (tag) => {
        return get().prompts.filter((prompt) => 
          prompt.tags && prompt.tags.includes(tag)
        );
      },
    }),
    {
      name: 'prompts-storage', // Name for localStorage
      partialize: (state) => ({ prompts: state.prompts }), // Only persist prompts array
    }
  )
); 