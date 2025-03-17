import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface MemoryState {
  // Map of conversation ID to array of memory snippets
  memories: Record<string, string[]>;
  
  // Add or update memory for a conversation
  updateMemory: (conversationId: string, memory: string[]) => void;
  
  // Get memory for a conversation
  getMemory: (conversationId: string) => string[];
  
  // Clear memory for a conversation
  clearMemory: (conversationId: string) => void;
  
  // Clear all memories
  clearAllMemories: () => void;
}

export const useMemoryStore = create<MemoryState>()(
  persist(
    (set, get) => ({
      memories: {},
      
      updateMemory: (conversationId, memory) => {
        set((state) => ({
          memories: {
            ...state.memories,
            [conversationId]: memory
          }
        }));
      },
      
      getMemory: (conversationId) => {
        return get().memories[conversationId] || [];
      },
      
      clearMemory: (conversationId) => {
        set((state) => {
          const newMemories = { ...state.memories };
          delete newMemories[conversationId];
          return { memories: newMemories };
        });
      },
      
      clearAllMemories: () => {
        set({ memories: {} });
      }
    }),
    {
      name: 'memory-storage',
      // Only persist the memories object
      partialize: (state) => ({ memories: state.memories }),
    }
  )
); 