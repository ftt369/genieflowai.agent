import React, { useState, useEffect } from 'react';
import { useModeStore, type AssistantMode } from '@/stores/model/modeStore';
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
  Search,
  Menu,
  MessageSquare,
  HelpCircle,
  User,
  LogOut
} from 'lucide-react';
import ModeCustomizer from '@/components/mode/ModeCustomizer';
import { Button } from '@/components/ui/button';
import { ThemeControls } from '@/components/theme/ThemeControls';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { type ColorProfile } from '@/config/theme';
import ModeDropdown from '@/components/chat/ModeDropdown';

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
  const { profile: themeProfile } = useThemeStore();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [customizingMode, setCustomizingMode] = useState<string | null>(null);
  const [currentCustomMode, setCurrentCustomMode] = useState<AssistantMode | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Detect scroll for elevation change
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Mode customization handlers
  const handleCreateMode = () => {
    const newMode: AssistantMode = {
      id: `custom_${Date.now()}`,
      name: 'New Custom Mode',
      description: 'Custom assistant mode',
      systemPrompt: 'You are a helpful assistant.',
      temperature: 0.7,
      icon: '✨',
      category: 'Custom',
      tags: ['custom'],
      maxTokens: 2048
    };
    
    setCurrentCustomMode(newMode);
    setCustomizingMode('create');
  };
  
  // Handle customize existing mode
  const handleCustomizeMode = (modeId: string) => {
    const mode = modes.find(m => m.id === modeId);
    if (mode) {
      setCurrentCustomMode(mode);
      setCustomizingMode('edit');
    }
  };
  
  // Handle AI settings
  const handleOpenAiSettings = () => {
    // Add AI settings handling logic if needed
  };

  // Check if we're using the Spiral theme profile
  const isSpiralStyle = themeProfile === 'spiral' as ColorProfile;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        isSpiralStyle
          ? "bg-blue-900 border-amber-400 text-white"
          : "bg-background border-border"
      )}
    >
      <div className="container flex h-14 items-center px-4">
        {/* Logo & Menu */}
        <div className="flex items-center mr-4">
          <Button variant="ghost" size="icon" className="mr-2 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <img 
              src="/imageedit_1_6257830671.png" 
              alt="GenieAgent Logo" 
              className="h-10 w-auto object-contain" 
              style={{ 
                margin: 0, 
                padding: 0, 
                border: 'none', 
                maxHeight: '100%',
                filter: isSpiralStyle ? 'drop-shadow(0 0 3px rgba(230, 180, 76, 0.5))' : 'none'
              }}
            />
            <span className={cn(
              "font-semibold text-lg hidden md:block",
              isSpiralStyle ? "text-white" : "text-foreground"
            )}>
              GenieAgent
            </span>
          </div>
        </div>

        {/* Mode Selector - REPLACED with our new ModeDropdown */}
        <div className="ml-auto mr-4">
          <ModeDropdown 
            onSelect={(modeId) => setActiveMode(modeId)}
            onOpenSettings={handleOpenAiSettings}
            onCreateMode={handleCreateMode}
            onCustomizeMode={handleCustomizeMode}
          />
        </div>

        {/* Right Side Controls */}
        <div className={cn(
          "flex items-center ml-auto gap-2",
          isSpiralStyle ? "text-white" : ""
        )}>
          {/* Search Button */}
          <Button 
            variant={isSpiralStyle ? "ghost" : "outline"} 
            size="icon"
            className={cn(
              isSpiralStyle && "hover:bg-white/20 text-white"
            )}
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
          
          {/* Theme Controls */}
          <div className={isSpiralStyle ? "text-white" : ""}>
            <ThemeControls />
          </div>
          
          {/* New Chat Button */}
          <Button 
            variant="default"
            size="sm"
            className={cn(
              "hidden md:flex items-center gap-2", 
              isSpiralStyle && "bg-white/20 text-white"
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
          
          {/* Fullscreen Toggle */}
          <Button 
            variant="outline" 
            size="icon"
            className={cn(isSpiralStyle && "hover:bg-white/20 text-white")}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle fullscreen</span>
          </Button>
          
          {/* Help Button */}
          <Button 
            variant={isSpiralStyle ? "ghost" : "outline"} 
            size="icon"
            className={cn(
              isSpiralStyle && "hover:bg-white/20 text-white" 
            )}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant={isSpiralStyle ? "ghost" : "outline"} 
                size="icon"
                className={cn(
                  isSpiralStyle && "hover:bg-white/20 text-white"
                )}
              >
                <User className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ModeCustomizer Modal */}
      {customizingMode && currentCustomMode && (
        <ModeCustomizer
          mode={currentCustomMode}
          onClose={() => {
            setCustomizingMode(null);
            setCurrentCustomMode(null);
          }}
        />
      )}
    </header>
  );
}