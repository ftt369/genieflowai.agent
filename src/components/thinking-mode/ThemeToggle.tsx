import React from 'react';
import { useThemeStore } from '@/stores/theme/themeStore';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { mode, setMode } = useThemeStore();
  
  const toggleTheme = () => {
    // Cycle through the modes: light -> dark -> system -> light
    if (mode === 'light') {
      setMode('dark');
      document.documentElement.classList.add('dark');
    } else if (mode === 'dark') {
      setMode('system');
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      setMode('light');
      document.documentElement.classList.remove('dark');
    }
  };
  
  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      title={`Current theme: ${mode}. Click to change.`}
    >
      {mode === 'light' && <Sun className="h-5 w-5" />}
      {mode === 'dark' && <Moon className="h-5 w-5" />}
      {mode === 'system' && <Monitor className="h-5 w-5" />}
    </button>
  );
};

export default ThemeToggle; 