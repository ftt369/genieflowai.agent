import React from 'react';
import { useThemeStore } from '../stores/theme/themeStore';

export default function ColorPalette() {
  const { currentTheme, updateColors } = useThemeStore();

  const colorCategories = [
    { title: 'Base', colors: ['background', 'foreground'] },
    { title: 'Primary', colors: ['primary', 'secondary', 'accent'] },
    { title: 'UI', colors: ['muted', 'card', 'card-foreground', 'border'] }
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Color Palette</h3>
      {colorCategories.map(({ title, colors }) => (
        <div key={title} className="space-y-2">
          <h4 className="text-sm text-secondary">{title}</h4>
          <div className="grid grid-cols-2 gap-2">
            {colors.map((colorKey) => (
              <div key={colorKey} className="space-y-1">
                <label className="text-xs capitalize">{colorKey}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={currentTheme.colors[colorKey]}
                    onChange={(e) => updateColors({ [colorKey]: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={currentTheme.colors[colorKey]}
                    onChange={(e) => updateColors({ [colorKey]: e.target.value })}
                    className="flex-1 px-2 py-1 text-xs rounded bg-muted border border-border"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 
 