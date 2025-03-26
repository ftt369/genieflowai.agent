import { useState, useEffect, useRef } from 'react';
import { 
  Menu,
  ChevronLeft,
  ChevronRight,
  Search,
  HelpCircle,
  Settings,
  User,
  MessageSquare,
  RefreshCw,
  X,
  Bot as BotIcon,
  Sparkles as SparklesIcon,
  History as HistoryIcon,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/stores/chat/chatStore';
import { useThemeStore } from '@/stores/theme/themeStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import HeaderBar from './HeaderBar';
import ChatScreen from '@/components/chat/ChatScreen';
import RightSidebar from '@/components/layout/sidebars/RightSidebar';
import LeftSidebar from '@/components/layout/sidebars/LeftSidebar';
import { ThemeControls } from '@/components/theme/ThemeControls';
import { type ColorProfile } from '@/config/theme';

// Define a type that matches what ChatScreen and RightSidebar expect
type ChatMessage = any;

export default function MainLayout() {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(400);
  const [showThemeControls, setShowThemeControls] = useState(false);
  const [mainChatMessages, setMainChatMessages] = useState<ChatMessage[]>([]);
  const { mode, profile: themeProfile } = useThemeStore();
  const { createChat } = useChatStore();
  const [isMobile, setIsMobile] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'research' | 'agent' | 'history' | 'documents'>('chat');
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if we're using the Office theme profile
  const isSpiralStyle = themeProfile === 'spiral' as ColorProfile;

  // Use custom theme colors based on active theme
  const getThemeColors = () => {
    if (isSpiralStyle) {
      return {
        primary: '#e6b44c', // Gold
        secondary: '#53c5eb', // Blue
        accent: '#004080', // Dark Blue
        background: 'white',
        text: '#333',
        lightBackground: '#f8e8c6', // Light Gold
        borderColor: '#e6b44c'
      };
    } else {
      // Default theme
      return {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        text: 'var(--foreground)',
        lightBackground: 'var(--muted)',
        borderColor: 'var(--border)'
      };
    }
  };

  // Set body class based on theme
  useEffect(() => {
    // Set dark mode class
    if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Set theme profile class
    if (isSpiralStyle) {
      document.documentElement.style.setProperty('--primary-color', '#004080');
      document.documentElement.style.setProperty('--accent-color', '#e6b44c');
    } else {
      document.documentElement.style.setProperty('--primary-color', 'hsl(var(--primary))');
      document.documentElement.style.setProperty('--accent-color', 'hsl(var(--accent))');
    }
  }, [mode, themeProfile, isSpiralStyle]);

  // Handle responsive layout
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768 && !isLeftSidebarCollapsed) {
        setIsLeftSidebarCollapsed(true);
      }
      
      // Close right sidebar on mobile if open
      if (window.innerWidth < 768 && isRightSidebarOpen) {
        setIsRightSidebarOpen(false);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [isLeftSidebarCollapsed, isRightSidebarOpen]);

  // Handler for chat messages from ChatScreen
  const handleChatMessages = (messages: ChatMessage[]) => {
    setMainChatMessages(messages);
  };

  // Handler for right sidebar width changes
  const handleRightSidebarWidthChange = (width: number) => {
    setRightSidebarWidth(width);
  };

  // Handler for right sidebar interactions with main chat
  const handleMainChatInteraction = (action: 'search' | 'copy' | 'workflow' | 'attach', content: string) => {
    console.log(`Right sidebar ${action} action on: ${content}`);
    
    // Implement actual functionality for each action
    switch (action) {
      case 'copy':
        navigator.clipboard.writeText(content)
          .then(() => console.log('Content copied to clipboard'))
          .catch(err => console.error('Failed to copy: ', err));
        break;
      case 'search':
        // For AI Assistant suggested tasks, create a chat message with the query
        if (content.includes('Analyze') || content.includes('Summarize') || 
            content.includes('Compare') || content.includes('Extract')) {
          // This is a task suggestion, create a new chat or use existing
          if (createChat) {
            // Create a new chat (createChat doesn't accept parameters)
            createChat();
            // We'll need to add the content to the chat in another way
            // This could be done by setting a state that the chat component can use
            console.log('Creating new chat for task:', content);
          }
        } else {
          // Regular search functionality
          console.log('Searching for: ', content);
        }
        break;
      case 'workflow':
        // Handle workflow suggestion
        console.log('Creating workflow from: ', content);
        
        // Find the chat input and submit the form with more specific selectors
        const chatInputElement = document.querySelector('.chat-input textarea') as HTMLTextAreaElement;
        const chatFormElement = document.querySelector('form[class*="chat-form"]') as HTMLFormElement;
        const submitButton = document.querySelector('button[type="submit"]') as HTMLButtonElement;
        
        if (chatInputElement) {
          console.log('Found chat input element, setting value:', content);
          
          // Set the value directly
          chatInputElement.value = content;
          
          // Dispatch input event to trigger React's onChange
          const inputEvent = new Event('input', { bubbles: true });
          chatInputElement.dispatchEvent(inputEvent);
          
          // Focus the input to ensure it's active
          chatInputElement.focus();
          
          // Try multiple submission methods
          setTimeout(() => {
            // Try method 1: Click the submit button
            if (submitButton) {
              console.log('Clicking submit button');
              submitButton.click();
            } 
            // Try method 2: Submit the form
            else if (chatFormElement) {
              console.log('Submitting form directly');
              const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
              chatFormElement.dispatchEvent(submitEvent);
            } 
            // Try method 3: Press Enter key on input
            else {
              console.log('Simulating Enter key press');
              chatInputElement.dispatchEvent(new KeyboardEvent('keydown', {
                key: 'Enter',
                code: 'Enter',
                keyCode: 13,
                which: 13,
                bubbles: true
              }));
            }
          }, 150); // Slightly longer delay to ensure React state is updated
        } else {
          console.error('Could not find chat input element');
        }
        break;
      case 'attach':
        // Handle document attachment
        // Change to the chat tab when a document is attached
        setActiveTab('chat');
        console.log('Attaching: ', content);
        break;
      default:
        break;
    }
  };

  // Handler for showing theme controls
  const handleShowThemeControls = () => {
    setShowThemeControls(!showThemeControls);
    if (!isRightSidebarOpen) {
      setIsRightSidebarOpen(true);
    }
  };

  // Simulate refreshing (for UI demonstration)
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Office theme specific class names
  const themeClasses = isSpiralStyle ? {
    mainContainer: "font-sans bg-white text-gray-800",
    actionButtons: "bg-[#004080] text-white hover:bg-[#01305f] border border-[#e6b44c]",
    iconButtons: "border-[#e6b44c]/30 text-[#004080] hover:border-[#e6b44c] hover:bg-[#e6b44c]/10"
  } : {
    mainContainer: "",
    actionButtons: "bg-primary text-primary-foreground hover:bg-primary/90",
    iconButtons: "hover:bg-background"
  };

  return (
    <div className={cn(
      "flex flex-col h-screen overflow-hidden",
      isSpiralStyle ? "spiral-theme bg-white text-gray-800" : ""
    )}>
      {/* Header */}
      <HeaderBar />
      
      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden relative bg-gradient-to-b from-background/50 to-background">
        {/* Add subtle background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - collapsible */}
          <div className={cn(
            "transition-all duration-200 border-r h-full relative",
            isLeftSidebarCollapsed ? "w-[60px]" : "w-[240px]",
            "bg-gray-50 border-gray-200"
          )}>
            {/* Toggle Button */}
            <button 
              className={cn(
                "absolute top-3 right-3 p-1.5 rounded-full bg-white shadow-sm z-10 border",
                "text-gray-600 hover:bg-gray-100 border-gray-200"
              )}
              onClick={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
            >
              <Menu className="h-4 w-4" />
            </button>
            
            <LeftSidebar 
              isCollapsed={isLeftSidebarCollapsed}
              onToggleCollapse={() => setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed)}
              onShowThemeControls={() => setShowThemeControls(!showThemeControls)}
              showThemeControls={showThemeControls}
            />
          </div>
          
          {/* Main Content */}
          <div 
            ref={mainContentRef}
            className={cn(
              "flex-1 h-full overflow-hidden transition-all duration-200",
              "bg-gray-50"
            )}
            style={{ 
              width: isRightSidebarOpen 
                ? `calc(100% - ${isRightSidebarCollapsed ? 28 : rightSidebarWidth}px - ${isLeftSidebarCollapsed ? 60 : 240}px)` 
                : `calc(100% - ${isLeftSidebarCollapsed ? 60 : 240}px)`,
              transition: 'width 0.3s ease'
            }}
          >
            <ChatScreen 
              onMessagesChange={handleChatMessages}
              isRightSidebarOpen={isRightSidebarOpen}
              isLeftSidebarCollapsed={isLeftSidebarCollapsed}
              rightSidebarWidth={isRightSidebarCollapsed ? 28 : rightSidebarWidth}
              onSidebarInteraction={{
                search: (handler) => {
                  // Implement search handler
                  return Promise.resolve();
                },
                copy: (content) => {
                  navigator.clipboard.writeText(content);
                },
                workflow: (content) => {
                  console.log('Creating workflow from: ', content);
                }
              }}
            />
          </div>
          
          {/* Right Sidebar - visible by default */}
          {isRightSidebarOpen && (
            <div className={cn(
              "h-full relative transition-all duration-300 ease-in-out border-l",
              isRightSidebarCollapsed 
                ? "w-[28px] bg-gray-100" 
                : "bg-white",
              "border-gray-200"
            )}
            style={{ 
              width: isRightSidebarCollapsed ? "28px" : `${rightSidebarWidth}px`,
              transition: 'width 0.3s ease'
            }}
            >
              {/* Collapse Tab */}
              <div 
                className={cn(
                  "absolute top-1/2 left-0 -translate-y-1/2 transform translate-x-[-50%] cursor-pointer z-20",
                  "w-6 h-16 bg-white border rounded-l-md flex items-center justify-center",
                  "shadow-md hover:shadow-lg transition-all",
                  "border-gray-200"
                )}
                onClick={() => setIsRightSidebarCollapsed(!isRightSidebarCollapsed)}
              >
                {isRightSidebarCollapsed ? (
                  <ChevronLeft className={cn(
                    "h-4 w-4", 
                    "text-gray-500"
                  )} />
                ) : (
                  <ChevronRight className={cn(
                    "h-4 w-4",
                    "text-gray-500"
                  )} />
                )}
              </div>
              
              {/* Collapsed View */}
              {isRightSidebarCollapsed && (
                <div className="w-full h-full flex flex-col items-center pt-6 space-y-6">
                  <button 
                    className="flex items-center justify-center w-full p-2 focus:outline-none"
                    onClick={() => {
                      setActiveTab('chat');
                      setIsRightSidebarCollapsed(false);
                    }}
                  >
                    <MessageSquare 
                      className={cn(
                        "h-4 w-4",
                        activeTab === 'chat' ? (
                          "text-primary"
                        ) : "text-gray-500 hover:text-gray-700"
                      )} 
                    />
                  </button>
                  <button 
                    className="flex items-center justify-center w-full p-2 focus:outline-none"
                    onClick={() => {
                      setActiveTab('research');
                      setIsRightSidebarCollapsed(false);
                    }}
                  >
                    <FileText 
                      className={cn(
                        "h-4 w-4",
                        activeTab === 'research' ? (
                          "text-amber-500"
                        ) : "text-gray-500 hover:text-gray-700"
                      )} 
                    />
                  </button>
                  <button 
                    className="flex items-center justify-center w-full p-2 focus:outline-none"
                    onClick={() => {
                      setActiveTab('agent');
                      setIsRightSidebarCollapsed(false);
                    }}
                  >
                    <SparklesIcon 
                      className={cn(
                        "h-4 w-4",
                        activeTab === 'agent' ? (
                          "text-green-600"
                        ) : "text-gray-500 hover:text-gray-700"
                      )} 
                    />
                  </button>
                  {/* Documents button */}
                  <button 
                    className="flex items-center justify-center w-full p-2 focus:outline-none"
                    onClick={() => {
                      setActiveTab('documents');
                      setIsRightSidebarCollapsed(false);
                    }}
                  >
                    <FileText 
                      className={cn(
                        "h-4 w-4",
                        activeTab === 'documents' ? (
                          "text-gray-700"
                        ) : "text-gray-500 hover:text-gray-700"
                      )} 
                    />
                  </button>
                </div>
              )}
              
              {/* Full Sidebar */}
              {!isRightSidebarCollapsed && (
                <RightSidebar 
                  isOpen={isRightSidebarOpen}
                  onClose={() => {
                    setIsRightSidebarOpen(false);
                    setShowThemeControls(false);
                  }}
                  onWidthChange={handleRightSidebarWidthChange}
                  mainChatMessages={mainChatMessages}
                  onMainChatInteraction={handleMainChatInteraction}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                >
                  {showThemeControls && (
                    <div className={cn(
                      "p-4 border-b",
                      "border-gray-200"
                    )}>
                      <h3 className={cn(
                        "text-lg font-medium mb-4",
                        ""
                      )}>
                        Appearance
                      </h3>
                      <ThemeControls />
                    </div>
                  )}
                </RightSidebar>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 