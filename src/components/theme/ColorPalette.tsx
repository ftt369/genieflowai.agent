import React from 'react';
import { useThemeStore, type ThemeColors } from '@stores/theme/themeStore';
import { cn } from '@utils/cn';

type ColorKey = keyof ThemeColors;

const ColorPalette: React.FC = () => {
  const { currentTheme, updateColors } = useThemeStore();

  const colors: Array<{ key: ColorKey; label: string }> = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'background', label: 'Background' },
    { key: 'foreground', label: 'Foreground' },
    { key: 'muted', label: 'Muted' },
    { key: 'accent', label: 'Accent' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Colors</h3>
      <div className="grid grid-cols-2 gap-4">
        {colors.map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <label className="text-xs text-muted-foreground">{label}</label>
            <input
              type="color"
              value={currentTheme.colors[key] || '#000000'}
              onChange={(e) => updateColors({ [key]: e.target.value })}
              className="w-full h-8 rounded cursor-pointer"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette; 