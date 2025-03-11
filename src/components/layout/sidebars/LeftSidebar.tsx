import React, { useState } from 'react';
import { useThemeStore } from '@stores/theme/themeStore';
import { useModeStore } from '@stores/model/modeStore';
import { useChatStore } from '@stores/chat/chatStore';
import { Bot, Settings, Book, Zap, Plus, MessageSquare, MoreVertical, Pencil, Star, StarOff, Bookmark, Users } from 'lucide-react';
import { cn } from '@utils/cn';

type ViewMode = 'chats' | 'agents';

const LeftSidebar: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const { activeMode, modes, addCustomMode, setActiveMode } = useModeStore();
  const { chats, activeChat, createChat, updateChatTitle, setActiveChat, savedChats, saveChat, unsaveChat } = useChatStore();
  const currentMode = modes.find(m => m.id === activeMode);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('chats');

  const handleNewChat = () => {
    createChat();
  };

  const handleNewAgent = () => {
    const newMode = {
      name: 'New Agent',
      description: 'Custom assistant mode',
      systemPrompt: '',
      temperature: 0.7,
      icon: '🤖',
      category: 'Custom',
      tags: [],
      customInstructions: []
    };
    addCustomMode(newMode);
  };

  const startEditing = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditingTitle(currentTitle);
  };

  const handleRename = (chatId: string) => {
    if (editingTitle.trim()) {
      updateChatTitle(chatId, editingTitle.trim());
    }
    setEditingChatId(null);
    setEditingTitle('');
  };

  const handleKeyPress = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === 'Enter') {
      handleRename(chatId);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
      setEditingTitle('');
    }
  };

  const toggleSave = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (savedChats.includes(chatId)) {
      unsaveChat(chatId);
    } else {
      saveChat(chatId);
    }
  };

  const filteredChats = showSaved ? chats.filter(chat => savedChats.includes(chat.id)) : chats;

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border bg-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* View Toggle */}
        <div className="flex-shrink-0 p-2 border-b border-border">
          <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('chats')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                viewMode === 'chats' ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              Chats
            </button>
            <button
              onClick={() => setViewMode('agents')}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors",
                viewMode === 'agents' ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-4 w-4" />
              Agents
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 p-4 space-y-2 border-b border-border">
          {viewMode === 'chats' ? (
            <>
              <button
                onClick={handleNewChat}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
                  "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                )}
              >
                <Plus className="h-4 w-4" />
                New Chat
              </button>

              <button
                onClick={() => setShowSaved(!showSaved)}
                className={cn(
                  "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
                  "border border-border transition-colors",
                  showSaved 
                    ? "bg-muted text-foreground" 
                    : "bg-background text-muted-foreground hover:text-foreground"
                )}
              >
                <Bookmark className="h-4 w-4" />
                {showSaved ? 'Show All Chats' : 'Show Saved Chats'}
              </button>
            </>
          ) : (
            <button
              onClick={handleNewAgent}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              )}
            >
              <Plus className="h-4 w-4" />
              New Agent
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2 space-y-1">
            {viewMode === 'chats' ? (
              // Chat History
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                    activeChat === chat.id
                      ? "bg-muted/80 text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 flex-shrink-0" />
                  {editingChatId === chat.id ? (
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onBlur={() => handleRename(chat.id)}
                      onKeyDown={(e) => handleKeyPress(e, chat.id)}
                      className="flex-1 bg-transparent border-none focus:outline-none text-sm"
                      autoFocus
                    />
                  ) : (
                    <>
                      <span className="flex-1 text-sm truncate">
                        {chat.title || 'New Chat'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => toggleSave(e, chat.id)}
                          className={cn(
                            "p-1 rounded-md transition-opacity",
                            savedChats.includes(chat.id)
                              ? "text-primary opacity-100"
                              : "opacity-0 group-hover:opacity-100 hover:text-primary"
                          )}
                        >
                          {savedChats.includes(chat.id) ? (
                            <Star className="h-3 w-3 fill-current" />
                          ) : (
                            <StarOff className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(chat.id, chat.title || 'New Chat');
                          }}
                          className={cn(
                            "p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                            "hover:bg-muted-foreground/10"
                          )}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              // Agent List
              modes.map((mode) => (
                <div
                  key={mode.id}
                  className={cn(
                    "group flex items-center gap-2 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                    activeMode === mode.id
                      ? "bg-muted/80 text-foreground"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                  onClick={() => setActiveMode(mode.id)}
                >
                  <Bot className="h-4 w-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {mode.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {mode.category}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Open agent settings
                    }}
                    className={cn(
                      "p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity",
                      "hover:bg-muted-foreground/10"
                    )}
                  >
                    <Settings className="h-3 w-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mode Info - Only show in chat view */}
        {viewMode === 'chats' && (
          <div className="flex-shrink-0 p-4 border-t border-border bg-muted/50">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Bot className="h-4 w-4" />
              <span className="truncate">{currentMode?.name || 'Default Mode'}</span>
            </div>
            {currentMode?.category && (
              <div className="mt-1 text-xs text-muted-foreground">
                {currentMode.category}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

export default LeftSidebar; 