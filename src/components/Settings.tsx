import React, { useState } from 'react';
import { Slider } from '@mui/material';
import { Settings as Gear } from 'lucide-react';

const Settings = () => {
  const [contrast, setContrast] = useState(100);
  const [theme, setTheme] = useState('light');

  const handleContrastChange = (event: Event, newValue: number | number[]) => {
    setContrast(newValue as number);
    document.documentElement.style.setProperty('--contrast', `${newValue}%`);
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="settings">
      <div className="header">
        <Gear className="gear-icon" />
        <h2>Settings</h2>
      </div>
      <div className="content">
        <div className="theme-options">
          <h3>Theme</h3>
          <button onClick={() => handleThemeChange('light')}>Light</button>
          <button onClick={() => handleThemeChange('dark')}>Dark</button>
          <button onClick={() => handleThemeChange('custom')}>Custom</button>
        </div>
        <div className="contrast-slider">
          <h3>Contrast</h3>
          <Slider value={contrast} onChange={handleContrastChange} min={50} max={150} />
        </div>
      </div>
    </div>
  );
};

export default Settings; 