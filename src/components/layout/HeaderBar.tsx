import React, { useState } from 'react';
import { useModeStore } from '@/stores/model/modeStore';
import { useThemeStore } from '@/stores/theme/themeStore';
import { cn } from '@/lib/utils';
import { 
  Maximize2,
  Minimize2,
  Settings,
  Bot,
  ChevronDown,
  Plus,
  Pencil,
  Sun,
  Moon,
  Monitor,
  Palette,
  Menu,
  Search
} from 'lucide-react';
import ModeCustomizer from '@/components/mode/ModeCustomizer';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface HeaderBarProps {
  className?: string;
}

// Add UUID generation function for browser compatibility
function generateUUID() {
  // Simple UUID generation that doesn't rely on crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function HeaderBar({ className }: HeaderBarProps) {
  const { modes, activeMode, setActiveMode, addCustomMode } = useModeStore();
  const { mode: themeMode, profile: themeProfile, setMode: setThemeMode, setProfile: setThemeProfile } = useThemeStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [customizingMode, setCustomizingMode] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
      id: generateUUID(),
      name: 'Custom Mode',
      description: 'A custom mode',
      systemPrompt: 'You are a helpful assistant.',
      temperature: 0.7,
      icon: '🤖',
      category: 'Custom',
      tags: [],
      customInstructions: []
    };
    addCustomMode(newMode);
    setActiveMode(newMode.id);
    setCustomizingMode(newMode.id);
    setShowModes(false);
  };

  return (
    <header 
      className={cn(
        "w-full h-16 px-6 flex items-center justify-between",
        "bg-[--md-sys-color-surface]/98 border-b border-[--md-sys-color-outline-variant]",
        "shadow-lg",
        "transition-all duration-300 ease-in-out",
        className
      )}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.14)'
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-80 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300"></div>
            <div className="relative bg-white dark:bg-gray-900 p-2 rounded-full border border-blue-300 dark:border-blue-800 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <Bot className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <span className="text-lg font-bold text-[--md-sys-color-on-surface] tracking-tight group-hover:text-[--md-sys-color-primary] transition-colors duration-300">
            GenieAgent
          </span>
        </div>

        {/* Search bar */}
        <div className={cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-full",
          "bg-[--md-sys-color-surface-variant]/80",
          "border border-[--md-sys-color-outline-variant]",
          "transition-all duration-300 ease-in-out",
          "hover:bg-[--md-sys-color-surface-variant] hover:border-[--md-sys-color-outline]",
          "focus-within:bg-[--md-sys-color-surface] focus-within:border-[--md-sys-color-primary]/50 focus-within:ring-2 focus-within:ring-[--md-sys-color-primary]/40",
          "shadow-md hover:shadow-lg",
          "transform-gpu hover:-translate-y-1",
          isSearchOpen ? "w-96" : "w-72"
        )}>
          <Search className="h-4 w-4 text-[--md-sys-color-on-surface-variant] transition-colors duration-300" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent w-full text-sm outline-none text-[--md-sys-color-on-surface] placeholder:text-[--md-sys-color-on-surface-variant]/70 transition-colors duration-300"
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => setIsSearchOpen(false)}
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-3">
        {/* Mode Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full",
                "text-sm font-medium",
                "bg-[--md-sys-color-primary-container]/90 text-[--md-sys-color-on-primary-container]",
                "border border-[--md-sys-color-primary]/20",
                "hover:bg-[--md-sys-color-primary-container] hover:border-[--md-sys-color-primary]/40 hover:shadow-xl",
                "active:scale-95",
                "transform-gpu hover:-translate-y-1",
                "transition-all duration-300 ease-in-out"
              )}
            >
              <div className="relative">
                <div className="absolute -inset-1.5 bg-[--md-sys-color-primary]/40 rounded-full opacity-80 blur-md"></div>
                <Bot className="h-4 w-4 relative" />
              </div>
              <span>{currentMode?.name || 'Select Mode'}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-70 transition-transform duration-300 group-hover:rotate-180" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl shadow-2xl border border-[--md-sys-color-outline-variant] bg-[--md-sys-color-surface]/98 backdrop-blur-xl">
            {modes.map(mode => (
              <DropdownMenuItem 
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer",
                  "text-sm font-medium",
                  "transition-all duration-200 ease-in-out",
                  "hover:transform-gpu hover:-translate-y-0.5",
                  activeMode === mode.id 
                    ? "bg-[--md-sys-color-primary-container] text-[--md-sys-color-on-primary-container] shadow-lg" 
                    : "hover:bg-[--md-sys-color-surface-variant] hover:shadow-md"
                )}
              >
                <span className="text-lg">{mode.icon}</span>
                <span>{mode.name}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1.5 h-px bg-[--md-sys-color-outline-variant]/50" />
            <DropdownMenuItem 
              onClick={handleCreateMode}
              className="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer text-sm font-medium text-[--md-sys-color-primary] hover:bg-[--md-sys-color-primary]/15 transition-colors duration-200 hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Create New Mode</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Theme Toggle */}
        <button
          onClick={() => setThemeMode(themeMode === 'light' ? 'dark' : 'light')}
          className={cn(
            "p-2.5 rounded-full",
            "bg-[--md-sys-color-surface-variant]/70",
            "border border-[--md-sys-color-outline-variant]",
            "hover:bg-[--md-sys-color-surface-variant] hover:border-[--md-sys-color-outline]",
            "hover:shadow-xl active:scale-95",
            "transform-gpu hover:-translate-y-1",
            "transition-all duration-300 ease-in-out",
            "text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-on-surface]"
          )}
        >
          {themeMode === 'light' ? (
            <Sun className="h-5 w-5 transition-transform duration-300 hover:rotate-45" />
          ) : (
            <Moon className="h-5 w-5 transition-transform duration-300 hover:rotate-12" />
          )}
        </button>

        {/* Settings */}
        <button
          className={cn(
            "p-2.5 rounded-full",
            "bg-[--md-sys-color-surface-variant]/70",
            "border border-[--md-sys-color-outline-variant]",
            "hover:bg-[--md-sys-color-surface-variant] hover:border-[--md-sys-color-outline]",
            "hover:shadow-xl active:scale-95",
            "transform-gpu hover:-translate-y-1",
            "transition-all duration-300 ease-in-out",
            "text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-on-surface]"
          )}
        >
          <Settings className="h-5 w-5 transition-transform duration-300 hover:rotate-90" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className={cn(
            "p-2.5 rounded-full",
            "bg-[--md-sys-color-surface-variant]/70",
            "border border-[--md-sys-color-outline-variant]",
            "hover:bg-[--md-sys-color-surface-variant] hover:border-[--md-sys-color-outline]",
            "hover:shadow-xl active:scale-95",
            "transform-gpu hover:-translate-y-1",
            "transition-all duration-300 ease-in-out",
            "text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-on-surface]"
          )}
        >
          {isFullscreen ? (
            <Minimize2 className="h-5 w-5 transition-transform duration-300 hover:scale-90" />
          ) : (
            <Maximize2 className="h-5 w-5 transition-transform duration-300 hover:scale-110" />
          )}
          <span className="sr-only">Toggle fullscreen</span>
        </button>
      </div>

      {/* Mode Customizer Modal */}
      {customizingMode && (
        <ModeCustomizer
          mode={modes.find(m => m.id === customizingMode)!}
          onClose={() => setCustomizingMode(null)}
        />
      )}
    </header>
  );
}