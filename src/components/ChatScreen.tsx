import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../services/modelService';
import { useModelStore } from '../stores/modelStore';
import ModelSelector from './ModelSelector';

interface ChatMessage extends Message {
  id: string;
}

export default function ChatScreen() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { modelService } = useModelStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const allMessages: Message[] = [...messages, userMessage];
      const response = await modelService.generateChat(allMessages);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900">
      <div className="flex-none p-4 border-b border-gray-800">
        <ModelSelector />
      </div>

      <div className="flex-grow overflow-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-2xl">
              ✨
            </div>
            <h1 className="text-4xl font-bold mb-4 text-white/90">
              Welcome! How can I help you today?
            </h1>
            <p className="text-lg text-white/60 max-w-2xl">
              I'm your AI assistant, ready to help with research, coding, analysis, and more.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-8">
              <button 
                className="p-4 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-white"
                onClick={() => setInput("Help me research a topic")}
              >
                Research
              </button>
              <button 
                className="p-4 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-white"
                onClick={() => setInput("Help me with coding")}
              >
                Coding
              </button>
              <button 
                className="p-4 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-white"
                onClick={() => setInput("Help me analyze data")}
              >
                Analysis
              </button>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-white/90'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-none p-4 border-t border-gray-800">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message... (Press / to focus)"
            className="flex-1 bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded-lg ${
              isLoading
                ? 'bg-blue-500/50 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            } text-white font-medium`}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
} 