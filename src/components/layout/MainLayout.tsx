import { useState } from 'react';
import { 
  Bot, 
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/stores/chat/chatStore';
import { useThemeStore } from '@/stores/theme/themeStore';
import ChatScreen from '@/components/chat/ChatScreen';
import RightSidebar from '@/components/layout/sidebars/RightSidebar';
import { ThemeControls } from '@/components/theme/ThemeControls';
import { useChatStore } from '@/stores/chat/chatStore';

export default function MainLayout() {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [showThemeControls, setShowThemeControls] = useState(false);
  const [mainChatMessages, setMainChatMessages] = useState<ChatMessage[]>([]);
  const { mode } = useThemeStore();
  const { createChat } = useChatStore();

  // Handler for chat messages from ChatScreen
  const handleChatMessages = (messages: ChatMessage[]) => {
    setMainChatMessages(messages);
  };

  // Handler for right sidebar interactions with main chat
  const handleMainChatInteraction = (action: 'copy' | 'workflow', content: string) => {
    console.log(`Right sidebar ${action} action on: ${content}`);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <div 
        className={cn(
          "flex flex-col border-r border-border transition-all duration-300",
          isLeftSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className={cn(
            "flex items-center gap-2",
            isLeftSidebarCollapsed && "hidden"
          )}>
            <Bot className="h-6 w-6 text-primary" />
            <span className="font-semibold text-foreground">GenieAgent</span>
          </div>
          <button
            onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
            className="p-1 hover:bg-muted rounded-md text-foreground"
          >
            {isLeftSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={() => createChat()}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors",
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            <PlusCircle className="h-5 w-5" />
            {!isLeftSidebarCollapsed && <span>New Chat</span>}
          </button>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-border">
          <div className="space-y-2">
            <button
              onClick={() => {
                setShowThemeControls(!showThemeControls);
                if (!isRightSidebarOpen) {
                  setIsRightSidebarOpen(true);
                }
              }}
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors",
                "hover:bg-muted text-foreground",
                showThemeControls && "bg-primary text-primary-foreground"
              )}
            >
              <Settings className="h-5 w-5" />
              {!isLeftSidebarCollapsed && <span>Settings</span>}
            </button>
            <button
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors",
                "hover:bg-muted text-foreground"
              )}
            >
              <LogOut className="h-5 w-5" />
              {!isLeftSidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-4 h-[60px] border-b border-border">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
            </span>
          </div>
          <button
            onClick={() => setIsRightSidebarOpen(true)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              "hover:bg-muted text-foreground"
            )}
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <main className="flex-1 overflow-hidden">
          <ChatScreen 
            onMessagesChange={handleChatMessages}
            isLeftSidebarCollapsed={isLeftSidebarCollapsed}
          />
        </main>
      </div>

      {/* Right Sidebar */}
      <RightSidebar 
        isOpen={isRightSidebarOpen}
        onClose={() => {
          setIsRightSidebarOpen(false);
          setShowThemeControls(false);
        }}
        mainChatMessages={mainChatMessages}
        onMainChatInteraction={handleMainChatInteraction}
      >
        {showThemeControls && (
          <div className="p-4 border-b border-border">
            <ThemeControls />
          </div>
        )}
      </RightSidebar>
    </div>
  );
} 