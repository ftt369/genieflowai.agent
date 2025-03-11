import React from 'react';
import { useThemeStore, type GradientConfig } from '@stores/theme/themeStore';
import { cn } from '@utils/cn';

type GradientKey = keyof GradientConfig;

const GradientControls: React.FC = () => {
  const { gradient, updateGradient } = useThemeStore();

  const handleGradientChange = (key: GradientKey, value: string | number | boolean) => {
    updateGradient({ [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Gradient</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={gradient?.enabled || false}
            onChange={(e) => handleGradientChange('enabled', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-xs text-muted-foreground">Enable</span>
        </label>
      </div>

      {gradient?.enabled && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Start Color</label>
              <input
                type="color"
                value={gradient.startColor || '#000000'}
                onChange={(e) => handleGradientChange('startColor', e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">End Color</label>
              <input
                type="color"
                value={gradient.endColor || '#000000'}
                onChange={(e) => handleGradientChange('endColor', e.target.value)}
                className="w-full h-8 rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs text-muted-foreground">Opacity</label>
              <span className="text-xs text-muted-foreground">
                {Math.round((gradient.opacity || 0) * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={gradient.opacity || 0}
              onChange={(e) => handleGradientChange('opacity', Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Type</label>
            <select
              value={gradient.type || 'top-bottom'}
              onChange={(e) => handleGradientChange('type', e.target.value)}
              className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
            >
              <option value="top-bottom">Top to Bottom</option>
              <option value="bottom-top">Bottom to Top</option>
              <option value="center-radial">Center Radial</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradientControls; 