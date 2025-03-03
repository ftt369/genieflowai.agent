import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Paperclip, Mic, X, Image, FileText, Code, Search, Brain, Lightbulb, Globe, Database, Upload, Sparkles, Code2, Globe2 } from 'lucide-react';
import { useThreadStore } from '../store/threadStore';

interface Attachment {
  name: string;
  type: string;
  size: number;
}

interface ThreadMessage {
  role: 'user' | 'assistant';
  content: string;
  attachments?: Attachment[];
}

interface Category {
  id: string;
  icon: JSX.Element;
  name: string;
  description: string;
  color: string;
}

const categories: Category[] = [
  {
    id: 'research',
    icon: <Search className="h-5 w-5" />,
    name: 'Research',
    description: 'Search and analyze research papers',
    color: 'from-blue-500/20 to-blue-500/10 hover:from-blue-500/30 hover:to-blue-500/20'
  },
  {
    id: 'coding',
    icon: <Code2 className="h-5 w-5" />,
    name: 'Coding',
    description: 'Write and review code',
    color: 'from-emerald-500/20 to-emerald-500/10 hover:from-emerald-500/30 hover:to-emerald-500/20'
  },
  {
    id: 'analysis',
    icon: <Brain className="h-5 w-5" />,
    name: 'Analysis',
    description: 'Analyze data and trends',
    color: 'from-purple-500/20 to-purple-500/10 hover:from-purple-500/30 hover:to-purple-500/20'
  },
  {
    id: 'creative',
    icon: <Lightbulb className="h-5 w-5" />,
    name: 'Creative',
    description: 'Generate creative content',
    color: 'from-yellow-500/20 to-yellow-500/10 hover:from-yellow-500/30 hover:to-yellow-500/20'
  },
  {
    id: 'translation',
    icon: <Globe2 className="h-5 w-5" />,
    name: 'Translation',
    description: 'Translate between languages',
    color: 'from-red-500/20 to-red-500/10 hover:from-red-500/30 hover:to-red-500/20'
  },
  {
    id: 'data',
    icon: <Database className="h-5 w-5" />,
    name: 'Data',
    description: 'Process and analyze data',
    color: 'from-sky-500/20 to-sky-500/10 hover:from-sky-500/30 hover:to-sky-500/20'
  }
];

export default function NewThreadPage() {
  const { createThread, addMessage } = useThreadStore();
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || attachments.length > 0) {
      setIsSubmitting(true);
      const threadId = createThread();
      
      const newMessage: Omit<ThreadMessage, 'id' | 'timestamp'> = {
        role: 'user',
        content: message,
        attachments: attachments.map(file => ({
          name: file.name,
          type: file.type,
          size: file.size
        }))
      };
      
      await addMessage(threadId, newMessage);
      setMessage('');
      setAttachments([]);
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        return true;
      });
      setAttachments(prev => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Handle recording logic
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check your permissions.');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Welcome Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
          Welcome! How can I help you today?
        </h1>
        <p className="text-lg text-muted-foreground text-center max-w-2xl">
          I'm your AI assistant, ready to help with research, coding, analysis, and more. Choose a
          category below or start typing your question.
        </p>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl mt-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg border border-input bg-gradient-to-b ${category.color}
                         transition-all duration-300 group flex items-start space-x-4
                         ${selectedCategory === category.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              <div className="rounded-md bg-background/50 p-2 backdrop-blur-sm">
                {category.icon}
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">{category.name}</span>
                <span className="text-sm text-muted-foreground">{category.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-input bg-card/50 backdrop-blur-sm">
        <div className="relative max-w-4xl mx-auto flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-4 pr-24 rounded-lg border border-input bg-background/50 backdrop-blur-sm
                     focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
          />
          <div className="absolute right-2 flex items-center space-x-2">
            <button className="p-2 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground">
              <Mic className="h-5 w-5" />
            </button>
            <button 
              className="p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors flex items-center space-x-2"
              disabled={!message}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-2 text-xs text-center text-muted-foreground">
          Press Enter to send, Shift + Enter for new line
        </div>
      </div>
    </div>
  );
}