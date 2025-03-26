import React, { useState, useEffect } from 'react';
import { useModeStore, type AssistantMode } from '@/stores/model/modeStore';
import { useThemeStore } from '@/stores/theme/themeStore';
import { useUserPreferencesStore } from '@/stores/ui/userPreferencesStore';
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
  LogOut,
  Brain,
  Sun,
  Moon
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
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { type ColorProfile } from '@/config/theme';
import ModeDropdown from '@/components/chat/ModeDropdown';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import Image from 'next/image';

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
  const { showThinking, setShowThinking } = useUserPreferencesStore();
  const { user, profile, signOut, signInWithProvider } = useAuth();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showModes, setShowModes] = useState(false);
  const [customizingMode, setCustomizingMode] = useState<string | null>(null);
  const [currentCustomMode, setCurrentCustomMode] = useState<AssistantMode | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
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

  // Add mobile menu toggle function
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Dispatch custom event for MainLayout to react to
    const event = new CustomEvent('toggle-mobile-menu', { 
      detail: { isOpen: !isMobileMenuOpen } 
    });
    document.dispatchEvent(event);
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

  // Handle Google login
  const handleGoogleLogin = async () => {
    await signInWithProvider('google');
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
  };

  // Check if we're using the Spiral theme profile
  const isSpiralStyle = themeProfile === 'spiral' as ColorProfile;

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return user?.email?.substring(0, 2).toUpperCase() || 'GA';
  };

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full",
      isSpiralStyle ? (
        "bg-white bg-gradient-to-r from-white via-white to-[#f8f9fa] text-[#004080] border-b border-[#e6b44c]/40"
      ) : (
        "bg-background/90 backdrop-blur-lg border-b"
      ),
      "shadow-xl shadow-black/5 bevel-glass"
    )}>
      <div className={cn(
        "container flex h-16 items-center px-4",
        "relative"
      )}>
        {/* Add decorative accent line */}
        <div className="absolute left-0 bottom-0 h-[2px] w-full bg-gradient-to-r from-primary/80 via-primary/30 to-background/0"></div>
        {/* Logo & Menu */}
        <div className="flex items-center mr-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden mr-2 bevel-neumorphic shadow-subtle rounded-lg hover:bg-background/80"
            onClick={toggleMobileMenu}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.svg"
              alt="GenieAgent Logo"
              width={32}
              height={32}
              className="h-8 w-8 light-source"
            />
            <span className="font-semibold text-xl hidden md:inline-block">
              GenieAgent
            </span>
          </Link>
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
          {/* Thinking Mode Toggle Button */}
          <Button
            variant={showThinking ? "default" : "ghost"}
            size="sm"
            className={cn(
              "flex items-center gap-2 bevel-edge shadow-subtle",
              showThinking 
                ? "bg-primary text-primary-foreground" 
                : isSpiralStyle 
                  ? "text-white hover:text-white/80" 
                  : "text-foreground hover:text-foreground/80 hover:bg-background/80"
            )}
            onClick={() => {
              setShowThinking(!showThinking);
              // Add visual feedback
              const notification = document.createElement('div');
              notification.className = 'fixed top-4 right-4 bg-primary text-white py-2 px-4 rounded shadow-lg z-50';
              notification.textContent = showThinking ? 'Thinking Mode Disabled' : 'Thinking Mode Enabled';
              document.body.appendChild(notification);
              setTimeout(() => notification.remove(), 2000);
            }}
          >
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Thinking Mode {showThinking ? 'On' : 'Off'}</span>
          </Button>
          
          {/* Search Button */}
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(
              "rounded-full bevel-neumorphic shadow-subtle",
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
          
          {/* Fullscreen Toggle */}
          <Button 
            variant="ghost" 
            size="icon"
            className={cn(
              "rounded-full bevel-neumorphic shadow-subtle",
              isSpiralStyle && "hover:bg-white/20 text-white"
            )}
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
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full bevel-neumorphic shadow-subtle",
              isSpiralStyle && "hover:bg-white/20 text-white"
            )}
          >
            <HelpCircle className="h-4 w-4" />
            <span className="sr-only">Help</span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-full bevel-neumorphic shadow-subtle"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            
            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {user ? (
                  <Avatar className="h-8 w-8 bevel-neumorphic shadow-subtle cursor-pointer">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.full_name || user.email} />
                    <AvatarFallback className={cn(
                      "bg-gradient-to-br",
                      isSpiralStyle 
                        ? "from-[#004080] to-[#002040] text-white" 
                        : "from-primary to-primary/80 text-primary-foreground"
                    )}>
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Button 
                    variant="default"
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 bevel-edge shadow-subtle", 
                      isSpiralStyle && "bg-white/20 text-white hover:bg-white/30"
                    )}
                    onClick={handleGoogleLogin}
                  >
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                )}
              </DropdownMenuTrigger>
              {user && (
                <DropdownMenuContent align="end" className="bevel-glass shadow-3d">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {profile?.full_name && (
                        <p className="font-medium">{profile.full_name}</p>
                      )}
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/profile'} className="hover:bg-background/50">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.location.href = '/settings'} className="hover:bg-background/50">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-background/50">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              )}
            </DropdownMenu>
          </div>
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