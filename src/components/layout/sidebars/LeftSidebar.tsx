import React, { useEffect, useState } from 'react';
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
  Settings
} from 'lucide-react';
import { useChatStore } from '@/stores/chat/chatStore';
import { format, isValid } from 'date-fns';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onShowThemeControls: () => void;
  showThemeControls: boolean;
  className?: string;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onShowThemeControls,
  showThemeControls,
  className
}) => {
  const { chats, activeChat, createChat, setActiveChat, clearAllChats } = useChatStore();
  const [recentChats, setRecentChats] = useState<Array<{
    id: string;
    title: string;
    lastMessage?: string;
    timestamp: Date;
  }>>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

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
        timestamp: getTimestamp(chat)
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    setRecentChats(formatted);
  }, [chats]);

  // Filter chats based on search query
  const filteredChats = searchQuery 
    ? recentChats.filter(chat => 
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : recentChats.slice(0, 10); // Show only 10 most recent chats if not searching

  // Helper function to safely get timestamp
  const getTimestamp = (chat: any): Date => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage?.timestamp) {
      const timestamp = new Date(lastMessage.timestamp);
      return isValid(timestamp) ? timestamp : new Date();
    }
    return new Date();
  };

  // Helper function to format date
  const formatDate = (date: Date): string => {
    return isValid(date) ? format(date, 'MMM d, h:mm a') : '';
  };

  // Handle clearing all chats
  const handleClearHistory = () => {
    clearAllChats();
    setShowClearConfirm(false);
  };

  return (
    <div
      className={cn(
        "h-full bg-sidebar border-r border-border flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[60px]" : "w-[240px]",
        className
      )}
    >
      {/* Collapse toggle button */}
      <div className="flex items-center justify-between p-2 border-b border-border">
        {!isCollapsed && (
          <Button
            className="flex items-center gap-1 text-xs h-7 bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-md"
            onClick={() => createChat()}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Chat</span>
          </Button>
        )}
        {isCollapsed && (
          <Button
            className="flex items-center justify-center h-7 w-7 bg-primary/10 hover:bg-primary/20 text-primary rounded-full"
            onClick={() => createChat()}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full"
          onClick={onToggleCollapse}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Search bar - only show when not collapsed */}
      {!isCollapsed && (
        <div className="px-3 pt-2 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats"
              className="w-full pl-8 pr-8 py-1.5 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* History section */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-2 border-t border-border mt-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Clock className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Recent Chats</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-muted-foreground hover:text-foreground"
              onClick={() => setShowClearConfirm(true)}
            >
              <Eraser className="h-3.5 w-3.5" />
            </Button>
          </div>
          
          {/* Clear confirmation dialog */}
          {showClearConfirm && (
            <div className="mb-3 p-2 bg-destructive/10 rounded-md text-destructive">
              <p className="text-xs mb-2">Clear all chats?</p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={handleClearHistory}
                >
                  Clear
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Chat list */}
      <div className={cn(
        "flex-grow overflow-y-auto scrollbar-thin",
        isCollapsed ? "px-2" : "px-3"
      )}>
        {filteredChats.length > 0 ? (
          <div className="space-y-1 py-1">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "w-full text-left transition-colors rounded-md",
                  isCollapsed 
                    ? "p-2 flex justify-center"
                    : "p-2 hover:bg-muted",
                  activeChat === chat.id && "bg-muted"
                )}
              >
                {isCollapsed ? (
                  <MessageSquare className="h-4 w-4 text-primary" />
                ) : (
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-medium truncate">{chat.title}</h4>
                    </div>
                    <div className="text-[10px] text-muted-foreground/70 mt-1">
                      {formatDate(chat.timestamp)}
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          !isCollapsed && (
            <div className="flex flex-col items-center justify-center h-20 text-center p-4">
              <p className="text-xs text-muted-foreground">
                {searchQuery ? "No matching chats found" : "No recent chats"}
              </p>
            </div>
          )
        )}
      </div>
      
      {/* Settings and Options Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-border">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
              onClick={onShowThemeControls}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar; 