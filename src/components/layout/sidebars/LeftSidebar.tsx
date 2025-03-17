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
  Eraser,
  HelpCircle,
  Home,
  FileText,
  Clock,
  Tag
} from 'lucide-react';
import { useChatStore } from '@/stores/chat/chatStore';
import { format, isValid } from 'date-fns';
import { useThemeStore } from '@/stores/theme/themeStore';
import { type ColorProfile } from '@/config/theme';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onShowThemeControls: () => void;
  showThemeControls: boolean;
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
  onShowThemeControls,
  showThemeControls,
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

  const { profile: themeProfile } = useThemeStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [chatGroups, setChatGroups] = useState<ChatGroup[]>([
    { title: 'Pinned', chats: [], isCollapsed: false },
    { title: 'Saved', chats: [], isCollapsed: false },
    { title: 'Recent', chats: [], isCollapsed: false }
  ]);
  const [mainNavActive, setMainNavActive] = useState('chats');

  // Check if we're using the Office theme profile
  const isOfficeStyle = themeProfile === 'office' as ColorProfile;
  // Check if we're using the Spiral theme profile
  const isSpiralStyle = themeProfile === 'spiral' as ColorProfile;

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
      "flex flex-col h-full w-full overflow-hidden",
      isCollapsed ? "items-center" : "items-stretch",
      isOfficeStyle ? "bg-[#f3f2f1]" : 
      isSpiralStyle ? "bg-[#f5f1e5]" : 
      "bg-gray-50",
      className
    )}>
      {/* Top Section with logo and nav */}
      <div className="flex flex-col flex-shrink-0">
        {/* Logo - show conditionally based on collapse state */}
        {!isCollapsed && (
          <div className="p-4 mb-2 flex items-center gap-3">
            <img 
              src="/imageedit_1_6257830671.png" 
              alt="GenieAgent Logo" 
              className="h-8 w-auto"
              style={{ 
                filter: isSpiralStyle ? 'drop-shadow(0 0 2px rgba(230, 180, 76, 0.5))' : 'none'
              }}
            />
            <span className={cn(
              "font-semibold text-lg",
              isOfficeStyle ? "text-[#0078d4]" : 
              isSpiralStyle ? "text-[#004080]" : 
              "text-gray-700"
            )}>
              GenieAgent
            </span>
          </div>
        )}

        {/* Office Style Navigation Header (When Office Theme is active) */}
        {isOfficeStyle && !isCollapsed && (
          <div className="w-full bg-[#f3f2f1] border-b border-gray-200">
            <div className="flex items-center justify-between px-2 py-1.5">
              {/* Office-style logo */}
              <div className="flex items-center">
                <img src="/imageedit_1_6257830671.png" alt="GenieAgent Logo" className="h-6 w-6 mr-1.5" />
                <span className="font-semibold text-xs text-gray-700 tracking-tight">GenieAgent</span>
              </div>
              
              <button
                onClick={onToggleCollapse}
                className="p-1 rounded-sm text-gray-700 hover:bg-gray-200"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex px-1 pt-1">
              <button
                onClick={() => setMainNavActive('chats')}
                className={cn(
                  "px-2 py-1 text-xs border-b-2 font-medium",
                  mainNavActive === 'chats' 
                    ? "border-[#0078d4] text-[#0078d4]" 
                    : "border-transparent text-gray-600 hover:text-[#0078d4] hover:border-[#0078d4]/30"
                )}
              >
                Chats
              </button>
              <button
                onClick={() => setMainNavActive('documents')}
                className={cn(
                  "px-2 py-1 text-xs border-b-2 font-medium",
                  mainNavActive === 'documents' 
                    ? "border-[#0078d4] text-[#0078d4]" 
                    : "border-transparent text-gray-600 hover:text-[#0078d4] hover:border-[#0078d4]/30"
                )}
              >
                Documents
              </button>
            </div>
          </div>
        )}

        {/* Non-Office Theme Header */}
        {(!isOfficeStyle || isCollapsed) && (
          <div className={cn(
            "flex items-center justify-between p-4",
            isOfficeStyle 
              ? "border-b border-gray-200"
              : "border-b border-[--md-sys-color-outline-variant]"
          )}>
            <div className={cn(
              "flex items-center gap-3 group cursor-pointer",
              isCollapsed && "hidden"
            )}>
              {isOfficeStyle ? (
                /* Office-style logo */
                <div className="flex items-center">
                  <img src="/imageedit_1_6257830671.png" alt="GenieAgent Logo" className="h-6 w-6 mr-1.5" />
                  <span className="font-semibold text-xs text-gray-700 tracking-tight">GenieAgent</span>
                </div>
              ) : (
                /* Default style logo */
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full opacity-80 blur-md group-hover:opacity-100 group-hover:blur-lg transition-all duration-300"></div>
                  <img src="/imageedit_1_6257830671.png" alt="GenieAgent Logo" className="h-8 w-8 relative transition-all duration-300 group-hover:scale-105" />
                  <span className="font-bold text-[--md-sys-color-on-surface] tracking-tight group-hover:text-[--md-sys-color-primary] transition-colors duration-300 ml-2">GenieAgent</span>
                </div>
              )}
            </div>
            <button
              onClick={onToggleCollapse}
              className={cn(
                "p-2 rounded-md",
                isOfficeStyle
                  ? "text-gray-700 hover:bg-gray-100"
                  : "bg-[--md-sys-color-surface-variant]/70 border border-[--md-sys-color-outline-variant] hover:bg-[--md-sys-color-surface-variant] hover:border-[--md-sys-color-outline] hover:shadow-xl active:scale-95 transform-gpu hover:-translate-y-1 text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-primary]",
                "transition-all duration-300 ease-in-out",
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Office-style Command Bar */}
      {isOfficeStyle && !isCollapsed && (
        <div className="flex p-2 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-1 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => createChat()}
              className="h-8 text-xs font-medium flex items-center gap-1.5 text-[#0078d4] hover:bg-[#f3f2f1] rounded-sm px-2.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Chat</span>
            </Button>
            
            <div className="h-5 w-px bg-gray-300 mx-1"></div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              className="h-8 text-xs font-medium flex items-center gap-1.5 text-gray-700 hover:bg-[#f3f2f1] rounded-sm px-2.5"
            >
              <Folder className="h-3.5 w-3.5" />
              <span>Folders</span>
            </Button>
            
            <div className="flex-grow"></div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearHistoryConfirm(true)}
              className="h-8 text-xs font-medium flex items-center gap-1.5 text-gray-700 hover:bg-[#f3f2f1] rounded-sm px-2"
            >
              <Eraser className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {!isCollapsed && (
        <div className={cn(
          "px-3 py-2",
          isOfficeStyle 
            ? "border-b border-gray-200"
            : "border-b border-[--md-sys-color-outline-variant]"
        )}>
          <div className="relative group">
            <Search className={cn(
              "absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5",
              isOfficeStyle
                ? "text-gray-500" 
                : "text-[--md-sys-color-on-surface-variant] group-hover:text-[--md-sys-color-primary] transition-colors duration-300"
            )} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              className={cn(
                "w-full pl-8 pr-3 py-1.5 text-sm focus:outline-none",
                isOfficeStyle 
                  ? "bg-[#f3f2f1] border border-transparent rounded-sm text-gray-800 placeholder:text-gray-500 focus:border-[#0078d4]"
                  : "rounded-full bg-[--md-sys-color-surface-variant]/80 border border-[--md-sys-color-outline-variant] text-[--md-sys-color-on-surface] placeholder:text-[--md-sys-color-on-surface-variant]/70 focus:ring-2 focus:ring-[--md-sys-color-primary]/30 focus:border-[--md-sys-color-primary]/40 hover:bg-[--md-sys-color-surface-variant] hover:border-[--md-sys-color-outline] hover:shadow-lg transform-gpu hover:-translate-y-1",
                "transition-all duration-150 ease-in-out"
              )}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded-full",
                  isOfficeStyle
                    ? "hover:bg-gray-300 text-gray-500" 
                    : "hover:bg-[--md-sys-color-surface] text-[--md-sys-color-on-surface-variant] hover:text-[--md-sys-color-primary]",
                  "transition-all duration-150"
                )}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Office Navigation Panel (Vertical) */}
      {isOfficeStyle && !isCollapsed && (
        <div className="px-2 py-1 bg-[#f9f9f9] border-b border-gray-200">
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "justify-start text-xs h-7 px-2 mb-0.5 rounded-sm",
                mainNavActive === 'home' 
                  ? "bg-[#edebe9] text-[#0078d4] font-medium" 
                  : "text-gray-700 hover:bg-[#f3f2f1]"
              )}
              onClick={() => setMainNavActive('home')}
            >
              <Home className="h-3.5 w-3.5 mr-2" />
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "justify-start text-xs h-7 px-2 mb-0.5 rounded-sm",
                mainNavActive === 'chats' 
                  ? "bg-[#edebe9] text-[#0078d4] font-medium" 
                  : "text-gray-700 hover:bg-[#f3f2f1]"
              )}
              onClick={() => setMainNavActive('chats')}
            >
              <MessageSquare className="h-3.5 w-3.5 mr-2" />
              All Chats
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "justify-start text-xs h-7 px-2 mb-0.5 rounded-sm",
                mainNavActive === 'documents' 
                  ? "bg-[#edebe9] text-[#0078d4] font-medium" 
                  : "text-gray-700 hover:bg-[#f3f2f1]"
              )}
              onClick={() => setMainNavActive('documents')}
            >
              <FileText className="h-3.5 w-3.5 mr-2" />
              Documents
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "justify-start text-xs h-7 px-2 mb-0.5 rounded-sm",
                mainNavActive === 'history' 
                  ? "bg-[#edebe9] text-[#0078d4] font-medium" 
                  : "text-gray-700 hover:bg-[#f3f2f1]"
              )}
              onClick={() => setMainNavActive('history')}
            >
              <Clock className="h-3.5 w-3.5 mr-2" />
              History
            </Button>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className={cn(
        "flex-1 overflow-hidden overflow-y-auto max-h-[calc(100vh-16rem)]",
        isSpiralStyle ? "scrollbar-thin-spiral" : "scrollbar-thin"
      )}>
        {searchQuery && (
          <div className="px-3 py-2 text-sm text-gray-500">
            Showing results for "{searchQuery}"
          </div>
        )}

        {/* New Chat Button */}
        <div className={cn(
          "px-2 pb-2 pt-1",
          isCollapsed ? "w-full" : "w-auto"
        )}>
          <Button
            onClick={createChat}
            className={cn(
              "w-full justify-center",
              isCollapsed ? "px-2" : "px-4",
              isOfficeStyle 
                ? "bg-[#0078d4] hover:bg-[#106ebe] text-white" 
                : isSpiralStyle
                  ? "bg-[#004080] hover:bg-[#01305f] text-white border border-[#e6b44c]"
                  : "bg-gray-800 hover:bg-gray-700 text-white"
            )}
            size={isCollapsed ? "sm" : "default"}
          >
            <Plus className="h-4 w-4 mr-0 md:mr-2" />
            {!isCollapsed && <span>New Chat</span>}
          </Button>
        </div>

        {filteredGroups.length > 0 ? (
          filteredGroups.map((group, index) => (
            <div key={group.title} className={cn("mb-2", isOfficeStyle && "px-1")}>
              {/* Group header */}
              {isOfficeStyle ? (
                <div 
                  className="flex items-center justify-between py-1 px-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => toggleGroupCollapse(index)}
                >
                  <div className="flex items-center">
                    {group.isCollapsed ? (
                      <ChevronRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    )}
                    {group.title}
                  </div>
                  <span className="text-xs">{group.chats.length}</span>
                </div>
              ) : (
                <div 
                  className="flex items-center justify-between px-2 text-[--md-sys-color-on-surface-variant] mb-2"
                  onClick={() => toggleGroupCollapse(index)}
                >
                  <div className="flex items-center cursor-pointer">
                    <button className="p-1 hover:bg-[--md-sys-color-surface] rounded-full">
                      {group.isCollapsed ? (
                        <ChevronRight className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                    
                    <h3 className="text-xs font-medium uppercase tracking-wider ml-1">
                      {group.title}
                    </h3>
                  </div>
                  <span className="text-xs">{group.chats.length}</span>
                </div>
              )}

              {/* Group chats */}
              {!group.isCollapsed && (
                <div className={isOfficeStyle ? "space-y-0.5" : "space-y-1"}>
                  {group.chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setActiveChat(chat.id)}
                      className={cn(
                        "w-full text-left",
                        isOfficeStyle ? (
                          activeChat === chat.id
                            ? "bg-[#e1effa] border-l-2 border-[#0078d4]"
                            : "hover:bg-[#f3f2f1] border-l-2 border-transparent"
                        ) : (
                          activeChat === chat.id
                            ? "bg-[--md-sys-color-secondary-container] text-[--md-sys-color-on-secondary-container] rounded-lg"
                            : "hover:bg-[--md-sys-color-surface] hover:text-[--md-sys-color-on-surface] rounded-lg"
                        ),
                        isOfficeStyle 
                          ? "py-1.5 px-2 transition-colors" 
                          : "p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 transform-gpu"
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className={cn(
                          "font-medium line-clamp-1",
                          isOfficeStyle ? "text-xs" : "text-base"
                        )}>
                          {chat.title}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {chat.isPinned && (
                            <Pin className={cn(
                              isOfficeStyle ? "h-3 w-3 text-[#0078d4]" : "h-3.5 w-3.5 text-[--md-sys-color-on-surface-variant]"
                            )} />
                          )}
                          {chat.isSaved && (
                            <Star className={cn(
                              isOfficeStyle ? "h-3 w-3 text-[#0078d4]" : "h-3.5 w-3.5 fill-[--md-sys-color-tertiary] text-[--md-sys-color-tertiary]"
                            )} />
                          )}
                        </div>
                      </div>
                      {chat.lastMessage && (
                        <p className={cn(
                          "line-clamp-1 mt-0.5",
                          isOfficeStyle ? "text-[10px] text-gray-500" : "text-xs text-[--md-sys-color-on-surface-variant]"
                        )}>
                          {chat.lastMessage}
                        </p>
                      )}
                      <div className={cn(
                        "mt-1",
                        isOfficeStyle ? "text-[9px] text-gray-400" : "text-[10px] text-[--md-sys-color-on-surface-variant]/70"
                      )}>
                        {formatDate(chat.timestamp)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={cn(
            "flex flex-col items-center justify-center h-32 p-4 text-center",
            isOfficeStyle ? "bg-[#f3f2f1] rounded-sm text-gray-500 mx-2" : "bg-[--md-sys-color-surface-variant]/30 text-[--md-sys-color-on-surface-variant] rounded-lg"
          )}>
            <MessageSquare className={cn(
              "h-5 w-5 mb-2",
              isOfficeStyle ? "text-[#0078d4]" : "text-[--md-sys-color-primary]"
            )} />
            <p className="text-xs">No chats found</p>
            <p className="text-[10px] mt-1">Start a new chat or try a different search</p>
          </div>
        )}
      </div>

      {/* Footer with Settings & Clear History */}
      {!isCollapsed && !isOfficeStyle && (
        <div className="p-4 border-t border-[--md-sys-color-outline-variant] bg-[--md-sys-color-surface]/95">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowThemeControls}
              className={cn(
                "p-2 rounded-full",
                showThemeControls 
                  ? "bg-[--md-sys-color-primary]/10 text-[--md-sys-color-primary]" 
                  : "text-[--md-sys-color-on-surface-variant] hover:bg-[--md-sys-color-surface] hover:text-[--md-sys-color-primary]"
              )}
            >
              <Settings className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearHistoryConfirm(true)}
              className="p-2 rounded-full text-[--md-sys-color-on-surface-variant] hover:bg-[--md-sys-color-surface] hover:text-[--md-sys-color-error]"
            >
              <Eraser className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-2 rounded-full text-[--md-sys-color-on-surface-variant] hover:bg-[--md-sys-color-surface] hover:text-[--md-sys-color-primary]"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>

          {showClearHistoryConfirm && (
            <div className="mt-3 p-3 bg-[--md-sys-color-error-container] text-[--md-sys-color-on-error-container] rounded-lg">
              <p className="text-xs mb-2">Clear all chat history?</p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-xs py-0 h-7 bg-[--md-sys-color-error] text-[--md-sys-color-on-error]"
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearHistoryConfirm(false)}
                  className="text-xs py-0 h-7 border-[--md-sys-color-on-error-container]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Office Style Footer */}
      {!isCollapsed && isOfficeStyle && (
        <div className="p-2 border-t border-gray-200 mt-auto">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowThemeControls}
              className={cn(
                "p-1.5 rounded-sm text-gray-600 hover:bg-[#f3f2f1]",
                showThemeControls && "text-[#0078d4] bg-[#e1effa]"
              )}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              className="p-1.5 rounded-sm text-gray-600 hover:bg-[#f3f2f1]"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="p-1.5 rounded-sm text-gray-600 hover:bg-[#f3f2f1]"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Clear History Dialog */}
          {showClearHistoryConfirm && (
            <div className="mt-2 p-2 bg-[#fdf6f6] border border-[#d13438]/30 text-[#d13438] rounded-sm text-xs">
              <p className="mb-2 font-medium">Clear all chat history?</p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearHistory}
                  className="text-[10px] py-0 h-6 bg-[#d13438] text-white"
                >
                  Clear All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearHistoryConfirm(false)}
                  className="text-[10px] py-0 h-6 border-[#d13438]/50 text-[#d13438]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LeftSidebar; 