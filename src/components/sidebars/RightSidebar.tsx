import React from 'react';
import { Button } from '../ui/button';
import { Select } from '../ui/select';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { useThemeStore } from '../../stores/theme/themeStore';
import { Sun, Moon, Monitor, Paintbrush, Sliders, MessageSquare } from 'lucide-react';

const RightSidebar: React.FC = () => {
  const { currentTheme, mode, setMode, updateWritingStyle } = useThemeStore();

  const handleToneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateWritingStyle({ tone: e.target.value as 'formal' | 'casual' | 'technical' });
  };

  const handleDetailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateWritingStyle({ detail: e.target.value as 'concise' | 'detailed' });
  };

  return (
    <div className="w-80 h-full border-l border-border bg-card">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Settings & Customization</h2>
        </div>

        {/* Settings Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Theme Selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Paintbrush size={16} />
              Theme Mode
            </h3>
            <div className="flex gap-2">
              <Button
                variant={mode === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('light')}
                className="flex-1"
              >
                <Sun size={16} className="mr-2" />
                Light
              </Button>
              <Button
                variant={mode === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('dark')}
                className="flex-1"
              >
                <Moon size={16} className="mr-2" />
                Dark
              </Button>
              <Button
                variant={mode === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('system')}
                className="flex-1"
              >
                <Monitor size={16} className="mr-2" />
                System
              </Button>
            </div>
          </div>

          {/* Writing Style */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <MessageSquare size={16} />
              Writing Style
            </h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm">Tone</label>
                <Select
                  value={currentTheme.writingStyle.tone}
                  onChange={handleToneChange}
                >
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm">Detail Level</label>
                <Select
                  value={currentTheme.writingStyle.detail}
                  onChange={handleDetailChange}
                >
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Sliders size={16} />
              Additional Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm">Auto-save chats</label>
                <Switch />
              </div>
              <div className="space-y-2">
                <label className="text-sm">Response Length</label>
                <Slider defaultValue={[50]} max={100} step={1} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar; 