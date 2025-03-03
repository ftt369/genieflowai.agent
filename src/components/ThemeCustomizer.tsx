import { useState } from 'react';
import { Palette } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function ThemeCustomizer() {
  const { accentColor, setAccentColor } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);

  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 
                  transition-all duration-300 relative overflow-hidden group"
        aria-label="Customize theme"
      >
        <Palette className="w-5 h-5" style={{ color: accentColor }} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 animate-fade-in z-50">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme Color
            </label>
            <div className="grid grid-cols-3 gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                    accentColor === color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Set theme color to ${color}`}
                />
              ))}
            </div>
            <input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-full h-8 rounded cursor-pointer mt-2"
            />
          </div>
        </div>
      )}
    </div>
  );
} 