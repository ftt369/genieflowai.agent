import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  accentColor: string;
  setTheme: (theme: 'light' | 'dark') => void;
  setAccentColor: (color: string) => void;
  toggleTheme: () => void;
}

const applyTheme = (theme: 'light' | 'dark', accentColor: string) => {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;
  
  // First, remove any existing theme classes
  root.classList.remove('light', 'dark');
  
  // Then add the new theme class
  root.classList.add(theme);

  // Apply accent color
  root.style.setProperty('--accent-color', accentColor);

  // Force a re-render of background colors
  document.body.style.backgroundColor = '';
  requestAnimationFrame(() => {
    document.body.style.backgroundColor = theme === 'light' 
      ? 'hsl(0 0% 100%)' // Light theme background
      : 'hsl(222.2 84% 4.9%)'; // Dark theme background
  });
};

// Initialize theme based on system preference
const getInitialTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  
  // Check localStorage first
  const stored = localStorage.getItem('theme-store');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.state?.theme === 'light' || parsed.state?.theme === 'dark') {
        return parsed.state.theme;
      }
    } catch (e) {
      console.error('Error parsing stored theme:', e);
    }
  }
  
  // Fall back to light theme
  return 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: getInitialTheme(),
      accentColor: '#3b82f6',

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme, get().accentColor);
      },

      setAccentColor: (color) => {
        set({ accentColor: color });
        applyTheme(get().theme, color);
      },

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },
    }),
    {
      name: 'theme-store',
      onRehydrateStorage: () => (state) => {
        // Apply theme when store is rehydrated
        if (state) {
          applyTheme(state.theme, state.accentColor);
        }
      },
    }
  )
);

// Initialize theme immediately when the script loads
if (typeof window !== 'undefined') {
  const initialTheme = getInitialTheme();
  applyTheme(initialTheme, '#3b82f6');
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    const store = useThemeStore.getState();
    store.setTheme(e.matches ? 'dark' : 'light');
  });
} 