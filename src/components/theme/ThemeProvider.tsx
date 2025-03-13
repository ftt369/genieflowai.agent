import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, profile, intensity } = useThemeStore();

  useEffect(() => {
    // Apply theme mode
    document.documentElement.classList.remove('light', 'dark');
    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.add(mode);
    }

    // Apply color profile
    document.documentElement.classList.remove('default', 'vibrant', 'muted', 'contrast');
    document.documentElement.classList.add(profile);

    // Apply intensity
    document.documentElement.style.setProperty('--color-intensity', intensity.toString());
  }, [mode, profile, intensity]);

  return <>{children}</>;
}

export default ThemeProvider; 