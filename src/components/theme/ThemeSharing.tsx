import React, { useState } from 'react';
import { useThemeStore, type BaseTheme } from '@stores/theme/themeStore';
import { cn } from '@utils/cn';

const ThemeSharing: React.FC = () => {
  const { currentTheme, exportTheme, importTheme } = useThemeStore();
  const [newThemeName, setNewThemeName] = useState('');

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

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Share Theme</h3>
      <div className="space-y-4">
        <div>
          <button
            onClick={handleExport}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors"
          >
            Export Theme
          </button>
        </div>
        <div>
          <label className="block">
            <span className="sr-only">Import Theme</span>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-white
                  hover:file:bg-primary/90
                  file:cursor-pointer cursor-pointer"
              />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ThemeSharing; 