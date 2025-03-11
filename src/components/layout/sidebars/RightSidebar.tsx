import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '@stores/theme/themeStore';
import { useModeStore } from '@stores/model/modeStore';
import { useChatStore, type ChatMessage, type ChatSettings } from '@stores/chat/chatStore';
import { MessageSquare, Sparkles, Send, GripVertical, ChevronRight, ChevronLeft, Bot, Code, History } from 'lucide-react';
import { cn } from '@utils/cn';
import { useModelStore } from '@stores/model/modelStore';
import { useSidebarStore } from '@stores/ui/sidebarStore';

interface SideMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  reference?: {
    type: 'main-chat' | 'web-search' | 'flow-execution';
    source: string;
  };
}

interface AgentFlow {
  id: string;
  name: string;
  description: string;
  prompt: string;
  createdAt: Date;
}

const MIN_WIDTH = 400; // Minimum width in pixels
const MAX_WIDTH = 800; // Maximum width in pixels
const DEFAULT_WIDTH = 500; // Default width in pixels
const COLLAPSED_WIDTH = 50; // Width when collapsed

const RightSidebar: React.FC = () => {
  const { currentTheme } = useThemeStore();
  const { activeMode, modes } = useModeStore();
  const { activeChat, getChat, updateChatSettings } = useChatStore();
  const { modelService } = useModelStore();
  const { width, isCollapsed, setWidth, setIsCollapsed } = useSidebarStore();
  const currentMode = modes.find(m => m.id === activeMode);
  const [activeSection, setActiveSection] = useState<'chat' | 'agent' | 'history'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const lastWidth = useRef(DEFAULT_WIDTH);
  const [sideMessages, setSideMessages] = useState<SideMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [agentFlows, setAgentFlows] = useState<AgentFlow[]>([]);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDescription, setNewAgentDescription] = useState('');
  const [newAgentPrompt, setNewAgentPrompt] = useState('');

  // Get current chat and its messages
  const currentChat = activeChat ? getChat(activeChat) : null;
  const mainChatMessages = currentChat?.messages || [];

  // Handle resize
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const windowWidth = window.innerWidth;
      const newWidth = windowWidth - e.clientX;
      
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setWidth(newWidth);
        lastWidth.current = newWidth;
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, setWidth]);

  // Handle collapse toggle
  const toggleCollapse = () => {
    if (isCollapsed) {
      setWidth(lastWidth.current);
    } else {
      lastWidth.current = width;
      setWidth(COLLAPSED_WIDTH);
    }
    setIsCollapsed(!isCollapsed);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sideMessages]);

  // Handle chat input with context from main chat
  const handleSideChat = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: SideMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setSideMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsAnalyzing(true);

    try {
      // Convert main chat messages to the format expected by the model service
      const mainChatHistory = mainChatMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      // Add side chat messages
      const sideHistory = sideMessages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant')
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      // Combine histories with a separator
      const fullHistory = [
        ...mainChatHistory,
        {
          role: 'system' as const,
          content: '--- New conversation context ---'
        },
        ...sideHistory,
        {
          role: 'user' as const,
          content: message
        }
      ];

      // Create a temporary message for streaming
      const streamingMessageId = crypto.randomUUID();
      const streamingMessage: SideMessage = {
        id: streamingMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        reference: {
          type: 'web-search',
          source: 'Gemini'
        }
      };
      setSideMessages(prev => [...prev, streamingMessage]);

      // Use streaming response
      const streamResponse = await modelService.generateChatStream(fullHistory);
      let accumulatedResponse = '';

      for await (const chunk of streamResponse) {
        accumulatedResponse += chunk;
        // Update the streaming message content
        setSideMessages(prev => prev.map(msg => 
          msg.id === streamingMessageId 
            ? { ...msg, content: accumulatedResponse }
            : msg
        ));
      }

      // Final update to ensure complete message
      setSideMessages(prev => prev.map(msg => 
        msg.id === streamingMessageId 
          ? { ...msg, content: accumulatedResponse }
          : msg
      ));

    } catch (error) {
      console.error('Error in side chat:', error);
      const errorMessage: SideMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while generating a response. Please try again.',
        timestamp: new Date(),
        reference: {
          type: 'web-search',
          source: 'Error'
        }
      };
      setSideMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle saving new agent flow
  const handleSaveAgentFlow = () => {
    if (!newAgentName.trim() || !newAgentPrompt.trim()) return;

    const newFlow: AgentFlow = {
      id: crypto.randomUUID(),
      name: newAgentName,
      description: newAgentDescription,
      prompt: newAgentPrompt,
      createdAt: new Date()
    };

    setAgentFlows(prev => [...prev, newFlow]);
    setNewAgentName('');
    setNewAgentDescription('');
    setNewAgentPrompt('');
  };

  return (
    <div 
      className="fixed top-[60px] right-0 bottom-0 flex flex-col border-l border-border transition-all duration-300 bg-background"
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 flex items-center"
          onMouseDown={() => setIsResizing(true)}
        >
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-border rounded-full p-1">
            <GripVertical className="w-3 h-3" />
          </div>
        </div>
      )}

      {/* Collapse Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute left-0 top-4 transform -translate-x-full bg-background border border-border rounded-l-md p-1 hover:bg-muted"
      >
        {isCollapsed ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {/* Content */}
      <div className={cn(
        "flex flex-col h-full",
        isCollapsed ? "opacity-0" : "opacity-100 transition-opacity duration-300"
      )}>
        {/* Tabs */}
        <div className="flex border-b border-border p-2 gap-2">
          <button
            onClick={() => setActiveSection('chat')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2",
              activeSection === 'chat' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">Chat</span>
          </button>
          <button
            onClick={() => setActiveSection('agent')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2",
              activeSection === 'agent' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <Bot className="w-4 h-4" />
            <span className="text-sm">Agent</span>
          </button>
          <button
            onClick={() => setActiveSection('history')}
            className={cn(
              "px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2",
              activeSection === 'history' ? "bg-primary text-primary-foreground" : "hover:bg-muted"
            )}
          >
            <History className="w-4 h-4" />
            <span className="text-sm">History</span>
          </button>
        </div>

        {/* Section Content */}
        <div className="flex-1 overflow-y-auto p-4">
        {activeSection === 'chat' && (
            <div className="space-y-4">
              {/* Messages */}
              <div className="space-y-4">
                {sideMessages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "p-3 rounded-lg",
                      message.role === 'assistant' ? "bg-primary/10" : "bg-muted"
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium capitalize">{message.role}</span>
                      {message.reference && (
                        <span className="text-xs text-muted-foreground">
                          {message.reference.source}
                        </span>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                </div>

              {/* Input */}
              <div className="flex gap-2">
                      <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSideChat(inputValue)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={isAnalyzing}
                />
                <button
                  onClick={() => handleSideChat(inputValue)}
                  disabled={isAnalyzing || !inputValue.trim()}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isAnalyzing ? "bg-muted cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {isAnalyzing ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
                      </div>
                    </div>
          )}

          {activeSection === 'agent' && (
            <div className="space-y-6">
              {/* Create New Agent */}
              <div className="space-y-4 p-4 border border-border rounded-lg">
                <h3 className="text-lg font-medium">Create New Agent</h3>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="Agent Name"
                    className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={newAgentDescription}
                    onChange={(e) => setNewAgentDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    value={newAgentPrompt}
                    onChange={(e) => setNewAgentPrompt(e.target.value)}
                    placeholder="Agent Prompt..."
                    rows={4}
                    className="w-full bg-muted/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleSaveAgentFlow}
                    disabled={!newAgentName.trim() || !newAgentPrompt.trim()}
                    className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save Agent
                  </button>
                </div>
                    </div>

              {/* Saved Agents */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Saved Agents</h3>
                <div className="space-y-2">
                  {agentFlows.map((flow) => (
                    <div
                      key={flow.id}
                      className="p-4 border border-border rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{flow.name}</h4>
                        <span className="text-xs text-muted-foreground">
                          {flow.createdAt.toLocaleDateString()}
                        </span>
                    </div>
                      {flow.description && (
                        <p className="text-sm text-muted-foreground">{flow.description}</p>
                      )}
                      <p className="text-sm bg-muted/50 p-2 rounded">{flow.prompt}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

          {activeSection === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Main Chat History</h3>
              {mainChatMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-3 rounded-lg",
                    message.role === 'assistant' ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">{message.role}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
              ))}
                        </div>
                      )}
                    </div>
                  </div>

      {/* Collapsed View */}
      {isCollapsed && (
        <div className="flex h-full items-center justify-center">
          <MessageSquare className="w-6 h-6" />
          </div>
        )}
      </div>
  );
};

export default RightSidebar; 