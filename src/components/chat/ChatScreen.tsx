import React, { useState, useEffect, useRef } from 'react';
import { useModelStore } from '@stores/model/modelStore';
import { useModeStore } from '@stores/model/modeStore';
import { useThemeStore } from '@stores/theme/themeStore';
import { usePromptStore } from '@stores/promptStore';
import { useChatStore } from '@stores/chat/chatStore';
import { useSidebarStore } from '@stores/ui/sidebarStore';
import { cn } from '@utils/cn';
import { 
  Bot, 
  Send, 
  Loader2, 
  MoreVertical, 
  Pin, 
  PinOff, 
  Save, 
  Trash, 
  Edit, 
  X,
  Paperclip,
  Download,
  Mic,
  MicOff,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';

// Update Window interface with proper types
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

// Update ChatMessage interface to include attachments
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

// Update SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface Attachment {
  id: string;
  type: 'image' | 'document' | 'audio' | 'other';
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
}

interface VoiceState {
  isRecording: boolean;
  transcript: string;
  error: string | null;
}

interface ExportFormat {
  type: 'pdf' | 'docx' | 'txt' | 'markdown' | 'html';
  icon: React.ElementType;
  label: string;
  mimeType: string;
}

const EXPORT_FORMATS: ExportFormat[] = [
  { type: 'pdf', icon: FileText, label: 'PDF', mimeType: 'application/pdf' },
  { type: 'docx', icon: File, label: 'Word', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { type: 'txt', icon: File, label: 'Text', mimeType: 'text/plain' },
  { type: 'markdown', icon: File, label: 'Markdown', mimeType: 'text/markdown' },
  { type: 'html', icon: File, label: 'HTML', mimeType: 'text/html' }
];

const ALLOWED_FILE_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg']
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface ChatScreenProps {
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

const COLLAPSED_WIDTH = 50; // Width when collapsed

// Add SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

// Add SpeechRecognition interface
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

// Add new function before createModeFromDescription
const parseWorkflowSteps = (input: string): string[] => {
  // Look for numbered steps, bullet points, or step-by-step instructions
  const stepPatterns = [
    /\d+\.\s*([^\n]+)/g,  // Numbered steps
    /[-•]\s*([^\n]+)/g,   // Bullet points
    /step\s*\d+:\s*([^\n]+)/gi,  // "Step X:" format
    /process\s*\d+:\s*([^\n]+)/gi // "Process X:" format
  ];

  let steps: string[] = [];
  for (const pattern of stepPatterns) {
    const matches = input.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        steps.push(match[1].trim());
      }
    }
  }

  // If no structured steps found, try to split by newlines or periods
  if (steps.length === 0) {
    steps = input
      .split(/[\n.]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  return steps;
};

// Update createModeFromDescription function
const createModeFromDescription = (input: string) => {
  // Extract mode name if provided in format "Create mode: [name]" or similar
  const nameMatch = input.match(/create\s+(?:mode|agent|workflow):\s*([^,\n]+)/i);
  const modeName = nameMatch ? nameMatch[1].trim() : 'Custom Mode';
  
  // Parse workflow steps from the input
  const workflowSteps = parseWorkflowSteps(input);
  
  // Generate workflow instructions from steps
  const workflowInstructions = workflowSteps.length > 0 
    ? `Follow these specific steps in order:

${workflowSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

For each step:
• Confirm completion before moving to next step
• Report any issues or blockers
• Provide relevant output or results
• Ask for clarification if needed`
    : '';

  // Generate a unique ID
  const modeId = `custom_${Date.now()}`;
  
  return {
    id: modeId,
    name: modeName,
    description: 'Custom workflow agent created from chat',
    systemPrompt: `You are a specialized workflow agent that follows specific steps and processes. ${workflowInstructions}

General Guidelines:
• Follow the specified workflow steps precisely
• Maintain clear communication about current step
• Provide progress updates
• Handle errors gracefully
• Ask for clarification when needed
• Document all actions taken

${input}`,
    temperature: 0.7,
    icon: '🔄',
    category: 'Workflow',
    tags: ['custom', 'workflow', 'process'],
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0.3,
    presencePenalty: 0.3,
    customInstructions: [
      'Follow workflow steps in order',
      'Confirm completion of each step',
      'Document process and results',
      'Maintain consistent formatting',
      ...workflowSteps
    ]
  };
};

export default function ChatScreen({ onMessagesChange }: ChatScreenProps) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { modelService } = useModelStore();
  const { activeMode, modes, addCustomMode, setActiveMode } = useModeStore();
  const currentMode = modes.find(m => m.id === activeMode);
  const { proprietaryPrompt, updatePrompt } = usePromptStore();
  const { 
    chats, 
    activeChat, 
    savedChats, 
    pinnedChats,
    createChat, 
    addMessage, 
    getChat,
    saveChat,
    unsaveChat,
    pinChat,
    unpinChat,
    deleteChat,
    clearAllChats,
    updateChatTitle
  } = useChatStore();
  const { width, isCollapsed } = useSidebarStore();

  // Add state for chat management
  const [editingTitle, setEditingTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Add new state for streaming
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Add new state for features
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    transcript: '',
    error: null
  });

  // Voice recognition setup
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI: SpeechRecognitionConstructor = 
        window.SpeechRecognition || window.webkitSpeechRecognition;
        
      if (SpeechRecognitionAPI) {
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[event.resultIndex];
          if (result.isFinal) {
            setInput((prev) => prev + result[0].transcript + ' ');
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          setVoiceState(prev => ({
            ...prev,
            error: event.message || event.error || 'An error occurred with voice input'
          }));
        };

        setRecognition(recognition);
      }
    }
  }, []);

  // Initialize special prompt if not already set
  useEffect(() => {
    if (!proprietaryPrompt.systemPrompt) {
      updatePrompt({
        systemPrompt: `You are a highly capable AI assistant focused on completing tasks thoroughly and maintaining conversation continuity. Format your responses as follows:

<title>Clean Formatting Guidelines</title>
1. Text Elements:
   • Use <title>Section Name</title> for all headings
   • Use <key>important term</key> for emphasis
   • Never use hashtags (#) or asterisks (*) for formatting
   • Avoid markdown syntax

2. List Structure:
   • Use "•" for bullet points
   • Use "1." for numbered steps
   • Use "a)" for sub-points
   • Use proper indentation for clarity

3. Content Organization:
   • Begin with a clear title
   • Group related information under sections
   • Use bullet points for lists
   • Use numbers for sequential steps
   • Keep paragraphs clean and well-spaced

4. Special Cases:
   • Only use symbols when part of technical syntax
   • Only use asterisks when showing literal programming syntax
   • Only use hashtags when referring to actual hashtags
   • Otherwise, rely on clean text and proper spacing

Example Format:
<title>Main Topic</title>
• First point about <key>important concept</key>
• Second point with details

<title>Process Steps</title>
1. First step to accomplish task
2. Second step with details
   a) Sub-step information
   b) Additional details

<title>Additional Information</title>
• Supporting details
• Related concepts

Remember: Keep formatting clean and minimal, using only the specified tags and formatting structures.`,
        
        contextPrompt: `Maintain clean formatting in all responses:

• Use title and key tags appropriately
• Use clean bullet points and numbers
• Avoid special characters and markdown
• Keep spacing consistent and clean
• Focus on readability and clarity`,
        
        responseFormat: 'natural'
      });
    }
  }, [proprietaryPrompt.systemPrompt, updatePrompt]);

  // Create a new chat if there isn't an active one
  useEffect(() => {
    if (!activeChat) {
      createChat();
    }
  }, [activeChat, createChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  const currentChat = activeChat ? getChat(activeChat) : null;
  const messages = currentChat?.messages || [];

  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  // Add handlers for chat management
  const handleSaveChat = (chatId: string) => {
    if (savedChats.includes(chatId)) {
      unsaveChat(chatId);
    } else {
      saveChat(chatId);
    }
  };

  const handlePinChat = (chatId: string) => {
    if (pinnedChats.includes(chatId)) {
      unpinChat(chatId);
    } else {
      pinChat(chatId);
    }
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
  };

  const handleUpdateTitle = () => {
    if (activeChat && editingTitle.trim()) {
      updateChatTitle(activeChat, editingTitle.trim());
      setIsEditing(false);
    }
  };

  const handleClearAllChats = () => {
    clearAllChats();
    setShowClearConfirm(false);
  };

  // Handle file attachment
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name} is too large (max: ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
          continue;
        }

        const type = Object.entries(ALLOWED_FILE_TYPES).find(([_, types]) => 
          types.includes(file.type)
        )?.[0] as Attachment['type'];

        if (!type) {
          errors.push(`${file.name}: Unsupported file type (${file.type})`);
          continue;
        }

        // Create a blob URL for preview
        const url = URL.createObjectURL(file);

        // For images, create a thumbnail preview
        let thumbnailUrl = url;
        if (type === 'image') {
          try {
            thumbnailUrl = await createImageThumbnail(file);
          } catch (error) {
            console.warn('Failed to create thumbnail:', error);
            // Fall back to original URL
          }
        }

        newAttachments.push({
          id: crypto.randomUUID(),
          type,
          name: file.name,
          url,
          thumbnailUrl,
          size: file.size,
          mimeType: file.type
        });
      } catch (error) {
        errors.push(`Failed to process ${file.name}: ${error}`);
      }
    }

    if (errors.length > 0) {
      alert('Some files could not be attached:\n\n' + errors.join('\n'));
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    event.target.value = ''; // Reset input
  };

  // Add helper function for creating image thumbnails
  const createImageThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);
        try {
          // Calculate thumbnail size (max 200px width/height)
          const MAX_SIZE = 200;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > MAX_SIZE) {
              height = height * (MAX_SIZE / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = width * (MAX_SIZE / height);
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to WebP for better compression
          const thumbnailUrl = canvas.toDataURL('image/webp', 0.8);
          resolve(thumbnailUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load image'));
      };

      img.src = url;
    });
  };

  // Handle voice recording
  const toggleVoiceRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (voiceState.isRecording) {
      recognition.stop();
      setVoiceState(prev => ({ ...prev, isRecording: false }));
    } else {
      recognition.start();
      setVoiceState(prev => ({ ...prev, isRecording: true, error: null }));
    }
  };

  // Handle export
  const handleExport = async (format: ExportFormat['type']) => {
    if (!currentChat) return;

    const title = currentChat.title || 'Chat Export';
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;

    try {
      let content: string;
      let blob: Blob;

      switch (format) {
        case 'txt':
          content = messages.map(msg => 
            `[${msg.role.toUpperCase()}]\n${msg.content}\n`
          ).join('\n---\n\n');
          blob = new Blob([content], { type: 'text/plain' });
          downloadFile(`${filename}.txt`, blob);
          break;

        case 'markdown':
          content = `# ${title}\n\n` + messages.map(msg =>
            `## ${msg.role.toUpperCase()}\n\n${msg.content}`
          ).join('\n\n---\n\n');
          blob = new Blob([content], { type: 'text/markdown' });
          downloadFile(`${filename}.md`, blob);
          break;

        case 'html':
          content = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    .message { margin-bottom: 1.5rem; padding: 1rem; border-radius: 0.5rem; }
    .user { background-color: #f3f4f6; }
    .assistant { background-color: #e5e7eb; }
    .role { font-weight: bold; margin-bottom: 0.5rem; }
    .content { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${messages.map(msg => `
    <div class="message ${msg.role}">
      <div class="role">${msg.role.toUpperCase()}</div>
      <div class="content">${msg.content}</div>
    </div>
  `).join('')}
</body>
</html>`;
          blob = new Blob([content], { type: 'text/html' });
          downloadFile(`${filename}.html`, blob);
          break;

        case 'pdf':
        case 'docx':
          alert(`${format.toUpperCase()} export is not yet implemented. Please use another format.`);
          break;
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export chat. Please try another format.');
    }

    setShowExportMenu(false);
  };

  // Add helper function for downloading files
  const downloadFile = (filename: string, blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Remove attachment
  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment) {
        URL.revokeObjectURL(attachment.url);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  // Update handleCreateMode function
  const handleCreateMode = (input: string) => {
    // Check if input is requesting to create a mode or agent
    if (input.toLowerCase().includes('create mode:') || 
        input.toLowerCase().includes('create agent:') ||
        input.toLowerCase().includes('create workflow:')) {
      const newMode = createModeFromDescription(input);
      addCustomMode(newMode);
      setActiveMode(newMode.id);
      
      // Add confirmation message to chat
      if (activeChat) {
        addMessage(activeChat, {
          role: 'assistant',
          content: `I've created a new ${newMode.category.toLowerCase()} agent "${newMode.name}" with ${newMode.customInstructions.length - 4} workflow steps. The agent has been activated and will follow these steps in our conversation. You can further customize this agent in the sidebar settings if needed.

<title>Workflow Steps</title>
${newMode.customInstructions.slice(4).map((step, i) => `${i + 1}. ${step}`).join('\n')}`
        });
      }
      return true;
    }
    return false;
  };

  // Update handleSubmit to check for mode creation
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || !activeChat) return;

    // Check if this is a mode creation request
    if (handleCreateMode(input)) {
      setInput('');
      return;
    }

    const userMessage = {
      role: 'user' as const,
      content: input,
      attachments
    };

    // Reset attachments after sending
    setAttachments([]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      // Get current chat history
      const chatHistory = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      // Prepare messages array with system prompts and chat history
      const systemMessages = [
        {
          role: 'system' as const,
          content: proprietaryPrompt.systemPrompt
        },
        {
          role: 'system' as const,
          content: proprietaryPrompt.contextPrompt
        },
        {
          role: 'system' as const,
          content: currentMode?.systemPrompt || ''
        },
        {
          role: 'system' as const,
          content: `Additional Instructions for Response Continuity:
1. Never leave a thought or explanation incomplete
2. If you need more space, explicitly state "Let me continue..." and keep going
3. Complete all points in a list or all steps in a process
4. If explaining something complex, break it into sections but complete each section
5. After completing your response, ask if any clarification is needed
6. If the user says "continue" or similar, resume your previous explanation
7. Always maintain context from previous messages
8. End your response with a clear indication if you're done or need to continue`
        }
      ].filter(msg => msg.content);

      // Add conversation markers to help maintain context
      const conversationMarkers = chatHistory.length > 0 ? [
        {
          role: 'system' as const,
          content: '--- Previous conversation context ---'
        },
        ...chatHistory,
        {
          role: 'system' as const,
          content: '--- Current exchange ---'
        }
      ] : [];

      // Combine everything
      const fullHistory = [
        ...systemMessages,
        ...conversationMarkers,
        userMessage
      ];

      // Add user message first to maintain conversation flow
      addMessage(activeChat, userMessage);

      try {
        // Use streaming response
        const streamResponse = await modelService.generateChatStream(fullHistory);
        let accumulatedResponse = '';

        for await (const chunk of streamResponse) {
          accumulatedResponse += chunk;
          setStreamingMessage(accumulatedResponse);
        }

        // After streaming is complete, add the message to chat history
        const assistantMessage = {
          role: 'assistant' as const,
          content: formatResponse(accumulatedResponse, proprietaryPrompt.responseFormat)
        };
        
        addMessage(activeChat, assistantMessage);
      } catch (error: any) {
        // If we get a RECITATION error, try again with a modified system prompt
        if (error.message?.includes('RECITATION')) {
          const retryHistory = [
            {
              role: 'system' as const,
              content: 'You are a helpful AI assistant. Provide original responses using your own words and understanding.'
            },
            userMessage
          ];

          const retryResponse = await modelService.generateChatStream(retryHistory);
          let accumulatedResponse = '';

          for await (const chunk of retryResponse) {
            accumulatedResponse += chunk;
            setStreamingMessage(accumulatedResponse);
          }

          const assistantMessage = {
            role: 'assistant' as const,
            content: formatResponse(accumulatedResponse, proprietaryPrompt.responseFormat)
          };
          
          addMessage(activeChat, assistantMessage);
        } else {
          throw error; // Re-throw if it's not a RECITATION error
        }
      }
    } catch (error) {
      console.error('Error generating response:', error);
      addMessage(activeChat, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while generating a response. Please try again.'
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  const formatResponse = (content: string, format: string): string => {
    // Remove any auto-added disclaimers or warnings
    return content
      .replace(/^(Content Warning|Disclaimer|Note|Warning):.+?\n/gi, '')
      .replace(/^I apologize.+?\n/gi, '')
      .replace(/^I cannot.+?\n/gi, '')
      .trim();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Add chat management header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={handleUpdateTitle}
                onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
                className="px-2 py-1 text-sm border rounded-md"
                autoFocus
              />
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold">
                {currentChat?.title || 'New Chat'}
              </h2>
              <button
                onClick={() => {
                  setEditingTitle(currentChat?.title || '');
                  setIsEditing(true);
                }}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <Edit className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeChat && (
            <>
              <button
                onClick={() => handleSaveChat(activeChat)}
                className={cn(
                  "p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                  savedChats.includes(activeChat) && "text-blue-500"
                )}
                title={savedChats.includes(activeChat) ? "Unsave chat" : "Save chat"}
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => handlePinChat(activeChat)}
                className={cn(
                  "p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800",
                  pinnedChats.includes(activeChat) && "text-blue-500"
                )}
                title={pinnedChats.includes(activeChat) ? "Unpin chat" : "Pin chat"}
              >
                {pinnedChats.includes(activeChat) ? (
                  <PinOff className="w-4 h-4" />
                ) : (
                  <Pin className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => handleDeleteChat(activeChat)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-red-500"
                title="Delete chat"
              >
                <Trash className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => setShowClearConfirm(true)}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Clear all chats"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clear all confirmation dialog */}
      {showClearConfirm && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-background p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Clear All Chats?</h3>
            <p className="text-sm text-gray-500 mb-4">
              This action cannot be undone. All chats will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllChats}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      <div 
        className="flex-1 overflow-y-auto scroll-smooth"
        style={{
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div 
          className="w-full mx-auto p-4 space-y-4 transition-all duration-300"
          style={{ 
            maxWidth: 'calc(100% - 24px)',
            paddingRight: isCollapsed ? COLLAPSED_WIDTH + 24 : width + 24
          }}
        >
          {messages.length === 0 && !isStreaming && (
            <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with the assistant...</p>
              </div>
            </div>
          )}
          {messages.map((message: ChatMessage) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3 p-4 rounded-lg",
                message.role === 'assistant' 
                  ? "bg-muted/60 backdrop-blur-sm" 
                  : "bg-primary/5"
              )}
            >
              {message.role === 'assistant' && (
                <Bot className="h-6 w-6 flex-shrink-0 text-primary" />
              )}
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">
                  {message.role === 'assistant' ? currentMode?.name || 'Assistant' : 'You'}
                </div>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {message.attachments.map((attachment: Attachment) => (
                      <div
                        key={attachment.id}
                        className="relative group rounded-lg overflow-hidden border border-border"
                      >
                        {attachment.type === 'image' ? (
                          <div className="relative aspect-square">
                            <img
                              src={attachment.thumbnailUrl || attachment.url}
                              alt={attachment.name}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center"
                            >
                              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                View Full Size
                              </span>
                            </a>
                          </div>
                        ) : (
                          <div className="p-3 bg-muted">
                            <div className="flex items-center gap-2">
                              {attachment.type === 'document' ? (
                                <FileText className="w-4 h-4" />
                              ) : attachment.type === 'audio' ? (
                                <File className="w-4 h-4" />
                              ) : (
                                <File className="w-4 h-4" />
                              )}
                              <a
                                href={attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm truncate hover:underline"
                              >
                                {attachment.name}
                              </a>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {(attachment.size / 1024).toFixed(1)} KB
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isStreaming && (
            <div className={cn(
              "flex gap-3 p-4 rounded-lg",
              "bg-muted/60 backdrop-blur-sm"
            )}>
              <Bot className="h-6 w-6 flex-shrink-0 text-primary" />
              <div className="flex-1 space-y-2">
                <div className="text-sm font-medium">
                  {currentMode?.name || 'Assistant'}
                </div>
                <div className="text-sm whitespace-pre-wrap break-words">
                  {streamingMessage}
                  <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="p-2 border-b border-border">
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="relative group flex items-center gap-2 p-2 bg-muted rounded-lg"
                >
                  {attachment.type === 'image' ? (
                    <ImageIcon className="w-4 h-4" />
                  ) : attachment.type === 'document' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <File className="w-4 h-4" />
                  )}
                  <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="absolute -top-1 -right-1 p-1 rounded-full bg-background border border-border hover:bg-muted"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <form 
          onSubmit={handleSubmit} 
          className="w-full mx-auto p-4 transition-all duration-300"
          style={{ 
            maxWidth: 'calc(100% - 24px)',
            paddingRight: isCollapsed ? COLLAPSED_WIDTH + 24 : width + 24
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {/* File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                multiple
                accept={Object.values(ALLOWED_FILE_TYPES).flat().join(',')}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Attach files"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Voice Input */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  voiceState.isRecording ? "text-red-500 bg-red-100" : "hover:bg-muted"
                )}
                title={voiceState.isRecording ? "Stop recording" : "Start voice input"}
              >
                {voiceState.isRecording ? (
                  <MicOff className="w-5 h-5" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </button>

              {/* Export Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Export chat"
                >
                  <Download className="w-5 h-5" />
                </button>

                {/* Export Menu */}
                {showExportMenu && (
                  <div className="absolute bottom-full left-0 mb-2 p-2 bg-background border border-border rounded-lg shadow-lg">
                    <div className="space-y-1">
                      {EXPORT_FORMATS.map((format) => (
                        <button
                          key={format.type}
                          onClick={() => handleExport(format.type)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-muted"
                        >
                          <format.icon className="w-4 h-4" />
                          <span>Export as {format.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Main Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={voiceState.isRecording ? 'Listening...' : `Message ${currentMode?.name || 'Assistant'}...`}
                className="flex-1 px-4 py-3 rounded-lg border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || voiceState.isRecording}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                className={cn(
                  "px-4 py-3 rounded-lg transition-colors flex items-center justify-center min-w-[48px]",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Voice Error Message */}
            {voiceState.error && (
              <p className="text-sm text-red-500">
                Error with voice input: {voiceState.error}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}