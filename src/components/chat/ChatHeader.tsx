import React, { useState, useRef, useEffect, lazy, Suspense } from 'react';
import { useThemeStore } from '@/stores/theme/themeStore';
import { cn } from '@/utils/cn';
import {
  Plus,
  Download,
  FileText,
  File,
  Trash2,
  Settings,
  Save,
  Trash,
  Pin,
  PinOff,
  Edit,
  Check,
  X,
  MoreVertical,
  Menu,
  Bot,
  Edit2,
  CheckCircle,
  Loader2,
  Bookmark,
  BookmarkMinus
} from 'lucide-react';
import { useChatStore } from '@/stores/chat/chatStore';
import { useModeStore, type AssistantMode } from '@/stores/model/modeStore';
import ModeDropdown from './ModeDropdown';
import ExhibitExporterButton from '../ExhibitExporterButton';

// Lazy load modals
const AiSettings = lazy(() => import('@/components/settings/AiSettings'));
const ModeCustomizer = lazy(() => import('@/components/mode/ModeCustomizer'));

interface ChatHeaderProps {
  onNewChat: () => void;
  onClearChat: () => void;
  onShowSettings: () => void;
  chatTitle: string;
  isEditing: boolean;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  setIsEditing: (isEditing: boolean) => void;
  handleUpdateTitle: () => void;
  isSaved: boolean;
  isPinned: boolean;
  onSaveChat: () => void;
  onPinChat: () => void;
  onShowExport: () => void;
}

