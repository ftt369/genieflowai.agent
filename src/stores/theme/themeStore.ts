import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { themePresets } from '../../config/themePresets';

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  muted: string;
  accent: string;
  card: string;
  'card-foreground': string;
  border: string;
}

export interface ThemeEffects {
  glow: string;
  shadow: string;
  border: string;
  opacity: number;
}

export interface WritingStyle {
  tone: 'formal' | 'casual' | 'technical';
  detail: 'concise' | 'detailed';
}

export interface BaseTheme {
  name: string;
  colors: ThemeColors;
  effects: ThemeEffects;
  writingStyle: WritingStyle;
  mode?: 'light' | 'dark' | 'system';
}

export interface ThemeSchedule {
  enabled: boolean;
  lightStart: string; // 24h format "HH:MM"
  darkStart: string; // 24h format "HH:MM"
}

export interface ThemeAnimation {
  enabled: boolean;
  type: 'fade' | 'slide' | 'scale' | 'rotate' | 'none';
  duration: number;
  easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

export interface GradientConfig {
  enabled: boolean;
  type: 'top-bottom' | 'bottom-top' | 'center-radial';
  startColor: string;
  endColor: string;
  opacity: number;
}

interface MaterialAnimation {
  enabled: boolean;
  duration: number;
  easing: string;
}

interface Material {
  type: 'none' | 'glass' | 'metal' | 'water' | 'crystal' | 'frost' | 'hologram' | 'mirror';
  opacity: number;
  blur?: number;
  refraction?: number;
  metallic?: number;
  roughness?: number;
  ripple?: number;
  animation?: MaterialAnimation;
}

export interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  currentTheme: BaseTheme;
  customThemes: Record<string, BaseTheme>;
  schedule: ThemeSchedule;
  animation: ThemeAnimation;
  gradient: GradientConfig;
  material: Material;
  materialPresets: Record<string, Material>;
  toggleMode: () => void;
  setMode: (mode: 'light' | 'dark' | 'system') => void;
  setTheme: (theme: BaseTheme) => void;
  updateColors: (colors: Partial<ThemeColors>) => void;
  updateEffects: (effects: Partial<ThemeEffects>) => void;
  updateWritingStyle: (style: Partial<WritingStyle>) => void;
  saveCustomTheme: (name: string, theme: BaseTheme) => void;
  deleteCustomTheme: (name: string) => void;
  exportTheme: () => string;
  importTheme: (themeData: string) => void;
  updateSchedule: (schedule: Partial<ThemeSchedule>) => void;
  updateAnimation: (animation: Partial<ThemeAnimation>) => void;
  updateGradient: (config: Partial<GradientConfig>) => void;
  shareTheme: (theme: BaseTheme) => Promise<string>;
  loadSharedTheme: (id: string) => Promise<void>;
  setMaterial: (material: Material) => void;
  saveMaterialPreset: (material: Material) => void;
  updateMaterial: (updates: Partial<Material>) => void;
}

const defaultLightColors: ThemeColors = {
  background: '#ffffff',
  foreground: '#000000',
  primary: '#0066cc',
  secondary: '#6c757d',
  muted: '#f3f4f6',
  accent: '#3b82f6',
  card: '#ffffff',
  'card-foreground': '#000000',
  border: '#e5e7eb',
};

const defaultDarkColors: ThemeColors = {
  background: '#1a1a1a',
  foreground: '#ffffff',
  primary: '#3b82f6',
  secondary: '#6c757d',
  muted: '#374151',
  accent: '#60a5fa',
  card: '#1f2937',
  'card-foreground': '#ffffff',
  border: '#374151',
};

const defaultEffects: ThemeEffects = {
  glow: '0 0 10px rgba(59, 130, 246, 0.5)',
  shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  border: '1px solid',
  opacity: 1,
};

const defaultGradient: GradientConfig = {
  enabled: false,
  type: 'top-bottom',
  startColor: '#3b82f6',
  endColor: '#60a5fa',
  opacity: 0.1,
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      currentTheme: {
        name: 'default',
        colors: defaultLightColors,
        effects: defaultEffects,
        writingStyle: {
          tone: 'formal',
          detail: 'detailed'
        },
        mode: 'system'
      },
      customThemes: {},
      schedule: {
        enabled: false,
        lightStart: '06:00',
        darkStart: '18:00'
      },
      animation: {
        enabled: true,
        type: 'fade',
        duration: 300,
        easing: 'ease'
      },
      gradient: defaultGradient,
      material: {
        type: 'none',
        opacity: 0.5,
        blur: 8,
        animation: {
          enabled: false,
          duration: 300,
          easing: 'ease'
        }
      },
      materialPresets: {},
      toggleMode: () => {
        const currentMode = get().mode;
        const newMode = currentMode === 'light' ? 'dark' : 'light';
        set((state) => ({
          mode: newMode,
          currentTheme: { ...state.currentTheme, mode: newMode }
        }));
      },
      setMode: (mode) =>
        set((state) => ({
          mode,
          currentTheme: { ...state.currentTheme, mode }
        })),
      setTheme: (theme) => set({ currentTheme: theme }),
      updateColors: (colors) => {
        const currentTheme = get().currentTheme;
        set({
          currentTheme: {
            ...currentTheme,
            colors: { ...currentTheme.colors, ...colors }
          }
        });
      },
      updateEffects: (effects) => {
        const currentTheme = get().currentTheme;
        set({
          currentTheme: {
            ...currentTheme,
            effects: { ...currentTheme.effects, ...effects }
          }
        });
      },
      updateWritingStyle: (style) =>
        set((state) => ({
          currentTheme: {
            ...state.currentTheme,
            writingStyle: { ...state.currentTheme.writingStyle, ...style }
          }
        })),
      saveCustomTheme: (name, theme) => set((state) => ({
        customThemes: {
          ...state.customThemes,
          [name]: theme
        }
      })),
      deleteCustomTheme: (name) => set((state) => {
        const { [name]: _, ...rest } = state.customThemes;
        return { customThemes: rest };
      }),
      exportTheme: () => {
        const { currentTheme } = get();
        return JSON.stringify(currentTheme);
      },
      importTheme: (themeData) => {
        try {
          const theme = JSON.parse(themeData) as BaseTheme;
          set({ currentTheme: theme });
        } catch (error) {
          console.error('Failed to import theme:', error);
        }
      },
      updateSchedule: (schedule) => set((state) => ({
        schedule: { ...state.schedule, ...schedule }
      })),
      updateAnimation: (animation) => set((state) => ({
        animation: { ...state.animation, ...animation }
      })),
      updateGradient: (config) => set((state) => ({
        gradient: { ...state.gradient, ...config }
      })),
      shareTheme: async (theme) => {
        // Implement theme sharing via API
        const response = await fetch('/api/themes/share', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(theme),
        });
        const { id } = await response.json();
        return id;
      },
      loadSharedTheme: async (id) => {
        // Load shared theme from API
        const response = await fetch(`/api/themes/${id}`);
        const theme = await response.json();
        set({ currentTheme: theme });
      },
      setMaterial: (material) => set(() => ({
        material,
      })),
      saveMaterialPreset: (material) =>
        set((state) => ({
          materialPresets: {
            ...state.materialPresets,
            [`custom-${Date.now()}`]: material,
          },
        })),
      updateMaterial: (updates) => set((state) => ({
        material: { ...state.material, ...updates }
      })),
    }),
    {
      name: 'theme-storage'
    }
  )
);

// Export the presets
export { themePresets }; 