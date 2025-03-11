import React, { useState } from 'react';
import { Palette, Sun, Moon, Check, X, Settings, Download, Upload, Save, Trash2, Eye, Layers } from 'lucide-react';
import { useThemeStore, themePresets, type BaseTheme } from '@stores/theme/themeStore';
import { cn } from '@utils/cn';
import ThemeScheduler from './ThemeScheduler';
import ThemeAnimationControls from './ThemeAnimationControls';
import ThemeSharing from './ThemeSharing';
import ColorPalette from './ColorPalette';
import MaterialToggle from './MaterialToggle';
import GradientControls from './GradientControls';

export default function ThemeToggle() {
  const { 
    mode, 
    currentTheme, 
    customThemes,
    toggleMode, 
    setTheme, 
    updateColors, 
    updateEffects,
    saveCustomTheme,
    deleteCustomTheme,
    exportTheme,
    importTheme
  } = useThemeStore();

  const [showPalette, setShowPalette] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [activeTab, setActiveTab] = useState<'colors' | 'effects' | 'advanced'>('colors');

  const handlePresetChange = (preset: BaseTheme) => {
    setTheme(preset);
  };

  const handleColorChange = (key: keyof BaseTheme['colors'], value: string) => {
    updateColors({ [key]: value });
  };

  const handleEffectChange = (key: keyof BaseTheme['effects'], value: string | number) => {
    updateEffects({ [key]: value });
  };

  const handleSaveTheme = () => {
    if (newThemeName) {
      saveCustomTheme(newThemeName, currentTheme);
      setNewThemeName('');
    }
  };

  const handleExport = () => {
    const themeString = exportTheme();
    const blob = new Blob([themeString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentTheme.name}-theme.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        importTheme(content);
      };
      reader.readAsText(file);
    }
  };

  const tabs = [
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'effects', label: 'Effects', icon: Layers },
    { id: 'advanced', label: 'Advanced', icon: Settings },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleMode}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {mode === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={() => setIsCustomizing(!isCustomizing)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Customize theme"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {isCustomizing && (
        <div className="absolute right-0 mt-2 p-4 bg-card border rounded-lg shadow-lg w-80 z-50">
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-border">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm rounded-t-lg transition-colors',
                    activeTab === id
                      ? 'bg-primary text-white'
                      : 'hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <ColorPalette />
                  <GradientControls />
                </div>
              )}

              {activeTab === 'effects' && (
                <div className="space-y-6">
                  <MaterialToggle />
                  <ThemeAnimationControls />
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <ThemeScheduler />
                  <ThemeSharing />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}