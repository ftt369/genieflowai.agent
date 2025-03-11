import { BaseTheme } from '../stores/theme/themeStore';

export const themePresets: Record<string, BaseTheme> = {
  light: {
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
  },
  dark: {
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
      border: '#374151',
    },
    effects: {
      glow: '0 0 10px rgba(96, 165, 250, 0.5)',
      shadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      border: '1px solid',
      opacity: 1,
    },
    writingStyle: {
      tone: 'formal',
      detail: 'detailed'
    }
  },
  cyberpunk: {
    name: 'Cyberpunk',
    mode: 'dark',
    colors: {
      background: '#000000',
      foreground: '#00ff00',
      primary: '#ff00ff',
      secondary: '#00ffff',
      muted: '#1a1a1a',
      accent: '#ff0000',
      card: '#1a1a1a',
      'card-foreground': '#00ff00',
      border: '#ff00ff',
    },
    effects: {
      glow: '0 0 20px rgba(255, 0, 255, 0.5)',
      shadow: '0 4px 8px rgba(0, 255, 0, 0.3)',
      border: '1px solid',
      opacity: 0.8,
    },
    writingStyle: {
      tone: 'technical',
      detail: 'detailed'
    }
  },
  tokyoNight: {
    name: 'Tokyo Night',
    mode: 'dark',
    colors: {
      background: '#1a1b26',
      foreground: '#a9b1d6',
      primary: '#7aa2f7',
      secondary: '#bb9af7',
      muted: '#24283b',
      accent: '#f7768e',
      card: '#24283b',
      'card-foreground': '#a9b1d6',
      border: '#414868',
    },
    effects: {
      glow: '0 0 15px rgba(122, 162, 247, 0.3)',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      border: '1px solid',
      opacity: 0.9,
    },
    writingStyle: {
      tone: 'formal',
      detail: 'concise'
    }
  },
  synthwave: {
    name: 'Synthwave',
    mode: 'dark',
    colors: {
      background: '#2b213a',
      foreground: '#ff71ce',
      primary: '#b967ff',
      secondary: '#01cdfe',
      muted: '#241b2f',
      accent: '#05ffa1',
      card: '#241b2f',
      'card-foreground': '#ff71ce',
      border: '#b967ff',
    },
    effects: {
      glow: '0 0 25px rgba(255, 113, 206, 0.4)',
      shadow: '0 4px 8px rgba(5, 255, 161, 0.2)',
      border: '1px solid',
      opacity: 0.85,
    },
    writingStyle: {
      tone: 'casual',
      detail: 'detailed'
    }
  },
  forest: {
    name: 'Forest',
    mode: 'dark',
    colors: {
      background: '#1b2d1c',
      foreground: '#e0e7e1',
      primary: '#4caf50',
      secondary: '#81c784',
      muted: '#243024',
      accent: '#66bb6a',
      card: '#243024',
      'card-foreground': '#e0e7e1',
      border: '#2e3e2f',
    },
    effects: {
      glow: '0 0 15px rgba(76, 175, 80, 0.3)',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      border: '1px solid',
      opacity: 0.9,
    },
    writingStyle: {
      tone: 'formal',
      detail: 'detailed'
    }
  },
  sunset: {
    name: 'Sunset',
    mode: 'dark',
    colors: {
      background: '#2d1b1b',
      foreground: '#e7e1e0',
      primary: '#ff5722',
      secondary: '#ff8a65',
      muted: '#302424',
      accent: '#ff7043',
      card: '#302424',
      'card-foreground': '#e7e1e0',
      border: '#3e2e2e',
    },
    effects: {
      glow: '0 0 15px rgba(255, 87, 34, 0.3)',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      border: '1px solid',
      opacity: 0.9,
    },
    writingStyle: {
      tone: 'casual',
      detail: 'concise'
    }
  },
  ocean: {
    name: 'Ocean',
    mode: 'dark',
    colors: {
      background: '#1b222d',
      foreground: '#e0e5e7',
      primary: '#03a9f4',
      secondary: '#4fc3f7',
      muted: '#242d30',
      accent: '#29b6f6',
      card: '#242d30',
      'card-foreground': '#e0e5e7',
      border: '#2e363e',
    },
    effects: {
      glow: '0 0 15px rgba(3, 169, 244, 0.3)',
      shadow: '0 4px 6px rgba(0, 0, 0, 0.2)',
      border: '1px solid',
      opacity: 0.9,
    },
    writingStyle: {
      tone: 'formal',
      detail: 'detailed'
    }
  }
};

export type ThemePreset = typeof themePresets[keyof typeof themePresets]; 