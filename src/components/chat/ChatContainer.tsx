import React, { useState, useEffect } from 'react';
import { Message } from '../../services/modelService';
import { useAiAssistant } from '../../services/aiAssistantService';
import { useDocumentStore } from '../../stores/documentStore';
import ResearchAssistant from '../ResearchAssistant';
import WorkflowSuggestions from '../WorkflowSuggestions';

interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
}

/**
 * Container component that wraps the chat interface with research tools
 */
const ChatContainer: React.FC<ChatContainerProps> = ({
  messages,
  onSendMessage,
  isLoading = false
}) => {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const aiAssistant = useAiAssistant();
  const currentDocument = useDocumentStore(state => state.getCurrentDocument());
  
  // Generate workflow suggestions when messages change
  useEffect(() => {
    const generateSuggestions = async () => {
      if (!currentDocument || messages.length === 0) return;
      
      setSuggestionsLoading(true);
      try {
        const newSuggestions = await aiAssistant.generateProactiveSuggestions(messages, currentDocument);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Failed to generate workflow suggestions:', error);
      } finally {
        setSuggestionsLoading(false);
      }
    };
    
    // Only generate new suggestions when the assistant has responded
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      generateSuggestions();
    }
  }, [messages, currentDocument, aiAssistant]);
  
  // Handle sending a message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };
  
  // Handle clicking a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
    setInput('');
    // Clear suggestions after clicking one
    setSuggestions([]);
  };
  
  return (
    <div className="chat-container flex flex-col h-full">
      <div className="chat-content flex-1 flex">
        {/* Main chat area */}
        <div className="chat-messages flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-40 backdrop-blur-sm bg-background bevel-glass rounded-md shadow-subtle">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mb-4 text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <p className="text-sm">Start a conversation with your document</p>
              <p className="text-xs mt-2">Upload a document to analyze or ask questions directly.</p>
            </div>
          ) : (
            <>
              {/* Render messages */}
              {messages.map((message, index) => (
                <div 
                  key={index} 
                  className={`message flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-3/4 rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground bevel-neumorphic shadow-subtle' 
                        : 'bg-muted/40 border border-border bevel-glass shadow-3d'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}
              
              {/* Show workflow suggestions after assistant messages */}
              {messages.length > 0 && messages[messages.length - 1].role === 'assistant' && (
                <WorkflowSuggestions 
                  suggestions={suggestions} 
                  onSuggestionClick={handleSuggestionClick}
                  loading={suggestionsLoading}
                />
              )}
              
              {/* Show loading indicator if waiting for response */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted/40 border border-border rounded-lg p-3 bevel-glass shadow-subtle">
                    <div className="flex items-center">
                      <div className="animate-pulse flex space-x-1">
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                        <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Research Assistant panel - only show when document is loaded */}
        {currentDocument && (
          <div className="research-sidebar w-64 border-l border-border p-3 hidden lg:block">
            {/* ResearchAssistant moved to right sidebar only 
            <ResearchAssistant 
              messages={messages} 
              onSuggestionClick={handleSuggestionClick} 
            />
            */}
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="chat-input border-t border-border p-3 bg-gradient-to-r from-muted/30 to-background/60 backdrop-blur-sm rounded-b-md">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currentDocument ? "Ask about your document..." : "Type a message..."}
            className="flex-1 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bevel-glass shadow-inner bg-background/50 backdrop-blur-sm"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2 rounded-md bg-primary text-primary-foreground disabled:opacity-50 bevel-neumorphic shadow-subtle hover:shadow-none transition-shadow duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer; 