export default function ChatHeader({
  onNewChat,
  onClearChat,
  onShowSettings,
  chatTitle,
  isEditing,
  editingTitle,
  setEditingTitle,
  setIsEditing,
  handleUpdateTitle,
  isSaved,
  isPinned,
  onSaveChat,
  onPinChat,
  onShowExport
}: ChatHeaderProps) {
  const { profile } = useThemeStore();
  const { activeMode, setActiveMode, modes, addCustomMode } = useModeStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Modal states
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [showModeCustomizer, setShowModeCustomizer] = useState(false);
  const [selectedModeForCustomization, setSelectedModeForCustomization] = useState<AssistantMode | null>(null);
  
  const isSpiralStyle = profile === 'spiral';

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
    }
  }, [isEditing]);
  
  // Handle click outside menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle mode change
  const handleModeChange = (modeId: string) => {
    setActiveMode(modeId);
  };
  
  // Handle AI settings
  const handleOpenAiSettings = () => {
    setShowAiSettings(true);
  };
  
  // Handle create mode
  const handleCreateMode = () => {
    // Create a new blank mode and open the customizer
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
    
    setSelectedModeForCustomization(newMode);
    setShowModeCustomizer(true);
  };
  
  // Handle customize mode
  const handleCustomizeMode = (modeId: string) => {
    const mode = modes.find(m => m.id === modeId);
    if (mode) {
      setSelectedModeForCustomization(mode);
      setShowModeCustomizer(true);
    }
  };

  const handleSaveTitle = () => {
    if (handleUpdateTitle && editingTitle.trim()) {
      handleUpdateTitle();
    }
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveTitle();
    } else if (e.key === 'Escape') {
      setEditingTitle(chatTitle);
      setIsEditing(false);
    }
  };

  return (
    <>
      <header className={cn(
        "px-4 py-2 border-b flex items-center justify-between gap-2",
        isSpiralStyle ? "bg-gradient-to-r from-blue-600 to-purple-600 border-blue-700" : "bg-background border-border"
      )}>
        <div className="flex items-center gap-3 flex-1">
          {/* Left side - New Chat Button */}
          <button
            onClick={onNewChat}
            className={cn(
              "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
              isSpiralStyle
                ? "bg-white/20 text-white hover:bg-white/30"
                : "bg-accent/20 text-foreground hover:bg-accent/40"
            )}
            aria-label="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>
          
          {/* Center - Chat Title with Edit functionality */}
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleUpdateTitle();
              }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  className={cn(
                    "w-full px-2 py-1 rounded border focus:outline-none focus:ring-2",
                    isSpiralStyle
                      ? "bg-white/10 border-white/20 text-white focus:ring-amber-400"
                      : "bg-background border-input text-foreground focus:ring-primary"
                  )}
                  onBlur={handleUpdateTitle}
                  autoFocus
                />
              </form>
            ) : (
              <div className="flex items-center">
                <h1
                  className={cn(
                    "font-medium truncate cursor-pointer",
                    isSpiralStyle ? "text-white" : "text-foreground"
                  )}
                  onClick={() => setIsEditing(true)}
                  title={chatTitle}
                >
                  {chatTitle}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    "ml-1.5 p-1 rounded-full opacity-60 hover:opacity-100",
                    isSpiralStyle ? "text-white" : "text-muted-foreground"
                  )}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          
          {/* Right side - Mode selector and more actions */}
          <div className="flex items-center gap-2">
            {/* Mode Selector Dropdown */}
            <ModeDropdown />
            
            {/* More Menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center transition-colors",
                  isSpiralStyle
                    ? "bg-white/20 text-white hover:bg-white/30"
                    : "bg-accent/20 text-foreground hover:bg-accent/40"
                )}
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              {showMenu && (
                <div className={cn(
                  "absolute z-50 right-0 mt-1 w-48 rounded-md shadow-lg overflow-hidden",
                  isSpiralStyle
                    ? "bg-white dark:bg-slate-900 border border-amber-400"
                    : "bg-background border border-border"
                )}>
                  <div className="py-1">
                    {/* Clear chat button */}
                    <button
                      onClick={() => {
                        onClearChat();
                        setShowMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center px-4 py-2 text-sm",
                        isSpiralStyle
                          ? "text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      <span>Clear Chat</span>
                    </button>
                    
                    {/* Save chat button */}
                    <button
                      onClick={() => {
                        onSaveChat();
                        setShowMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center px-4 py-2 text-sm",
                        isSpiralStyle
                          ? "text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      {isSaved ? (
                        <>
                          <Trash className="h-4 w-4 mr-2" />
                          <span>Unsave Chat</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          <span>Save Chat</span>
                        </>
                      )}
                    </button>
                    
                    {/* Pin chat button */}
                    <button
                      onClick={() => {
                        onPinChat();
                        setShowMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center px-4 py-2 text-sm",
                        isSpiralStyle
                          ? "text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      {isPinned ? (
                        <>
                          <PinOff className="h-4 w-4 mr-2" />
                          <span>Unpin Chat</span>
                        </>
                      ) : (
                        <>
                          <Pin className="h-4 w-4 mr-2" />
                          <span>Pin Chat</span>
                        </>
                      )}
                    </button>
                    
                    {/* ExhibitExporterButton */}
                    <div className="ml-1">
                      <ExhibitExporterButton />
                    </div>
                    
                    {/* Export chat button */}
                    <button
                      onClick={() => {
                        onShowExport();
                        setShowMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center px-4 py-2 text-sm",
                        isSpiralStyle
                          ? "text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      <span>Export Chat</span>
                    </button>
                    
                    {/* Settings button */}
                    <button
                      onClick={() => {
                        onShowSettings();
                        setShowMenu(false);
                      }}
                      className={cn(
                        "w-full flex items-center px-4 py-2 text-sm",
                        isSpiralStyle
                          ? "text-foreground hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          : "text-foreground hover:bg-accent/50"
                      )}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Modal for AI Settings */}
      {showAiSettings && (
        <Suspense fallback={<div className="p-4 text-center">Loading settings...</div>}>
          <AiSettings isOpen={showAiSettings} onClose={() => setShowAiSettings(false)} />
        </Suspense>
      )}
      
      {/* Modal for Mode Customization */}
      {showModeCustomizer && selectedModeForCustomization && (
        <Suspense fallback={<div className="p-4 text-center">Loading mode customizer...</div>}>
          <ModeCustomizer
            mode={selectedModeForCustomization}
            onClose={() => {
              setShowModeCustomizer(false);
              setSelectedModeForCustomization(null);
            }}
          />
        </Suspense>
      )}
    </>
  );
} 