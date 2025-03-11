import { useThemeStore, type BaseTheme } from '../stores/theme/themeStore';

export function useTheme(): BaseTheme {
  const { currentTheme } = useThemeStore();
  
  // Return the current theme if it exists, or a default theme
  return currentTheme || {
    name: 'Default',
    mode: 'light',
    colors: {
      background: '#ffffff',
      foreground: '#000000',
      primary: '#0066cc',
      secondary: '#6c757d',
      muted: '#f3f4f6',
      accent: '#3b82f6',
      card: '#ffffff',
      'card-foreground': '#000000',
      border: '#e5e7eb',
    },
    effects: {
      glow: '0 0 10px rgba(59, 130, 246, 0.5)',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      border: '1px solid',
      opacity: 1,
    },
    writingStyle: {
      tone: 'formal',
      detail: 'detailed'
    }
  };
} 