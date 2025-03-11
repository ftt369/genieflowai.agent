import React from 'react';
import { useThemeStore, type ThemeAnimation } from '@stores/theme/themeStore';
import { cn } from '@utils/cn';

const ThemeAnimationControls: React.FC = () => {
  const { animation, updateAnimation } = useThemeStore();

  const animationTypes = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'scale', label: 'Scale' },
    { value: 'rotate', label: 'Rotate' },
    { value: 'none', label: 'None' },
  ];

  const easingTypes = [
    { value: 'linear', label: 'Linear' },
    { value: 'ease', label: 'Ease' },
    { value: 'ease-in', label: 'Ease In' },
    { value: 'ease-out', label: 'Ease Out' },
    { value: 'ease-in-out', label: 'Ease In Out' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Animation</h3>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={animation.enabled}
            onChange={(e) => updateAnimation({ enabled: e.target.checked })}
            className="rounded border-gray-300"
          />
          <span className="text-xs text-muted-foreground">Enable</span>
        </label>
      </div>

      {animation.enabled && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Type</label>
            <select
              value={animation.type}
              onChange={(e) => updateAnimation({ type: e.target.value as ThemeAnimation['type'] })}
              className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
            >
              {animationTypes.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-xs text-muted-foreground">Duration (ms)</label>
              <span className="text-xs text-muted-foreground">{animation.duration}ms</span>
            </div>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={animation.duration}
              onChange={(e) => updateAnimation({ duration: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Easing</label>
            <select
              value={animation.easing}
              onChange={(e) => updateAnimation({ easing: e.target.value as ThemeAnimation['easing'] })}
              className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
            >
              {easingTypes.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeAnimationControls; 