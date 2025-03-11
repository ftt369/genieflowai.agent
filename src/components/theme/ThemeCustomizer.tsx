import React from 'react';
import { useThemeStore, type ThemeState } from '@stores/theme/themeStore';
import ColorPalette from '../ColorPalette';
import ThemeAnimationControls from './ThemeAnimationControls';
import ThemeScheduler from './ThemeScheduler';
import ThemeSharing from './ThemeSharing';
import GradientControls from '../GradientControls';

const ThemeCustomizer: React.FC = () => {
  const { mode, setMode } = useThemeStore();

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
              checked={mode === 'dark'}
              onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')}
              className="toggle"
            />
          </label>
          <label className="flex items-center justify-between">
            <span>System Theme</span>
            <input
              type="checkbox"
              checked={mode === 'system'}
              onChange={(e) => setMode(e.target.checked ? 'system' : 'light')}
              className="toggle"
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer; 