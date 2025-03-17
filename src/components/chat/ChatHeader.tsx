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
  Loader2
} from 'lucide-react';
import { useChatStore } from '@/stores/chat/chatStore';
import { useModeStore, type AssistantMode } from '@/stores/model/modeStore';
import ModeDropdown from './ModeDropdown';

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
      <div className={cn(
        "flex items-center justify-between w-full py-2 px-4 border-b",
        isSpiralStyle ? "bg-blue-900 text-white border-amber-400" : 
        "bg-background border-border"
      )}>
        {/* Left side with new chat button and title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNewChat}
            className={cn(
              "flex items-center justify-center p-2 rounded-full",
              isSpiralStyle 
                ? "text-amber-400 hover:bg-blue-800" 
                : "text-muted-foreground hover:bg-accent/10"
            )}
            title="New Chat"
          >
            <Plus className="h-5 w-5" />
          </button>

          <div className="flex items-center">
            {isEditing ? (
              <div className="flex items-center bg-muted/50 rounded-lg px-2">
                <input
                  ref={inputRef}
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "bg-transparent border-none focus:outline-none py-1 text-sm font-medium",
                    isSpiralStyle 
                      ? "bg-blue-800 border-amber-400 text-white focus:outline-none focus:ring-1 focus:ring-amber-400" 
                      : "bg-background border-input focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  )}
                  placeholder="Chat title"
                />
                <button
                  onClick={handleSaveTitle}
                  className={cn(
                    "p-1 text-green-500 hover:text-green-600",
                    isSpiralStyle 
                      ? "text-green-400 hover:bg-blue-800" 
                      : "text-green-600 hover:bg-accent/10"
                  )}
                >
                  <CheckCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingTitle(chatTitle);
                    setIsEditing(false);
                  }}
                  className={cn(
                    "p-1 text-red-500 hover:text-red-600",
                    isSpiralStyle 
                      ? "text-amber-400 hover:bg-blue-800" 
                      : "text-muted-foreground hover:bg-accent/10"
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center">
                <h2 
                  className={cn(
                    "text-lg font-semibold mr-2",
                    isSpiralStyle ? "text-white" : "text-foreground"
                  )}
                  onClick={() => setIsEditing(true)}
                  style={{ cursor: 'pointer' }}
                >
                  {chatTitle || 'New Chat'}
                </h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className={cn(
                    "p-1 rounded opacity-60 hover:opacity-100",
                    isSpiralStyle 
                      ? "text-amber-400 hover:bg-blue-800" 
                      : "text-muted-foreground hover:bg-accent/10"
                  )}
                  title="Edit title"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right side with mode dropdown and menu */}
        <div className="flex items-center gap-3">
          <ModeDropdown 
            onSelect={handleModeChange} 
            onOpenSettings={handleOpenAiSettings}
            onCreateMode={handleCreateMode}
            onCustomizeMode={handleCustomizeMode}
          />

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={cn(
                "p-2 rounded-full",
                isSpiralStyle 
                  ? "text-amber-400 hover:bg-blue-800" 
                  : "text-muted-foreground hover:bg-accent/10"
              )}
              title="More options"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {showMenu && (
              <div className={cn(
                "absolute right-0 mt-1 w-48 rounded-md shadow-lg z-10",
                isSpiralStyle 
                  ? "bg-white dark:bg-slate-900 border border-amber-400" 
                  : "bg-background border border-border"
              )}>
                <div className="py-1">
                  <button
                    onClick={() => {
                      onSaveChat();
                      setShowMenu(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm w-full text-left",
                      isSpiralStyle 
                        ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-900 dark:text-amber-400" 
                        : "hover:bg-accent/10 text-foreground"
                    )}
                  >
                    {isSaved ? (
                      <>
                        <Trash className="h-4 w-4" />
                        <span>Remove from Saved</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        <span>Save Chat</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onPinChat();
                      setShowMenu(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm w-full text-left",
                      isSpiralStyle 
                        ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-900 dark:text-amber-400" 
                        : "hover:bg-accent/10 text-foreground"
                    )}
                  >
                    {isPinned ? (
                      <>
                        <PinOff className="h-4 w-4" />
                        <span>Unpin Chat</span>
                      </>
                    ) : (
                      <>
                        <Pin className="h-4 w-4" />
                        <span>Pin Chat</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onShowExport();
                      setShowMenu(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm w-full text-left",
                      isSpiralStyle 
                        ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-900 dark:text-amber-400" 
                        : "hover:bg-accent/10 text-foreground"
                    )}
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Chat</span>
                  </button>

                  <button
                    onClick={() => {
                      onShowSettings();
                      setShowMenu(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm w-full text-left",
                      isSpiralStyle 
                        ? "hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-900 dark:text-amber-400" 
                        : "hover:bg-accent/10 text-foreground"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span>AI Settings</span>
                  </button>

                  <div className="border-t border-border my-1"></div>

                  <button
                    onClick={() => {
                      onClearChat();
                      setShowMenu(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 text-sm w-full text-left",
                      isSpiralStyle 
                        ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400" 
                        : "hover:bg-red-100/10 text-red-600"
                    )}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Clear Chat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Suspense fallback={
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        {showAiSettings && (
          <AiSettings 
            isOpen={showAiSettings} 
            onClose={() => setShowAiSettings(false)} 
          />
        )}
        
        {showModeCustomizer && selectedModeForCustomization && (
          <ModeCustomizer 
            mode={selectedModeForCustomization} 
            onClose={() => {
              setShowModeCustomizer(false);
              setSelectedModeForCustomization(null);
            }} 
          />
        )}
      </Suspense>
    </>
  );
} 