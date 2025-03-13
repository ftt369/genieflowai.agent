import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type ColorProfile, type ThemeMode, themeProfiles } from '@/config/theme';

interface ThemeState {
  mode: ThemeMode;
  profile: ColorProfile;
  intensity: number;
  setMode: (mode: ThemeMode) => void;
  setProfile: (profile: ColorProfile) => void;
  setIntensity: (intensity: number) => void;
}

// Function to apply theme changes
const applyTheme = (mode: ThemeMode, profile: ColorProfile, intensity: number) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark);
  
  // Toggle dark mode class
  root.classList.toggle('dark', isDark);
  
  // Get the color set based on profile and mode
  const colors = themeProfiles[profile][isDark ? 'dark' : 'light'];
  
  // Apply each color with intensity adjustment
  Object.entries(colors).forEach(([key, value]) => {
    const [h, s, l] = value.split(' ').map(Number);
    const adjustedL = Math.max(0, Math.min(100, l * intensity));
    root.style.setProperty(`--${key}`, `${h} ${s}% ${adjustedL}%`);
  });
};

// Initialize theme store
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      profile: 'default',
      intensity: 1,
      setMode: (mode) => {
        set({ mode });
        applyTheme(mode, get().profile, get().intensity);
      },
      setProfile: (profile) => {
        set({ profile });
        applyTheme(get().mode, profile, get().intensity);
      },
      setIntensity: (intensity) => {
        const clampedIntensity = Math.max(0.5, Math.min(1.5, intensity));
        set({ intensity: clampedIntensity });
        applyTheme(get().mode, get().profile, clampedIntensity);
      }
    }),
    {
      name: 'theme-store',
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme after hydration
          applyTheme(state.mode, state.profile, state.intensity);
        }
      }
    }
  )
);

// Initialize theme on mount and handle system theme changes
if (typeof window !== 'undefined') {
  // Apply theme on initial load
  const { mode, profile, intensity } = useThemeStore.getState();
  applyTheme(mode, profile, intensity);

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', () => {
    const { mode, profile, intensity } = useThemeStore.getState();
    if (mode === 'system') {
      applyTheme(mode, profile, intensity);
    }
  });
} 