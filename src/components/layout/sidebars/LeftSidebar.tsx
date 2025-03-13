import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  History,
  MessageSquare,
  Plus,
  Folder,
  Star,
  Trash2,
  Bot,
  PlusCircle,
  LogOut,
  Pin,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Eraser
} from 'lucide-react';
import { useChatStore } from '@/stores/chat/chatStore';
import { format, isValid } from 'date-fns';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

interface ChatGroup {
  title: string;
  chats: Array<{
    id: string;
    title: string;
    lastMessage?: string;
    timestamp: Date;
    isPinned?: boolean;
    isSaved?: boolean;
  }>;
  isCollapsed?: boolean;
}

const LeftSidebar: React.FC<LeftSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  className
}) => {
  const { 
    chats, 
    activeChat, 
    savedChats, 
    pinnedChats, 
    createChat, 
    setActiveChat,
    showClearConfirm,
    setShowClearConfirm,
    handleClearChat,
    deleteChat,
    updateChatTitle,
    clearAllChats
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([
    { title: 'Pinned', chats: [], isCollapsed: false },
    { title: 'Saved', chats: [], isCollapsed: false },
    { title: 'Recent', chats: [], isCollapsed: false }
  ]);

  // Helper function to safely get timestamp
  const getTimestamp = (chat: any): Date => {
    const lastMessage = chat.messages[chat.messages.length - 1];
    if (lastMessage?.timestamp) {
      const timestamp = new Date(lastMessage.timestamp);
      return isValid(timestamp) ? timestamp : new Date();
    }
    return new Date();
  };

  // Update chat groups when chats change
  React.useEffect(() => {
    const pinnedGroup = chats
      .filter(chat => pinnedChats.includes(chat.id))
      .map(chat => ({
        id: chat.id,
        title: chat.title || 'Untitled Chat',
        lastMessage: chat.messages[chat.messages.length - 1]?.content.slice(0, 50) + '...',
        timestamp: getTimestamp(chat),
        isPinned: true
      }));

    const savedGroup = chats
      .filter(chat => savedChats.includes(chat.id) && !pinnedChats.includes(chat.id))
      .map(chat => ({
        id: chat.id,
        title: chat.title || 'Untitled Chat',
        lastMessage: chat.messages[chat.messages.length - 1]?.content.slice(0, 50) + '...',
        timestamp: getTimestamp(chat),
        isSaved: true
      }));

    const recentGroup = chats
      .filter(chat => !savedChats.includes(chat.id) && !pinnedChats.includes(chat.id))
      .sort((a, b) => {
        const aTime = getTimestamp(a);
        const bTime = getTimestamp(b);
        return bTime.getTime() - aTime.getTime();
      })
      .slice(0, 10)
      .map(chat => ({
        id: chat.id,
        title: chat.title || 'Untitled Chat',
        lastMessage: chat.messages[chat.messages.length - 1]?.content.slice(0, 50) + '...',
        timestamp: getTimestamp(chat)
      }));

    setChatGroups([
      { title: 'Pinned', chats: pinnedGroup, isCollapsed: false },
      { title: 'Saved', chats: savedGroup, isCollapsed: false },
      { title: 'Recent', chats: recentGroup, isCollapsed: false }
    ]);
  }, [chats, pinnedChats, savedChats]);

  const toggleGroupCollapse = (index: number) => {
    setChatGroups(prev => prev.map((group, i) => 
      i === index ? { ...group, isCollapsed: !group.isCollapsed } : group
    ));
  };

  const filteredGroups = chatGroups.map(group => ({
    ...group,
    chats: group.chats.filter(chat => 
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  })).filter(group => group.chats.length > 0);

  // Helper function to safely format date
  const formatDate = (date: Date) => {
    try {
      return isValid(date) ? format(date, 'MMM d, h:mm a') : '';
    } catch (error) {
      return '';
    }
  };

  const handleClearHistory = () => {
    clearAllChats();
    setShowClearHistoryConfirm(false);
  };

  return (
    <div className={cn(
      "flex flex-col h-full",
      "bg-[--md-sys-color-surface]/98",
      "border-r border-[--md-sys-color-outline-variant]",
      "shadow-lg",
      "transition-all duration-300 ease-in-out",
      className
    )}
    style={{
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      boxShadow: '4px 0 24px rgba(0, 0, 0, 0.14)'
    }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[--md-sys-color-outline-variant]">
        <div className={cn(
          "flex items-center gap-3 group cursor-pointer",
          isCollapsed && "hidden"
        )}>
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-80 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300"></div>
            <div className="relative bg-white dark:bg-gray-900 p-2 rounded-full border border-blue-300 dark:border-blue-800 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <Bot className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <span className="font-bold text-[--md-sys-color-on-surface] tracking-tight group-hover:text-[--md-sys-color-primary] transition-colors duration-300">GenieAgent</span>
        </div>
        <button
          onClick={onToggleCollapse}
          className={cn(
            "p-2 rounded-full",
            "bg-[--md-sys-color-surface-variant]/70",
            "border border-[--md-sys-color-outline-variant]",
            "hover:bg-[--md-sys-color-surface-variant] hover:border-[--md-sys-color-outline]",
            "hover:shadow-xl active:scale-95",
            "transform-gpu hover:-translate-y-1",
            "transition-all duration-300 ease-in-out",
            "text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-on-surface]"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 transition-transform duration-300 hover:translate-x-0.5" />
          ) : (
            <ChevronLeft className="h-4 w-4 transition-transform duration-300 hover:-translate-x-0.5" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-[--md-sys-color-outline-variant]">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[--md-sys-color-on-surface-variant] group-hover:text-[--md-sys-color-primary] transition-colors duration-300" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[--md-sys-color-surface-variant]/80 border border-[--md-sys-color-outline-variant] text-sm text-[--md-sys-color-on-surface] placeholder:text-[--md-sys-color-on-surface-variant]/70 focus:outline-none focus:ring-2 focus:ring-[--md-sys-color-primary]/30 focus:border-[--md-sys-color-primary]/40 hover:bg-[--md-sys-color-surface-variant] hover:border-[--md-sys-color-outline] hover:shadow-lg transform-gpu hover:-translate-y-1 transition-all duration-300 ease-in-out"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-[--md-sys-color-surface] text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-primary] transition-all duration-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-[--md-sys-color-outline-variant] scrollbar-track-transparent hover:scrollbar-thumb-[--md-sys-color-primary]/40 transition-colors duration-300">
        {/* New Chat Button */}
        <button
          onClick={() => createChat()}
          className={cn(
            "flex items-center gap-2 w-full px-4 py-2.5 rounded-full",
            "bg-[--md-sys-color-primary-container]/90 text-[--md-sys-color-on-primary-container]",
            "border border-[--md-sys-color-primary]/20",
            "hover:bg-[--md-sys-color-primary-container] hover:border-[--md-sys-color-primary]/40 hover:shadow-xl",
            "active:scale-95",
            "transform-gpu hover:-translate-y-1",
            "transition-all duration-300 ease-in-out",
            "font-medium"
          )}
        >
          <div className="relative">
            <div className="absolute -inset-1.5 bg-[--md-sys-color-primary]/40 rounded-full opacity-80 blur-md"></div>
            <PlusCircle className="h-5 w-5 relative" />
          </div>
          {!isCollapsed && <span>New Chat</span>}
        </button>

        {/* Chat Groups */}
        {filteredGroups.map((group, groupIndex) => (
          <div key={group.title} className="space-y-2">
            {/* Group Header */}
            {!isCollapsed && (
              <button
                onClick={() => toggleGroupCollapse(groupIndex)}
                className="flex items-center justify-between w-full px-3 py-1.5 text-sm font-medium text-[--md-sys-color-on-surface-variant] hover:bg-[--md-sys-color-surface-variant]/80 hover:text-[--md-sys-color-on-surface] rounded-lg transition-all duration-300 ease-in-out group"
              >
                <span className="uppercase tracking-wider text-xs opacity-90 group-hover:opacity-100 font-bold">
                  {group.title}
                  {group.chats.length > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 text-[10px] rounded-full bg-[--md-sys-color-surface-variant] group-hover:bg-[--md-sys-color-primary-container] transition-colors duration-300">
                      {group.chats.length}
                    </span>
                  )}
                </span>
                {group.isCollapsed ? (
                  <ChevronDown className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100 transition-transform duration-300 group-hover:translate-y-0.5" />
                ) : (
                  <ChevronUp className="h-3.5 w-3.5 opacity-80 group-hover:opacity-100 transition-transform duration-300 group-hover:-translate-y-0.5" />
                )}
              </button>
            )}

            {/* Chat Items */}
            {!group.isCollapsed && (
              <div className="space-y-2">
                {group.chats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChat(chat.id)}
                    className={cn(
                      "flex items-start gap-3 w-full p-3 rounded-lg text-left",
                      "border border-transparent",
                      "hover:bg-[--md-sys-color-surface-variant] hover:border-[--md-sys-color-outline]",
                      "transform-gpu hover:-translate-y-1 hover:shadow-lg",
                      "transition-all duration-300 ease-in-out",
                      activeChat === chat.id && "bg-[--md-sys-color-surface-variant] border-[--md-sys-color-outline] shadow-lg"
                    )}
                  >
                    <div className={cn(
                      "relative shrink-0 mt-0.5 transition-transform duration-300 group-hover:scale-110",
                      activeChat === chat.id ? "text-[--md-sys-color-primary]" : "text-[--md-sys-color-on-surface-variant] group-hover:text-[--md-sys-color-primary]"
                    )}>
                      <MessageSquare className="h-5 w-5 transition-colors duration-300" />
                      {(chat.isPinned || chat.isSaved) && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[--md-sys-color-primary] rounded-full animate-pulse"></div>
                      )}
                    </div>
                    {!isCollapsed && (
                      <div className="min-w-0 flex-1 group">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "font-medium text-sm truncate transition-colors duration-300",
                            activeChat === chat.id ? "text-[--md-sys-color-on-surface]" : "text-[--md-sys-color-on-surface-variant] group-hover:text-[--md-sys-color-on-surface]"
                          )}>
                            {chat.title}
                          </span>
                          <div className="flex items-center gap-1.5 ml-2">
                            {chat.isPinned && (
                              <Pin className="h-3 w-3 text-[--md-sys-color-primary] transition-transform duration-300 group-hover:rotate-12" />
                            )}
                            {chat.isSaved && (
                              <Star className="h-3 w-3 text-[--md-sys-color-primary] transition-transform duration-300 group-hover:scale-110" />
                            )}
                          </div>
                        </div>
                        {chat.lastMessage && (
                          <p className="text-xs text-[--md-sys-color-on-surface-variant]/80 group-hover:text-[--md-sys-color-on-surface-variant] truncate mt-1 transition-colors duration-300">
                            {chat.lastMessage}
                          </p>
                        )}
                        <span className="text-xs text-[--md-sys-color-on-surface-variant]/70 group-hover:text-[--md-sys-color-on-surface-variant]/90 block mt-1.5 transition-colors duration-300">
                          {formatDate(chat.timestamp)}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="shrink-0 p-4 space-y-2 border-t border-[--md-sys-color-outline-variant] bg-[--md-sys-color-surface]/98" style={{ backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}>
        <button
          onClick={() => setShowClearHistoryConfirm(true)}
          className={cn(
            "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg",
            "hover:bg-[--md-sys-color-surface-variant] hover:shadow-lg",
            "transform-gpu hover:-translate-y-1 active:scale-95",
            "transition-all duration-300 ease-in-out",
            "text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-on-surface]",
            "group"
          )}
        >
          <Eraser className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          {!isCollapsed && <span className="font-medium">Clear History</span>}
        </button>
        <button
          className={cn(
            "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg",
            "hover:bg-[--md-sys-color-surface-variant] hover:shadow-lg",
            "transform-gpu hover:-translate-y-1 active:scale-95",
            "transition-all duration-300 ease-in-out",
            "text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-on-surface]",
            "group"
          )}
        >
          <Settings className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </button>
        <button
          className={cn(
            "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg",
            "hover:bg-[--md-sys-color-surface-variant] hover:shadow-lg",
            "transform-gpu hover:-translate-y-1 active:scale-95",
            "transition-all duration-300 ease-in-out",
            "text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-on-surface]",
            "group"
          )}
        >
          <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          {!isCollapsed && <span className="font-medium">Sign Out</span>}
        </button>
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearHistoryConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-[--md-sys-color-surface] border border-[--md-sys-color-outline] rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4 animate-in slide-in-from-bottom-10 duration-300">
            <h3 className="text-lg font-bold text-[--md-sys-color-on-surface]">Clear Chat History</h3>
            <p className="text-sm text-[--md-sys-color-on-surface-variant]">
              Are you sure you want to clear all chat history? This will delete all chats, including pinned and saved ones. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearHistoryConfirm(false)}
                className="px-4 py-2 rounded-lg hover:bg-[--md-sys-color-surface-variant] text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-on-surface] transition-all duration-300 ease-in-out transform-gpu hover:-translate-y-1 hover:shadow-lg active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition-all duration-300 ease-in-out transform-gpu hover:-translate-y-1 hover:shadow-lg active:scale-95"
              >
                Clear All History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Chat Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-[--md-sys-color-surface] border border-[--md-sys-color-outline] rounded-xl shadow-2xl p-6 max-w-md w-full space-y-4 animate-in slide-in-from-bottom-10 duration-300">
            <h3 className="text-lg font-bold text-[--md-sys-color-on-surface]">Clear Chat</h3>
            <p className="text-sm text-[--md-sys-color-on-surface-variant]">
              Are you sure you want to clear this chat? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 rounded-lg hover:bg-[--md-sys-color-surface-variant] text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-on-surface] transition-all duration-300 ease-in-out transform-gpu hover:-translate-y-1 hover:shadow-lg active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleClearChat}
                className="px-4 py-2 rounded-lg bg-red-600/90 text-white hover:bg-red-600 transition-all duration-300 ease-in-out transform-gpu hover:-translate-y-1 hover:shadow-lg active:scale-95"
              >
                Clear Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeftSidebar; 