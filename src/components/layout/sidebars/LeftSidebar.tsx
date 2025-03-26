import React, { useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MessageSquare,
  Clock,
  Search,
  X,
  Eraser,
  Settings,
  Star,
  Folder,
  Tags,
  Sparkles,
  BookOpen,
  PanelRight,
  FileText,
  Filter,
  Upload
} from 'lucide-react';
import { useChatStore } from '@/stores/chat/chatStore';
import { format, isValid } from 'date-fns';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// Tab types for left sidebar
type LeftSidebarTab = 'chats' | 'favorites' | 'categories' | 'files';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onShowThemeControls: () => void;
  showThemeControls: boolean;
  className?: string;
  activeTab?: LeftSidebarTab;
  onTabChange?: (tab: LeftSidebarTab) => void;
}

// Create a component for the chat item to avoid duplication
const ChatItem = ({ 
  chat, 
  isActive, 
  onClick, 
  isCollapsed, 
  onFavorite, 
  isFavorite 
}: { 
  chat: any, 
  isActive: boolean, 
  onClick: () => void, 
  isCollapsed: boolean,
  onFavorite?: () => void,
  isFavorite?: boolean
}) => {
  const formatDate = (date: Date): string => {
    return isValid(date) ? format(date, 'MMM d, h:mm a') : '';
  };

  return (
    <div 
      className={cn(
        "group w-full text-left transition-colors rounded-md",
        isCollapsed 
          ? "p-2 flex justify-center"
          : "p-2 hover:bg-muted",
        isActive && "bg-muted"
      )}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center"
      >
        {isCollapsed ? (
          <MessageSquare className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
        ) : (
          <div className="w-full flex items-start">
            <MessageSquare className={cn("h-4 w-4 mt-0.5 mr-2", isActive ? "text-primary" : "text-muted-foreground")} />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium truncate">{chat.title}</h4>
                {!isCollapsed && onFavorite && (
                  <div
                    className={cn(
                      "h-6 w-6 p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full hover:bg-muted/80 cursor-pointer",
                      isFavorite && "opacity-100"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFavorite();
                    }}
                  >
                    <Star
                      className={cn(
                        "h-4 w-4",
                        isFavorite ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                      )}
                    />
                  </div>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground/70 mt-1">
                {formatDate(chat.timestamp)}
              </div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
};

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onShowThemeControls,
  showThemeControls,
  className,
  activeTab: externalActiveTab,
  onTabChange
}) => {
  const { chats, activeChat, createChat, setActiveChat, clearAllChats } = useChatStore();
  const [recentChats, setRecentChats] = useState<Array<{
    id: string;
    title: string;
    lastMessage?: string;
    timestamp: Date;
    category?: string;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Update the internal state to use the external one if provided
  const [internalActiveTab, setInternalActiveTab] = useState<LeftSidebarTab>('chats');
  
  // Determine which activeTab to use
  const activeTab = externalActiveTab || internalActiveTab;
  
  // New states for additional features
  const [favoriteChats, setFavoriteChats] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>(['Work', 'Personal', 'Research', 'Ideas']);
  const [chatCategories, setChatCategories] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Array<{
    id: string;
    name: string;
    type: string;
    size: string;
    dateAdded: Date;
  }>>([
    {
      id: '1',
      name: 'Research Paper.pdf',
      type: 'PDF',
      size: '2.4 MB',
      dateAdded: new Date()
    },
    {
      id: '2',
      name: 'Project Notes.docx',
      type: 'Word',
      size: '1.2 MB',
      dateAdded: new Date()
    }
  ]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Format the recent chats
  useEffect(() => {
    if (!chats || chats.length === 0) return;

    const formatted = chats
      .map(chat => ({
        id: chat.id,
        title: chat.title || 'Untitled Chat',
        lastMessage: chat.messages.length > 0 
          ? chat.messages[chat.messages.length - 1]?.content?.slice(0, 40) + '...'
          : undefined,
        timestamp: getTimestamp(chat),
        category: chatCategories[chat.id] || 'Uncategorized'
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setRecentChats(formatted);
  }, [chats, chatCategories]);

  // Filter chats based on search query and active tab
  const filteredChats = useCallback(() => {
    let filtered = searchQuery 
      ? recentChats.filter(chat => 
          chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
      : recentChats;
    
    if (activeTab === 'favorites') {
      return filtered.filter(chat => favoriteChats.includes(chat.id));
    } else if (activeTab === 'categories') {
      // When searching in categories tab, show all matched
      if (searchQuery) return filtered;
      
      // Group chats by category
      const groupedChats: Record<string, typeof filtered> = {};
      filtered.forEach(chat => {
        const category = chat.category || 'Uncategorized';
        if (!groupedChats[category]) {
          groupedChats[category] = [];
        }
        groupedChats[category].push(chat);
      });
      
      // Return first few chats from each category
      return Object.entries(groupedChats).flatMap(([category, chats]) => 
        chats.slice(0, 5)
      );
    }
    
    return filtered.slice(0, 20); // Show only 20 most recent chats in the main view
  }, [searchQuery, recentChats, activeTab, favoriteChats]);

  // Helper function to safely get timestamp
  const getTimestamp = (chat: any): Date => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage?.timestamp) {
      const timestamp = new Date(lastMessage.timestamp);
      return isValid(timestamp) ? timestamp : new Date();
    }
    return new Date();
  };

  // Handle clearing all chats
  const handleClearHistory = () => {
    clearAllChats();
    setShowClearConfirm(false);
    // Also clear favorites when clearing history
    setFavoriteChats([]);
    setChatCategories({});
  };

  // Toggle favorite status
  const toggleFavorite = useCallback((chatId: string) => {
    setFavoriteChats(prev => 
      prev.includes(chatId)
        ? prev.filter(id => id !== chatId)
        : [...prev, chatId]
    );
  }, []);

  // Set category for a chat
  const setChatCategory = useCallback((chatId: string, category: string) => {
    setChatCategories(prev => ({
      ...prev,
      [chatId]: category
    }));
  }, []);

  // Update the handleTabChange function to use the callback prop
  const handleTabChange = useCallback((tab: LeftSidebarTab) => {
    if (onTabChange) {
      onTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
    
    // Focus search input when switching to chats tab
    if (tab === 'chats' && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [onTabChange]);

  // Render category section
  const renderCategorySection = useCallback(() => {
    // Group chats by category
    const groupedChats: Record<string, typeof recentChats> = {};
    recentChats.forEach(chat => {
      const category = chat.category || 'Uncategorized';
      if (!groupedChats[category]) {
        groupedChats[category] = [];
      }
      groupedChats[category].push(chat);
    });
    
    return (
      <div className="space-y-2">
        {Object.entries(groupedChats).map(([category, chats]) => (
          <div key={category} className="mb-4">
            <div className="flex items-center text-xs font-medium text-muted-foreground mb-1 px-2">
              <Folder className="h-3.5 w-3.5 mr-1" />
              {category} ({chats.length})
            </div>
            <div className="space-y-1">
              {chats.slice(0, 5).map(chat => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChat === chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  isCollapsed={isCollapsed}
                  onFavorite={() => toggleFavorite(chat.id)}
                  isFavorite={favoriteChats.includes(chat.id)}
                />
              ))}
              {chats.length > 5 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                >
                  Show {chats.length - 5} more...
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }, [recentChats, activeChat, isCollapsed, favoriteChats, toggleFavorite, setActiveChat]);

  // Render files section
  const renderFilesSection = useCallback(() => {
    return (
      <div className="space-y-2">
        {files.map(file => (
          <div
            key={file.id}
            className="flex items-start p-2 hover:bg-muted rounded-md"
          >
            <FileText className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{file.name}</h4>
              <div className="flex items-center text-[10px] text-muted-foreground/70">
                <span>{file.type}</span>
                <span className="mx-1">•</span>
                <span>{file.size}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }, [files]);

  return (
    <div
      className={cn(
        "h-full flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[240px]",
        "bevel-glass shadow-3d relative z-10",
        className
      )}
    >
      {/* Add accent line */}
      <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-primary/5 via-primary/30 to-primary/5"></div>
      
      {/* Header with collapse toggle - use bevel-neumorphic class for buttons */}
      <div className="flex items-center justify-between p-2 border-b border-border/40 shadow-sm bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm">
        {!isCollapsed && (
          <Button
            className={cn(
              "flex items-center gap-1 text-xs h-7 bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-md",
              "bevel-neumorphic shadow-directional"
            )}
            onClick={() => createChat()}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </Button>
        )}
        {isCollapsed && (
          <Button
            className={cn(
              "flex items-center justify-center h-7 w-7 bg-primary/10 hover:bg-primary/20 text-primary rounded-full",
              "bevel-neumorphic shadow-directional"
            )}
            onClick={() => createChat()}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-full backdrop-blur-sm",
            "bevel-edge inner-shadow"
          )}
          onClick={onToggleCollapse}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Tab navigation - use accent-border for active tab */}
      {!isCollapsed && (
        <div className="flex border-b border-border/40 backdrop-blur-sm">
          <Button
            variant="ghost"
            className={cn(
              "flex-1 h-8 text-xs rounded-none bevel-edge",
              activeTab === 'chats' && "border-b-2 border-primary font-medium accent-border"
            )}
            onClick={() => handleTabChange('chats')}
          >
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Chats
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "flex-1 h-8 text-xs rounded-none bevel-edge",
              activeTab === 'favorites' && "border-b-2 border-primary font-medium accent-border"
            )}
            onClick={() => handleTabChange('favorites')}
          >
            <Star className="h-3.5 w-3.5 mr-1" />
            Favorites
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "flex-1 h-8 text-xs rounded-none bevel-edge",
              activeTab === 'categories' && "border-b-2 border-primary font-medium accent-border"
            )}
            onClick={() => handleTabChange('categories')}
          >
            <Folder className="h-3.5 w-3.5 mr-1" />
            Categories
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "flex-1 h-8 text-xs rounded-none bevel-edge",
              activeTab === 'files' && "border-b-2 border-primary font-medium accent-border"
            )}
            onClick={() => handleTabChange('files')}
          >
            <FileText className="h-3.5 w-3.5 mr-1" />
            Files
          </Button>
        </div>
      )}
      
      {/* Search bar - add inner shadow effect */}
      {!isCollapsed && (
        <div className="px-3 pt-2 pb-2 bg-gradient-to-b from-background/30 to-background/10 backdrop-blur-sm">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className={cn(
                "w-full pl-8 pr-8 py-1.5 text-sm border border-border/50 rounded-md",
                "bg-background/30 backdrop-blur-sm inner-shadow",
                "focus:outline-none focus:ring-1 focus:ring-primary/70 focus:border-primary/50",
                "transition-all duration-200"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:bg-muted/30 backdrop-blur-sm"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Content header - add light-source effect for icons */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-2 border-t border-border/40 mt-1 backdrop-blur-sm bg-gradient-to-b from-background/20 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {activeTab === 'chats' && (
                <>
                  <div className="light-source">
                    <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Recent Chats</span>
                </>
              )}
              {activeTab === 'favorites' && (
                <>
                  <div className="light-source">
                    <Star className="h-3.5 w-3.5 mr-2 text-yellow-400" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Favorite Chats</span>
                </>
              )}
              {activeTab === 'categories' && (
                <>
                  <div className="light-source">
                    <Folder className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Categories</span>
                </>
              )}
              {activeTab === 'files' && (
                <>
                  <div className="light-source">
                    <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">Your Files</span>
                </>
              )}
            </div>
            
            {/* Action buttons with bevel effect */}
            {activeTab === 'chats' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground bevel-edge shadow-subtle"
                onClick={() => setShowClearConfirm(true)}
              >
                <Eraser className="h-3.5 w-3.5" />
              </Button>
            )}
            {activeTab === 'favorites' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground bevel-edge shadow-subtle"
              >
                <Filter className="h-3.5 w-3.5" />
              </Button>
            )}
            {activeTab === 'categories' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground bevel-edge shadow-subtle"
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            )}
            {activeTab === 'files' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-foreground bevel-edge shadow-subtle"
              >
                <Upload className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          
          {/* Clear confirmation dialog - use bevel-glass for alert box */}
          {showClearConfirm && (
            <div className="mb-3 p-2 bg-destructive/10 rounded-md text-destructive bevel-glass shadow-3d">
              <p className="text-xs mb-2">Clear all chats?</p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs shadow-directional"
                  onClick={handleClearHistory}
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bevel-edge shadow-subtle"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Content area - add subtle backdrop blur */}
      <div className={cn(
        "flex-grow overflow-y-auto scrollbar-thin bg-gradient-to-b from-background/20 via-background/5 to-background/20 backdrop-blur-sm",
        isCollapsed ? "px-2" : "px-3"
      )}>
        {/* Chats Tab */}
        {activeTab === 'chats' && filteredChats().length > 0 ? (
          <div className="space-y-1 py-1">
            {filteredChats().map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={activeChat === chat.id}
                onClick={() => setActiveChat(chat.id)}
                isCollapsed={isCollapsed}
                onFavorite={() => toggleFavorite(chat.id)}
                isFavorite={favoriteChats.includes(chat.id)}
              />
            ))}
          </div>
        ) : activeTab === 'chats' && !isCollapsed ? (
          <div className="flex flex-col items-center justify-center h-20 text-center p-4">
            <p className="text-xs text-muted-foreground">
              {searchQuery ? "No matching chats found" : "No recent chats"}
            </p>
          </div>
        ) : null}
        
        {/* Favorites Tab */}
        {activeTab === 'favorites' && !isCollapsed && (
          <>
            {filteredChats().length > 0 ? (
              <div className="space-y-1 py-1">
                {filteredChats().map((chat) => (
                  <ChatItem
                    key={chat.id}
                    chat={chat}
                    isActive={activeChat === chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    isCollapsed={isCollapsed}
                    onFavorite={() => toggleFavorite(chat.id)}
                    isFavorite={true}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center p-4">
                <Star className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                <p className="text-xs text-muted-foreground mb-2">
                  No favorite chats yet
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Star your chats to add them to favorites
                </p>
              </div>
            )}
          </>
        )}
        
        {/* Categories Tab */}
        {activeTab === 'categories' && !isCollapsed && renderCategorySection()}
        
        {/* Files Tab */}
        {activeTab === 'files' && !isCollapsed && renderFilesSection()}
      </div>
      
      {/* Settings and Options Footer - use bevel effects */}
      {!isCollapsed && (
        <div className="p-3 border-t border-border/40 backdrop-blur-sm bg-gradient-to-t from-background/20 to-transparent">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground bevel-neumorphic"
              onClick={onShowThemeControls}
            >
              <Settings className="h-4 w-4" />
            </Button>
            <div className="flex space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground bevel-neumorphic bevel-glass-shimmer"
                    >
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bevel-glass shadow-3d">Research Panel</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground bevel-neumorphic bevel-glass-shimmer"
                    >
                      <Sparkles className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bevel-glass shadow-3d">AI Assistant</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground bevel-neumorphic bevel-glass-shimmer"
                    >
                      <PanelRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bevel-glass shadow-3d">Toggle Right Sidebar</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar; 