import React from 'react';
import { useThemeStore, type ThemeEffects } from '@stores/theme/themeStore';
import { cn } from '@utils/cn';

type EffectKey = keyof ThemeEffects;

const MaterialToggle: React.FC = () => {
  const { currentTheme, updateEffects } = useThemeStore();

  const effects: Array<{ key: EffectKey; label: string; type: string; min: number; max: number }> = [
    { key: 'glow', label: 'Glow', type: 'range', min: 0, max: 100 },
    { key: 'shadow', label: 'Shadow', type: 'range', min: 0, max: 100 },
    { key: 'border', label: 'Border', type: 'range', min: 0, max: 20 },
    { key: 'opacity', label: 'Opacity', type: 'range', min: 0, max: 1 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Material Effects</h3>
      <div className="space-y-4">
        {effects.map(({ key, label, type, min, max }) => (
          <div key={key} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs text-muted-foreground">{label}</label>
              <span className="text-xs text-muted-foreground">
                {key === 'opacity' 
                  ? `${Math.round(Number(currentTheme.effects[key]) * 100)}%`
                  : currentTheme.effects[key]
                }
              </span>
            </div>
            <input
              type={type}
              min={min}
              max={max}
              step={key === 'opacity' ? 0.01 : 1}
              value={currentTheme.effects[key]}
              onChange={(e) => updateEffects({ [key]: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialToggle; 