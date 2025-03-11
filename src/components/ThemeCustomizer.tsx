import React from 'react';
import { useThemeStore } from '../stores/theme/themeStore';
import ColorPalette from './ColorPalette';
import ThemeAnimationControls from './ThemeAnimationControls';
import ThemeScheduler from './ThemeScheduler';
import ThemeSharing from './ThemeSharing';
import GradientControls from './GradientControls';

const ThemeCustomizer: React.FC = () => {
  const { currentTheme, updateTheme } = useThemeStore();

  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-lg font-semibold mb-4">Theme Customization</h2>
        <div className="space-y-6">
          <ColorPalette />
          <ThemeAnimationControls />
          <GradientControls />
          <ThemeScheduler />
          <ThemeSharing />
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="font-medium">Theme Settings</h3>
        <div className="space-y-2">
          <label className="flex items-center justify-between">
            <span>Dark Mode</span>
            <input
              type="checkbox"
              checked={currentTheme.mode === 'dark'}
              onChange={(e) => updateTheme({ mode: e.target.checked ? 'dark' : 'light' })}
              className="toggle"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>System Theme</span>
            <input
              type="checkbox"
              checked={currentTheme.followSystem}
              onChange={(e) => updateTheme({ followSystem: e.target.checked })}
              className="toggle"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer; 