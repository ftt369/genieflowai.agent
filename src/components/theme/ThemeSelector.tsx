import React, { useState } from 'react';
import { useThemeStore, type BaseTheme } from '@stores/theme/themeStore';
import { cn } from '@utils/cn';
import { 
  Monitor,
  Moon,
  Sun,
  Palette,
  Check
} from 'lucide-react';

export function ThemeSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, mode, setTheme, setMode } = useThemeStore();

  const themes: BaseTheme[] = [
    {
      name: 'Light',
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
        border: '#e5e7eb'
      },
      effects: {
        glow: '0 0 10px rgba(59, 130, 246, 0.5)',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid',
        opacity: 1
      },
      writingStyle: {
        tone: 'formal',
        detail: 'detailed'
      }
    },
    {
      name: 'Dark',
      mode: 'dark',
      colors: {
        background: '#1a1a1a',
        foreground: '#ffffff',
        primary: '#3b82f6',
        secondary: '#6c757d',
        muted: '#374151',
        accent: '#60a5fa',
        card: '#1f2937',
        'card-foreground': '#ffffff',
        border: '#374151'
      },
      effects: {
        glow: '0 0 10px rgba(96, 165, 250, 0.5)',
        shadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
        border: '1px solid',
        opacity: 1
      },
      writingStyle: {
        tone: 'formal',
        detail: 'detailed'
      }
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 p-2 rounded-lg transition-colors",
          "hover:bg-muted text-foreground"
        )}
      >
        <Palette className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-lg border border-border bg-background shadow-lg z-50">
          <div className="p-2">
            {/* Mode Selection */}
            <div className="mb-2">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Appearance
              </div>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => setMode('light')}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
                    mode === 'light'
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <Sun className="h-4 w-4" />
                  <span className="text-sm">Light</span>
                </button>
                <button
                  onClick={() => setMode('dark')}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
                    mode === 'dark'
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <Moon className="h-4 w-4" />
                  <span className="text-sm">Dark</span>
                </button>
                <button
                  onClick={() => setMode('system')}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors",
                    mode === 'system'
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted text-foreground"
                  )}
                >
                  <Monitor className="h-4 w-4" />
                  <span className="text-sm">System</span>
                </button>
              </div>
            </div>

            {/* Theme Selection */}
            <div>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Color Theme
              </div>
              <div className="space-y-1">
                {themes.map((theme) => (
                  <button
                    key={theme.name}
                    onClick={() => {
                      setTheme(theme);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left",
                      currentTheme.name === theme.name
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-border"
                      style={{ 
                        background: theme.colors.primary,
                        borderColor: theme.colors.border
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{theme.name}</div>
                      <div className="text-xs truncate text-muted-foreground">
                        {theme.mode} mode
                      </div>
                    </div>
                    {currentTheme.name === theme.name && (
                      <Check className="h-4 w-4 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 