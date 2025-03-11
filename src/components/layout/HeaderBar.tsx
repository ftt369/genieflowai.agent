import React, { useState } from 'react';
import { useThemeStore } from '@stores/theme/themeStore';
import { useModeStore } from '@stores/model/modeStore';
import { cn } from '@utils/cn';
import { 
  Maximize2,
  Minimize2,
  Settings,
  Monitor,
  Moon,
  Sun,
  Palette,
  Bot,
  ChevronDown,
  Plus,
  Pencil
} from 'lucide-react';
import { ThemeSelector } from '@components/theme/ThemeSelector';
import ThemeAnimationControls from '@components/theme/ThemeAnimationControls';
import ThemeScheduler from '@components/theme/ThemeScheduler';
import ThemeSharing from '@components/theme/ThemeSharing';
import ModeCustomizer from '@components/mode/ModeCustomizer';

interface HeaderBarProps {
  className?: string;
}

const HeaderBar: React.FC<HeaderBarProps> = ({ className }) => {
  const { mode, setMode } = useThemeStore();
  const { modes, activeMode, setActiveMode, addCustomMode } = useModeStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [customizingMode, setCustomizingMode] = useState<string | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const currentMode = modes.find(m => m.id === activeMode);

  const handleCreateMode = () => {
    const newMode = {
      id: `custom-${Date.now()}`,
      name: 'New Mode',
      description: 'Custom assistant mode',
      systemPrompt: '',
      temperature: 0.7,
      icon: '🤖',
      category: 'Custom',
      tags: [],
      customInstructions: []
    };
    addCustomMode(newMode);
    setCustomizingMode(newMode.id);
    setShowModes(false);
  };

  return (
    <header className={cn("h-12 border-b border-border bg-background", className)}>
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">GenieAgent</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="relative">
            <button
              onClick={() => setShowModes(!showModes)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                "hover:bg-muted text-foreground"
              )}
            >
              <Bot className="h-4 w-4" />
              <span className="text-sm">{currentMode?.name || 'Select Mode'}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showModes && (
              <div className="absolute left-0 mt-2 w-64 rounded-lg border border-border bg-background shadow-lg z-50">
                <div className="p-2">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <div className="text-xs font-medium text-muted-foreground">Assistant Modes</div>
                    <button
                      onClick={handleCreateMode}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/90"
                    >
                      <Plus className="h-3 w-3" />
                      New Mode
                    </button>
                  </div>
                  <div className="space-y-1">
                    {modes.map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setActiveMode(mode.id);
                          setShowModes(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left group",
                          activeMode === mode.id
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{mode.name}</div>
                          <div className="text-xs truncate text-muted-foreground">
                            {mode.description}
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCustomizingMode(mode.id);
                            setShowModes(false);
                          }}
                          className={cn(
                            "p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                            activeMode === mode.id
                              ? "hover:bg-primary-foreground/10 text-primary-foreground"
                              : "hover:bg-muted-foreground/10"
                          )}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Mode Buttons */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => setMode('light')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                mode === 'light' ? "bg-background text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sun className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMode('dark')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                mode === 'dark' ? "bg-background text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Moon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMode('system')}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                mode === 'system' ? "bg-background text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>

          {/* Theme Selector */}
          <div className="relative">
            <ThemeSelector />
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showSettings ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <Settings className="h-4 w-4" />
          </button>

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute right-4 top-14 w-80 rounded-lg border border-border bg-background shadow-lg z-50">
          <div className="p-4 space-y-6">
            <ThemeAnimationControls />
            <ThemeScheduler />
            <ThemeSharing />
          </div>
        </div>
      )}

      {/* Mode Customizer */}
      {customizingMode && (
        <ModeCustomizer
          mode={modes.find(m => m.id === customizingMode)!}
          onClose={() => setCustomizingMode(null)}
        />
      )}
    </header>
  );
};

export default HeaderBar; 