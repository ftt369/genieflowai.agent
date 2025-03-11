import React from 'react';
import { useThemeStore } from '../stores/theme/themeStore';

export default function GradientControls() {
  const { gradient, updateGradient } = useThemeStore();

  const gradientTypes = [
    { value: 'top-bottom', label: 'Top to Bottom' },
    { value: 'bottom-top', label: 'Bottom to Top' },
    { value: 'center-radial', label: 'Center Radial' }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Gradient Overlay</h3>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={gradient.enabled}
            onChange={(e) => updateGradient({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
      </div>

      {gradient.enabled && (
        <div className="space-y-3">
          <div>
            <label className="text-sm">Type</label>
            <select
              value={gradient.type}
              onChange={(e) => updateGradient({ type: e.target.value as any })}
              className="w-full px-2 py-1 mt-1 rounded bg-muted border border-border"
            >
              {gradientTypes.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-sm">Start Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={gradient.startColor}
                  onChange={(e) => updateGradient({ startColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={gradient.startColor}
                  onChange={(e) => updateGradient({ startColor: e.target.value })}
                  className="flex-1 px-2 py-1 text-xs rounded bg-muted border border-border"
                />
              </div>
            </div>

            <div>
              <label className="text-sm">End Color</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={gradient.endColor}
                  onChange={(e) => updateGradient({ endColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={gradient.endColor}
                  onChange={(e) => updateGradient({ endColor: e.target.value })}
                  className="flex-1 px-2 py-1 text-xs rounded bg-muted border border-border"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm">Opacity</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={gradient.opacity}
              onChange={(e) => updateGradient({ opacity: parseFloat(e.target.value) })}
              className="w-full mt-1"
            />
          </div>
        </div>
      )}
    </div>
  );
} 