import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ColorProfile = 'default' | 'spiral';

export interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  profile: ColorProfile;
  intensity: number;
  setMode: (mode: 'light' | 'dark' | 'system') => void;
  setProfile: (profile: ColorProfile) => void;
  setIntensity: (intensity: number) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      profile: 'default',
      intensity: 1,
      setMode: (mode) => set({ mode }),
      setProfile: (profile) => set({ profile }),
      setIntensity: (intensity) => set({ intensity })
    }),
    {
      name: 'theme-store'
    }
  )
); 