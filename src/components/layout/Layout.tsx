import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Settings,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage } from '@/stores/chat/chatStore';
import HeaderBar from './HeaderBar';
import LeftSidebar from './sidebars/LeftSidebar';
import RightSidebar from './sidebars/RightSidebar';
import { ThemeControls } from '@/components/theme/ThemeControls';
import { useChatStore } from '@/stores/chat/chatStore';
import { useSidebarStore } from '@/stores/ui/sidebarStore';
import ChatScreen from '@/components/chat/ChatScreen';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [showThemeControls, setShowThemeControls] = useState(false);
  const [mainChatMessages, setMainChatMessages] = useState<any[]>([]);
  const { createChat } = useChatStore();
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(500);

  // Add a reference to store the search handler
  const searchHandlerRef = useRef<((content: string) => Promise<void>) | null>(null);

  // Handler for chat messages
  const handleChatMessages = (messages: any[]) => {
    setMainChatMessages(messages);
  };

  // Handler for right sidebar interactions with main chat
  const handleMainChatInteraction = (action: 'copy' | 'workflow' | 'attach' | 'search', content: string) => {
    if (action === 'copy') {
      // Copy the question to the main chat input
      const chatScreen = document.querySelector('input[placeholder*="Message"]') as HTMLInputElement;
      if (chatScreen) {
        chatScreen.value = content;
        chatScreen.focus();
      }
    } else if (action === 'search' || action === 'workflow') {
      console.log(`${action} action triggered with content:`, content);
      
      // Use the stored search handler if available
      if (searchHandlerRef.current) {
        console.log("Using stored search handler");
        searchHandlerRef.current(content);
        return;
      }
      
      // Fallback to the DOM approach if no handler is available
      const chatScreen = document.querySelector('input[placeholder*="Message"]') as HTMLInputElement;
      if (chatScreen) {
        // Set the value and dispatch an input event to ensure React state is updated
        chatScreen.value = content;
        const inputEvent = new Event('input', { bubbles: true });
        chatScreen.dispatchEvent(inputEvent);
        
        // Focus the input to ensure the form recognizes it
        chatScreen.focus();
        
        // Find the form and the submit button
        const form = chatScreen.closest('form');
        const submitButton = form?.querySelector('button[type="submit"]') || 
                            document.querySelector('button[aria-label*="Send"]') ||
                            document.querySelector('button svg[data-icon="send"]')?.closest('button');
        
        // Try multiple approaches to submit
        setTimeout(() => {
          console.log("Attempting to submit form");
          
          if (action === 'workflow') {
            console.log("Auto-submitting workflow suggestion");
            
            // Approach 1: Click the submit button if found
            if (submitButton) {
              console.log("Submit button found, clicking it");
              (submitButton as HTMLButtonElement).click();
              return;
            }
            
            // Approach 2: Dispatch submit event on the form
            if (form) {
              console.log("Form found, dispatching submit event");
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
              form.dispatchEvent(submitEvent);
              return;
            }
            
            // Approach 3: Simulate Enter key press on the input
            console.log("Simulating Enter key press");
            const keyEvent = new KeyboardEvent('keydown', {
              bubbles: true, 
              cancelable: true, 
              key: 'Enter',
              code: 'Enter',
              keyCode: 13
            });
            chatScreen.dispatchEvent(keyEvent);
          }
          
          console.log("All submission attempts completed");
        }, 300); // Longer delay to ensure everything is ready
      } else {
        console.error("Chat input field not found");
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[--md-sys-color-background]">
      {/* Header */}
      <HeaderBar className="shrink-0 z-50" />

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <LeftSidebar
          isCollapsed={isLeftSidebarCollapsed}
          onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
          className={cn(
            "shrink-0 bg-[--md-sys-color-surface] border-r border-[--md-sys-color-outline]",
            "shadow-[var(--md-sys-elevation-1)] z-40 transition-google",
            isLeftSidebarCollapsed ? "w-16" : "w-64"
          )}
        />

        {/* Main Chat Area */}
        <div className="flex-1 min-w-0 flex h-full">
          <div className="flex-1 min-w-0 flex flex-col">
            <ChatScreen 
              onMessagesChange={handleChatMessages}
              isLeftSidebarCollapsed={isLeftSidebarCollapsed}
              isRightSidebarOpen={isRightSidebarOpen}
              rightSidebarWidth={rightSidebarWidth}
              onSidebarInteraction={{
                search: (handler) => {
                  // Store the search handler function in the ref
                  searchHandlerRef.current = handler;
                },
                copy: (content) => {
                  // Handle copy action
                  navigator.clipboard.writeText(content);
                },
                workflow: (content) => {
                  // Handle workflow action
                  console.log("Workflow action:", content);
                }
              }}
            />
          </div>

          {/* Right Sidebar with Tab */}
          <div className="relative flex h-full">
            {/* Half-circle Tab with Google-style shadow */}
            <button
              onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-50",
                "h-24 w-6 flex items-center justify-center",
                "bg-white border-y border-l border-[#dadce0]",
                "rounded-l-xl",
                "hover:bg-[#f8f9fa]",
                "focus:outline-none",
                "transition-all duration-200",
                isRightSidebarOpen ? "-left-6" : "-left-6",
                "shadow-[-2px_0px_8px_rgba(60,64,67,0.15)]",
                "hover:shadow-[-2px_0px_12px_rgba(60,64,67,0.25)]",
                "after:content-[''] after:absolute after:right-0 after:top-0 after:bottom-0",
                "after:w-[1px] after:bg-white after:z-10"
              )}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {isRightSidebarOpen ? (
                  <ChevronRight className="h-5 w-5 text-[#5f6368]" />
                ) : (
                  <ChevronLeft className="h-5 w-5 text-[#5f6368]" />
                )}
              </div>
            </button>

            {/* Sidebar Content */}
            <div 
              className={cn(
                "shrink-0 border-l border-[#dadce0]",
                "bg-white h-full flex flex-col relative",
                "shadow-[-4px_0px_8px_rgba(60,64,67,0.15)]",
                "transition-all duration-200 ease-in-out",
                isRightSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              style={{ 
                width: isRightSidebarOpen ? `${rightSidebarWidth}px` : 0,
                minWidth: isRightSidebarOpen ? "400px" : "0",
                maxWidth: isRightSidebarOpen ? "800px" : "0",
                transform: isRightSidebarOpen ? 'translateX(0)' : 'translateX(100%)',
              }}
            >
              <RightSidebar 
                isOpen={isRightSidebarOpen}
                onClose={() => setIsRightSidebarOpen(false)}
                onWidthChange={setRightSidebarWidth}
                mainChatMessages={mainChatMessages}
                onMainChatInteraction={handleMainChatInteraction}
              >
                {showThemeControls && (
                  <div className="p-4 border-b border-[#dadce0]">
                    <ThemeControls />
                  </div>
                )}
              </RightSidebar>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 