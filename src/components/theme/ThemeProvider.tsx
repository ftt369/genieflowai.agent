import { useEffect, useState } from 'react';
import { useThemeStore } from '@/stores/theme/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, profile, intensity } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Handle initial theme setup and changes
  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    
    // Apply theme mode
    root.classList.remove('light', 'dark');
    
    // Determine the theme based on mode
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const currentTheme = mode === 'system' ? systemTheme : mode;
    
    // Add transition class for smooth theme changes
    root.classList.add('theme-transition');
    
    // Set the actual theme
    root.classList.add(currentTheme);
    
    // Apply color profile
    root.classList.remove('default', 'vibrant', 'muted', 'contrast', 'office', 'spiral');
    root.classList.add(profile);

    // Apply intensity
    root.style.setProperty('--color-intensity', intensity.toString());
    
    // Listen for system theme changes if in system mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (mode === 'system') {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Remove transition after theme has changed
    const transitionTimeout = setTimeout(() => {
      root.classList.remove('theme-transition');
    }, 300);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
      clearTimeout(transitionTimeout);
    };
  }, [mode, profile, intensity]);

  // Don't render until client-side
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

export default ThemeProvider; 