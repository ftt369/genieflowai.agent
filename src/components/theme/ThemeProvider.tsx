import { useEffect } from 'react';
import { useThemeStore } from '@stores/theme/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { mode, currentTheme, gradient } = useThemeStore();

  useEffect(() => {
    // Apply theme to document root
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    
    // Handle system theme preference
    if (mode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(mode);
    }

    // Safely apply CSS variables
    if (currentTheme?.colors) {
      Object.entries(currentTheme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }

    // Safely apply effects
    if (currentTheme?.effects) {
      Object.entries(currentTheme.effects).forEach(([key, value]) => {
        root.style.setProperty(`--effect-${key}`, value.toString());
      });
    }

    // Apply gradient variables if enabled
    if (gradient?.enabled) {
      root.style.setProperty('--gradient-start-color', `${gradient.startColor}${Math.round((gradient.opacity || 0) * 255).toString(16).padStart(2, '0')}`);
      root.style.setProperty('--gradient-end-color', `${gradient.endColor}${Math.round((gradient.opacity || 0) * 255).toString(16).padStart(2, '0')}`);
    }

    // Add transition overlay
    root.classList.add('theme-changing');
    const timer = setTimeout(() => {
      root.classList.remove('theme-changing');
    }, 500);

    return () => clearTimeout(timer);
  }, [mode, currentTheme, gradient]);

  return (
    <>
      {gradient?.enabled && (
        <div className={`gradient-overlay gradient-${gradient.type}`} />
      )}
      <div className="theme-transition-overlay" />
      {children}
    </>
  );
} 