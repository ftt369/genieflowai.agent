import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type MaterialType = 'none' | 'glass' | 'metal' | 'water' | 'crystal' | 'frost' | 'hologram' | 'mirror';
export type BlendMode = 'overlay' | 'multiply' | 'screen' | 'color-dodge';

interface MaterialAnimation {
  enabled: boolean;
  duration: number;
  easing: string;
  type: 'fade' | 'slide' | 'scale' | 'rotate';
}

export interface MaterialState {
  type: MaterialType;
  opacity: number;
  blur?: number;
  refraction?: number;
  metallic?: number;
  roughness?: number;
  ripple?: number;
  responsive?: boolean;
  particles?: boolean;
  animation: MaterialAnimation;
  mixing?: {
    blend: BlendMode;
    opacity: number;
  };
  transition: {
    duration: number;
    easing: string;
  };
  [key: string]: any;
}

export const materialPresets = {
  glass: {
    type: 'glass',
    opacity: 0.5,
    blur: 8,
    animation: { enabled: true, duration: 300, easing: 'ease', type: 'fade' }
  },
  metal: {
    type: 'metal',
    opacity: 0.85,
    metallic: 0.9,
    roughness: 0.3,
    animation: { enabled: true, duration: 300, easing: 'ease-out', type: 'slide' }
  },
  water: {
    type: 'water',
    opacity: 0.7,
    blur: 12,
    ripple: 40,
    animation: { enabled: true, duration: 8000, easing: 'linear', type: 'scale' }
  },
  crystal: {
    type: 'crystal',
    opacity: 0.4,
    blur: 16,
    refraction: 0.5,
    animation: { enabled: true, duration: 8000, easing: 'ease-in-out', type: 'rotate' }
  }
} as const;

interface OverlayState {
  material: MaterialState;
  setMaterial: (type: MaterialType) => void;
  setOpacity: (opacity: number) => void;
  setEffect: (key: string, value: number | boolean) => void;
  setMixing: (blend: BlendMode) => void;
  updateMaterial: (updates: Partial<MaterialState>) => void;
  applyPreset: (presetName: keyof typeof materialPresets) => void;
}

const initialMaterial: MaterialState = {
  type: 'none',
  opacity: 0.5,
  blur: 8,
  refraction: 0.2,
  metallic: 0.8,
  roughness: 0.2,
  ripple: 30,
  responsive: false,
  particles: false,
  animation: {
    enabled: false,
    duration: 300,
    easing: 'ease',
    type: 'fade'
  },
  mixing: {
    blend: 'overlay',
    opacity: 0.5
  },
  transition: {
    duration: 300,
    easing: 'ease'
  }
};

export const useOverlayStore = create<OverlayState>()(
  persist(
    (set) => ({
      material: initialMaterial,
      setMaterial: (type) =>
        set((state) => ({
          material: { ...initialMaterial, ...state.material, type }
        })),
      setOpacity: (opacity) =>
        set((state) => ({
          material: { ...state.material, opacity }
        })),
      setEffect: (key, value) =>
        set((state) => ({
          material: { ...state.material, [key]: value }
        })),
      setMixing: (blend) =>
        set((state) => ({
          material: {
            ...state.material,
            mixing: { ...state.material.mixing, blend }
          }
        })),
      updateMaterial: (updates) =>
        set((state) => ({
          material: { ...initialMaterial, ...state.material, ...updates }
        })),
      applyPreset: (presetName) =>
        set((state) => ({
          material: { ...initialMaterial, ...state.material, ...materialPresets[presetName] }
        })),
    }),
    {
      name: 'overlay-storage'
    }
  )
);

export const materialEffects: Record<MaterialType, string> = {
  none: '',
  glass: `
    background: rgba(255, 255, 255, var(--material-opacity));
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  `,
  metal: `
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, calc(var(--material-opacity) + 0.1)),
      rgba(255, 255, 255, calc(var(--material-opacity) - 0.1))
    );
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `,
  water: `
    background: rgba(0, 150, 255, var(--material-opacity));
    backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid rgba(0, 150, 255, 0.2);
  `,
  crystal: `
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  `,
  frost: `
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  `,
  hologram: `
    background: linear-gradient(
      45deg,
      rgba(0, 255, 255, 0.2),
      rgba(255, 0, 255, 0.2)
    );
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  `,
  mirror: `
    background: linear-gradient(
      to right,
      rgba(192, 192, 192, 0.9),
      rgba(255, 255, 255, 0.95)
    );
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.5);
  `
}; 