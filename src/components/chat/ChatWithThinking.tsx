import React, { useState, FormEvent } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import ThinkingMode from '../thinking/ThinkingMode';
import { generateWithThinking } from '../../api/thinking';
import { userPreferencesStore } from '../../stores/userPreferencesStore';
import { MessageSquare, Send, Loader2, Settings } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatWithThinking: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingContent, setThinkingContent] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const { showThinkingProcess } = userPreferencesStore();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: uuidv4(),
      content: input,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await generateWithThinking(input);
      
      if (showThinkingProcess && response.thinking) {
        setThinkingContent(response.thinking);
        setIsThinking(true);
      } else {
        // If thinking mode is disabled, just add the response
        const assistantMessage: Message = {
          id: uuidv4(),
          content: response.answer || 'Sorry, I couldn\'t generate a response.',
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: uuidv4(),
        content: 'Sorry, I encountered an error while processing your request.',
        role: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleThinkingComplete = () => {
    // Add the assistant's response with final answer
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      try {
        // Call API again or use stored response
        const assistantMessage: Message = {
          id: uuidv4(),
          content: thinkingContent.split('<answer>')[1]?.trim() || 'I\'ve completed my thinking.',
          role: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsThinking(false);
        setThinkingContent('');
      } catch (error) {
        console.error('Error processing thinking result:', error);
      }
    }
  };

  const formatTimestamp = (date: Date) => {
    return format(date, 'h:mm a');
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/90 backdrop-blur-sm border-border bevel-glass shadow-subtle">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 text-primary mr-2" />
          <h2 className="font-semibold">GenieAgent Chat</h2>
        </div>
        <button 
          onClick={() => alert('Open AI Settings')}
          className="p-2 rounded-full hover:bg-muted/50 bevel-neumorphic shadow-subtle"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-40 backdrop-blur-sm bg-background/50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-3 text-muted" />
            <h3 className="text-lg font-medium mb-1">Welcome to GenieAgent</h3>
            <p className="max-w-md">
              Ask me anything and I'll provide helpful answers. {showThinkingProcess && "With thinking mode enabled, you'll see my reasoning process."}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div 
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground bevel-neumorphic shadow-subtle' 
                    : 'bg-background bevel-glass shadow-3d border border-border'
                }`}
              >
                <div className="mb-1">{message.content}</div>
                <div 
                  className={`text-xs ${
                    message.role === 'user' 
                      ? 'text-primary-foreground/80' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isThinking && (
          <ThinkingMode 
            thinking={thinkingContent} 
            onComplete={handleThinkingComplete} 
          />
        )}
        
        {isLoading && !isThinking && (
          <div className="flex justify-start">
            <div className="bg-background bevel-glass rounded-lg px-4 py-2 shadow-3d border border-border">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          </div>
        )}
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-gradient-to-r from-muted/30 to-background/60 backdrop-blur-sm">
        <div className="flex rounded-lg border border-border overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 bevel-glass shadow-inner bg-background/50 backdrop-blur-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-2 bg-transparent focus:outline-none"
            placeholder="Type your message..."
            disabled={isLoading || isThinking}
          />
          <button
            type="submit"
            className={`p-2 bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed bevel-neumorphic ${
              isLoading || isThinking ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-none transition-shadow duration-200'
            }`}
            disabled={isLoading || isThinking}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWithThinking; 