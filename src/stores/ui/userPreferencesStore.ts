import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createJSONStorage } from 'zustand/middleware';

interface UserPreferences {
  showThinking: boolean;
  setShowThinking: (showThinking: boolean) => void;
  
  // Add other user preferences here
  fontSize: 'sm' | 'md' | 'lg';
  setFontSize: (fontSize: 'sm' | 'md' | 'lg') => void;
  
  highContrast: boolean;
  setHighContrast: (highContrast: boolean) => void;
  
  reducedMotion: boolean;
  setReducedMotion: (reducedMotion: boolean) => void;
}

export const useUserPreferencesStore = create<UserPreferences>()(
  persist(
    (set) => ({
      // Thinking mode
      showThinking: false, // Default to false initially
      setShowThinking: (showThinking) => set({ showThinking }),
      
      // Font size preference
      fontSize: 'md',
      setFontSize: (fontSize) => set({ fontSize }),
      
      // Accessibility preferences
      highContrast: false,
      setHighContrast: (highContrast) => set({ highContrast }),
      
      reducedMotion: false,
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
    }),
    {
      name: 'user-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        showThinking: state.showThinking,
        fontSize: state.fontSize,
        highContrast: state.highContrast,
        reducedMotion: state.reducedMotion,
      }),
    }
  )
); 