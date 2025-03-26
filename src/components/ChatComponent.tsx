import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useUsageTracking } from '../hooks/useUsageTracking';
import { useFeatureAccess } from '../hooks/useFeatureAccess';
import { PremiumFeatureGuard } from './PremiumFeatureGuard';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatComponent() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track chat message usage
  const { 
    track: trackChatUsage, 
    usageWarning, 
    usagePercentage 
  } = useUsageTracking('chat-messages');
  
  // Check if user has access to chat feature
  const { hasAccess, isLoading: accessLoading } = useFeatureAccess('chat-messages');

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !input.trim() || isLoading || !hasAccess) return;
    
    // Create a new user message
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: input.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Simulate API call to get AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create AI response
      const aiMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        content: `This is a sample response to: "${input.trim()}"`,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // Track usage after successful interaction
      trackChatUsage(1);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Render usage warning if approaching limit
  const renderUsageWarning = () => {
    if (usageWarning === 'critical') {
      return (
        <div className="bg-red-900 text-red-300 px-4 py-2 rounded-md text-sm mb-4">
          <p><strong>Warning:</strong> You've used {usagePercentage.toFixed(0)}% of your monthly message limit.</p>
          <p className="mt-1">Consider upgrading your plan to continue using this feature.</p>
        </div>
      );
    } else if (usageWarning === 'approaching') {
      return (
        <div className="bg-yellow-900 text-yellow-300 px-4 py-2 rounded-md text-sm mb-4">
          <p><strong>Notice:</strong> You've used {usagePercentage.toFixed(0)}% of your monthly message limit.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <PremiumFeatureGuard featureId="chat-messages">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50 backdrop-blur-sm bevel-glass rounded-md shadow-subtle">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p className="text-xl mb-2">Start a new conversation</p>
                <p className="text-sm">Ask me anything, and I'll do my best to help you.</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground bevel-neumorphic shadow-subtle'
                      : 'bg-background/80 bevel-glass shadow-3d border border-border'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.sender === 'user'
                      ? 'opacity-80'
                      : 'text-muted-foreground'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        
        {renderUsageWarning()}
        
        <form onSubmit={handleSendMessage} className="border-t border-border p-4 bg-gradient-to-r from-muted/30 to-background/60 backdrop-blur-sm rounded-b-md">
          <div className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-background/50 backdrop-blur-sm text-foreground placeholder-muted-foreground rounded-l-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 bevel-glass shadow-inner border border-border"
              disabled={isLoading || !hasAccess}
            />
            <button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed bevel-neumorphic shadow-subtle hover:shadow-none transition-shadow duration-200"
              disabled={!input.trim() || isLoading || !hasAccess}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending
                </span>
              ) : (
                'Send'
              )}
            </button>
          </div>
        </form>
      </div>
    </PremiumFeatureGuard>
  );
} 