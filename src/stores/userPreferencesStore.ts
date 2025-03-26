import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferencesState {
  // Theme preferences
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  
  // Chat preferences
  fontSize: 'small' | 'medium' | 'large';
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  
  // Message display preferences
  showTimestamps: boolean;
  setShowTimestamps: (show: boolean) => void;
  
  // Thinking mode preferences
  showThinkingProcess: boolean;
  setShowThinkingProcess: (show: boolean) => void;
  thinkingSpeed: 'slow' | 'medium' | 'fast';
  setThinkingSpeed: (speed: 'slow' | 'medium' | 'fast') => void;
}

export const userPreferencesStore = create<UserPreferencesState>()(
  persist(
    (set) => ({
      // Theme
      darkMode: false,
      setDarkMode: (darkMode) => set({ darkMode }),
      
      // Chat 
      fontSize: 'medium',
      setFontSize: (fontSize) => set({ fontSize }),
      
      // Message display
      showTimestamps: true,
      setShowTimestamps: (showTimestamps) => set({ showTimestamps }),
      
      // Thinking mode
      showThinkingProcess: true,
      setShowThinkingProcess: (showThinkingProcess) => set({ showThinkingProcess }),
      thinkingSpeed: 'medium',
      setThinkingSpeed: (thinkingSpeed) => set({ thinkingSpeed }),
    }),
    {
      name: 'user-preferences',
      getStorage: () => localStorage,
    }
  )
); 