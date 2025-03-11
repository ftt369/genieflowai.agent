import { useState } from 'react';
import { 
  MessageSquare, 
  Bot, 
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import ModeSelector from './ModeSelector';
import ChatScreen from './ChatScreen';
import RightSidebar from './RightSidebar';
import { ThemeSelector } from './ThemeSelector';
import { ChatMessage } from '../types/chat';

export default function MainLayout() {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);
  const [mainChatMessages, setMainChatMessages] = useState<ChatMessage[]>([]);

  // Handler for chat messages from ChatScreen
  const handleChatMessages = (messages: ChatMessage[]) => {
    setMainChatMessages(messages);
  };

  // Handler for right sidebar interactions with main chat
  const handleMainChatInteraction = (action: 'copy' | 'workflow', content: string) => {
    // Handle interactions as needed
    console.log(`Right sidebar ${action} action on: ${content}`);
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {/* Left Sidebar */}
      <div 
        className={cn(
          "flex flex-col border-r border-[var(--border)] transition-all duration-300",
          isLeftSidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className={cn(
            "flex items-center gap-2",
            isLeftSidebarCollapsed && "hidden"
          )}>
            <Bot className="h-6 w-6 text-[var(--primary)]" />
            <span className="font-semibold text-[var(--foreground)]">GenieAgent</span>
          </div>
          <button
            onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
            className="p-1 hover:bg-[var(--muted)] rounded-md text-[var(--foreground)]"
          >
            {isLeftSidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <button
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors",
              "bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90"
            )}
          >
            <PlusCircle className="h-5 w-5" />
            {!isLeftSidebarCollapsed && <span>New Thread</span>}
          </button>

          <div className="mt-4 space-y-1">
            {/* Thread list would go here */}
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border)]">
          <div className="space-y-2">
            <button
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors",
                "hover:bg-[var(--muted)] text-[var(--foreground)]"
              )}
            >
              <Settings className="h-5 w-5" />
              {!isLeftSidebarCollapsed && <span>Settings</span>}
            </button>
            <button
              className={cn(
                "flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors",
                "hover:bg-[var(--muted)] text-[var(--foreground)]"
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
        <header className="flex items-center justify-between px-4 h-[60px] border-b border-[var(--border)]">
          <div className="flex items-center gap-4">
            <ModeSelector />
          </div>
          <div className="flex items-center gap-2">
            <ThemeSelector />
            <button
              onClick={() => setIsRightSidebarOpen(true)}
              className={cn(
                "p-2 rounded-lg transition-colors",
                "hover:bg-[var(--muted)] text-[var(--foreground)]"
              )}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <ChatScreen onMessagesChange={handleChatMessages} />
        </main>
      </div>

      {/* Right Sidebar (Pull-out) */}
      <RightSidebar 
        isOpen={isRightSidebarOpen}
        onClose={() => setIsRightSidebarOpen(false)}
        mainChatMessages={mainChatMessages}
        onMainChatInteraction={handleMainChatInteraction}
      />
    </div>
  );
} 