import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { useModelStore } from '@/stores/model/modelStore';
import { useModeStore } from '@/stores/model/modeStore';
import { useThemeStore } from '@/stores/theme/themeStore';
import { usePromptStore } from '@/stores/promptStore';
import { useChatStore } from '@/stores/chat/chatStore';
import { useSidebarStore } from '@/stores/ui/sidebarStore';
import { cn } from '@/utils/cn';
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
  File,
  Trash2,
  Copy,
  Check,
  Sparkles
} from 'lucide-react';
import type { ChatMessage as BaseChatMessage } from '@/types/chat';
import { extractFileContent, createImageThumbnail } from '../../utils/fileUtils';
import AttachmentPreview from './AttachmentPreview';
import Notification, { NotificationContainer } from '../ui/Notification';
import FileDropZone from './FileDropZone';

// Extend the base ChatMessage type with additional properties
interface ExtendedChatMessage extends Omit<BaseChatMessage, 'role'> {
  role: 'user' | 'assistant';  // Restrict roles to just user and assistant
  timestamp?: Date;
  attachments?: Attachment[];
}

type ChatMessage = ExtendedChatMessage;

// Update Window interface with proper types
interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionConstructor;
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
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
  type: 'image' | 'document' | 'audio' | 'video' | 'other';
  name: string;
  url: string;
  thumbnailUrl?: string;
  size: number;
  mimeType: string;
  content?: string;
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
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/rtf',
    'application/x-rtf',
    'text/rtf',
    'text/plain',
    'text/markdown',
    'text/csv',
    'application/json',
    'text/javascript',
    'text/typescript',
    'text/html',
    'text/css',
    'application/xml',
    'text/xml'
  ],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp', 'image/tiff'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/flac'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

interface ChatScreenProps {
  onMessagesChange: (messages: ChatMessage[]) => void;
  isLeftSidebarCollapsed?: boolean;
  isRightSidebarOpen?: boolean;
  rightSidebarWidth?: number;
  onSidebarInteraction?: {
    search: (handler: (content: string) => Promise<void>) => void;
    copy: (content: string) => void;
    workflow: (content: string) => void;
  };
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

// Add UUID generation function for browser compatibility
function generateUUID() {
  // Simple UUID generation that doesn't rely on crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

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

// Remove conflicting imports and define utility functions inline
const getSystemMessages = (prompt: any, mode: string, modeList: any[]) => {
  const currentMode = modeList.find(m => m.id === mode);
  const defaultSystemPrompt = `You are a highly capable AI assistant focused on completing tasks thoroughly and maintaining conversation continuity.`;
  const defaultContextPrompt = `Process documents effectively:
• Extract key information from documents
• Analyze content thoroughly
• Maintain formatting where appropriate
• Provide relevant insights
• Handle multiple file types appropriately`;

  return [
    {
      role: 'system' as const,
      content: prompt?.systemPrompt || defaultSystemPrompt
    },
    {
      role: 'system' as const,
      content: prompt?.contextPrompt || defaultContextPrompt
    },
    {
      role: 'system' as const,
      content: currentMode?.systemPrompt || ''
    }
  ].filter(msg => msg.content);
};

const formatResponse = (content: string, format: string): string => {
  // Remove any auto-added disclaimers or warnings
  let cleanedContent = content
    .replace(/^(Content Warning|Disclaimer|Note|Warning):.+?\n/gi, '')
    .replace(/^I apologize.+?\n/gi, '')
    .replace(/^I cannot.+?\n/gi, '')
    .trim();
    
  // Format headers to be larger and bolder
  let formattedContent = cleanedContent
    // Format markdown headers with HTML for better display
    .replace(/^### (.*?)$/gm, '<h3 class="text-xl font-bold my-2">$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2 class="text-2xl font-bold my-3">$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1 class="text-3xl font-bold my-4">$1</h1>')
    
    // Format section markers like #### ** Introduction ** to proper headings
    .replace(/^#{1,4}\s*\*\*\s*(.*?)\s*\*\*$/gm, '<h3 class="text-xl font-bold my-3">$1</h3>')
    
    // Format numbered lists
    .replace(/^(\d+)\.\s+(.*?)$/gm, '<div class="flex gap-2 my-1"><span class="font-medium">$1.</span><span>$2</span></div>')
    
    // Format bullet points
    .replace(/^[*-]\s+(.*?)$/gm, '<div class="flex gap-2 my-1"><span class="font-medium">•</span><span>$1</span></div>')
    
    // Format bold text
    .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>')
    
    // Format italic text
    .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
    
    // Format code blocks (preserve them but with styling)
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-slate-100 dark:bg-slate-800 p-3 rounded-md overflow-x-auto my-2"><code>$2</code></pre>')
    
    // Format inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm">$1</code>')
    
    // Format paragraphs
    .replace(/\n\n/g, '</p><p class="my-2">');
  
  // Wrap in paragraph tags if not already wrapped
  if (!formattedContent.startsWith('<')) {
    formattedContent = '<p class="my-2">' + formattedContent + '</p>';
  }
  
  return formattedContent;
};

// Add this function after the formatResponse function
const formatStreamingContent = (content: string): string => {
  // Use the same formatting logic as formatResponse
  return formatResponse(content, 'natural');
};

export default function ChatScreen({ 
  onMessagesChange, 
  isLeftSidebarCollapsed,
  isRightSidebarOpen,
  rightSidebarWidth = 500,
  onSidebarInteraction
}: ChatScreenProps) {
  // Basic state
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  
  // Store hooks
  const { modelService } = useModelStore();
  const { activeMode, modes, addCustomMode, setActiveMode } = useModeStore();
  const currentMode = modes.find(m => m.id === activeMode);
  const { proprietaryPrompt, updatePrompt } = usePromptStore();
  const { 
    chats, 
    activeChat, 
    getChat,
    addMessage,
    createChat,
    savedChats, 
    pinnedChats,
    saveChat,
    unsaveChat,
    pinChat,
    unpinChat,
    deleteChat,
    updateChatTitle
  } = useChatStore();

  const currentChat = activeChat ? getChat(activeChat) : null;
  const chatMessages = currentChat?.messages || [];

  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(chatMessages);
    }
  }, [chatMessages, onMessagesChange]);

  // Handle sidebar interactions
  useEffect(() => {
    if (!onSidebarInteraction || !activeChat) return;

    const handleSearch = (content: string): Promise<void> => {
      return new Promise((resolve) => {
        try {
          setInput(content);
          // Create a synthetic submit event
          const event = new Event('submit', { bubbles: true, cancelable: true }) as unknown as FormEvent;
          const form = document.querySelector('form');
          if (form) {
            handleSubmit(event)
              .then(() => {
                resolve();
              })
              .catch((error) => {
                console.error('Error in search submission:', error);
                // Still resolve the promise to prevent hanging
                resolve();
              });
          } else {
            console.warn('Form not found for search submission');
            resolve();
          }
        } catch (error) {
          console.error('Error setting up search:', error);
          resolve(); // Always resolve to prevent hanging
        }
      });
    };

    if (onSidebarInteraction.search) {
      onSidebarInteraction.search(handleSearch);
    }
  }, [onSidebarInteraction, activeChat]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedInput = input?.trim();
    if ((!trimmedInput && attachments.length === 0) || isLoading || !activeChat) return;
    
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');
    
    // Show notification if processing files
    if (attachments.length > 0) {
      const notificationId = generateUUID();
      setNotifications(prev => [...prev, {
        id: notificationId,
        type: 'info',
        title: 'Processing files',
        message: `Analyzing ${attachments.length} file(s)...`
      }]);
      
      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
      }, 5000);
    }
    
    const userMessage: Omit<ChatMessage, 'id'> = {
      role: 'user',
      content: trimmedInput || 'Attached file(s) for analysis',
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    try {
      // Add user message to chat immediately
      addMessage(activeChat, userMessage);
      setInput('');
      setAttachments([]); // Clear attachments after sending

      // Get system messages and chat history
      const systemMessages = getSystemMessages(proprietaryPrompt, activeMode, modes);
      const chatHistory = chatMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Prepare a message that includes file content for the AI
      let aiMessage = trimmedInput || '';
      
      // Add file content to the message
      if (attachments.length > 0) {
        if (aiMessage) aiMessage += '\n\n';
        aiMessage += 'Attached files:\n\n';
        
        for (const attachment of attachments) {
          aiMessage += `File: ${attachment.name} (${attachment.type})\n`;
          if (attachment.content) {
            aiMessage += `Content:\n${attachment.content}\n\n`;
          }
        }
      }

      // Get the stream response
      let accumulatedResponse = '';
      let errorOccurred = false;
      
      try {
        // Use the enhanced message with file content
        const streamResponse = await modelService.generateChatStream([
          ...systemMessages,
          ...chatHistory,
          { role: 'user' as const, content: aiMessage }
        ]);

        // Handle the streaming response in real-time
        for await (const chunk of streamResponse) {
          accumulatedResponse += chunk;
          setStreamingMessage(accumulatedResponse);
          // Scroll to bottom smoothly as new content arrives
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (streamError) {
        console.error('Error during streaming:', streamError);
        errorOccurred = true;
        
        // If we have some accumulated response, we'll still use it
        if (accumulatedResponse.length === 0) {
          // If we have no response at all, set a generic error message
          accumulatedResponse = "I'm sorry, I encountered an error while processing your request. Please try again with a simpler query.";
        } else {
          // If we have a partial response, append an error notice
          accumulatedResponse += "\n\n[Note: My response was cut off due to a technical issue. You may want to ask me to continue or rephrase your question.]";
        }
      }

      // Add the complete assistant message
      const assistantMessage = {
        role: 'assistant' as const,
        content: formatResponse(accumulatedResponse, proprietaryPrompt?.responseFormat || 'natural')
      };
      
      addMessage(activeChat, assistantMessage);
      
      // If there was an error, add a system message with error details
      if (errorOccurred) {
        addMessage(activeChat, {
          role: 'assistant' as const,
          content: "There was an issue with the AI's response. You may want to try again with a simpler query or different wording."
        });
      }
    } catch (error) {
      console.error('Error in chat submission:', error);
      
      // Add an error message to the chat
      addMessage(activeChat, {
        role: 'assistant' as const,
        content: "I'm sorry, I encountered an error and couldn't process your request. Please try again."
      });
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // UI State
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [editingTitle, setEditingTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showWorkflowCreate, setShowWorkflowCreate] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'loading';
    title: string;
    message?: string;
  }>>([]);

  // Voice recognition state
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    transcript: '',
    error: null
  });
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = 
        window.SpeechRecognition || window.webkitSpeechRecognition;
        
      if (SpeechRecognitionAPI) {
        const recognitionInstance = new SpeechRecognitionAPI();
        recognitionInstance.continuous = true;
        recognitionInstance.interimResults = true;

        recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
          const result = event.results[event.resultIndex];
          if (result.isFinal) {
            setInput((prev) => prev + result[0].transcript + ' ');
          }
        };

        recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
          setVoiceState(prev => ({
            ...prev,
            error: event.message || event.error || 'An error occurred with voice input'
          }));
        };

        setRecognition(recognitionInstance);
      }
    }
  }, []);

  // Initialize special prompt if not already set
  useEffect(() => {
    if (!proprietaryPrompt?.systemPrompt) {
      updatePrompt({
        systemPrompt: `You are a highly capable AI assistant focused on completing tasks thoroughly and maintaining conversation continuity.`,
        contextPrompt: `Process documents effectively:
• Extract key information from documents
• Analyze content thoroughly
• Maintain formatting where appropriate
• Provide relevant insights
• Handle multiple file types appropriately`,
        responseFormat: 'natural'
      });
    }
  }, [proprietaryPrompt, updatePrompt]);

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
    // This function is no longer used in the new implementation
  };

  // Enhanced file handling function
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    const errors: string[] = [];
    const notificationId = generateUUID();

    // Show loading notification
    setNotifications(prev => [...prev, {
      id: notificationId,
      type: 'loading',
      title: 'Processing files',
      message: `Processing ${files.length} file(s)...`
    }]);

    for (const file of files) {
      try {
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name} is too large (max: ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
          continue;
        }

        // Determine file type
        const type = Object.entries(ALLOWED_FILE_TYPES).find(([_, types]) => 
          types.includes(file.type)
        )?.[0] as Attachment['type'] || 'document';

        // Read file content using our improved utility
        const content = await extractFileContent(file);
        const url = URL.createObjectURL(file);

        // For images, create a thumbnail
        let thumbnailUrl = type === 'image' ? await createImageThumbnail(file) : undefined;

        const attachment: Attachment = {
          id: generateUUID(),
          type,
          name: file.name,
          url,
          thumbnailUrl,
          size: file.size,
          mimeType: file.type,
          content // Store the content for processing
        };

        newAttachments.push(attachment);
        
        // Remove the automatic content addition to input field
        // This prevents the unwanted message in the question box
      } catch (error) {
        errors.push(`Failed to process ${file.name}: ${error}`);
      }
    }

    // Remove loading notification and show result
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    if (errors.length > 0) {
      setNotifications(prev => [...prev, {
        id: generateUUID(),
        type: 'error',
        title: 'Error processing files',
        message: errors.join('\n')
      }]);
    } else if (newAttachments.length > 0) {
      setNotifications(prev => [...prev, {
        id: generateUUID(),
        type: 'success',
        title: 'Files attached',
        message: `Successfully attached ${newAttachments.length} file(s)`
      }]);
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    event.target.value = ''; // Reset input
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
          content = chatMessages.map(msg => 
            `[${msg.role.toUpperCase()}]\n${msg.content}\n`
          ).join('\n---\n\n');
          blob = new Blob([content], { type: 'text/plain' });
          downloadFile(`${filename}.txt`, blob);
          break;

        case 'markdown':
          content = `# ${title}\n\n` + chatMessages.map(msg =>
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
  ${chatMessages.map(msg => `
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

  const [selectedMessage, setSelectedMessage] = useState<ChatMessage | null>(null);
  const [workflows, setWorkflows] = useState<Array<{id: string; name: string; prompt: string; createdAt: Date}>>([]);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCreateWorkflow = (message: ChatMessage) => {
    setSelectedMessage(message);
    setWorkflowName('');
    setShowWorkflowCreate(true);
  };

  const saveWorkflow = () => {
    if (!selectedMessage || !workflowName.trim()) return;

    const newWorkflow = {
      id: generateUUID(),
      name: workflowName,
      prompt: selectedMessage.content,
      createdAt: new Date()
    };

    setWorkflows(prev => [...prev, newWorkflow]);
    setShowWorkflowCreate(false);
    setSelectedMessage(null);
    setWorkflowName('');
  };

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const [isDragging, setIsDragging] = useState(false);

  // Handle drag events for file upload
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    console.log(`Processing ${files.length} files from drop`);
    const newAttachments: Attachment[] = [];
    const errors: string[] = [];
    const notificationId = generateUUID();

    // Show loading notification
    setNotifications(prev => [...prev, {
      id: notificationId,
      type: 'loading',
      title: 'Processing files',
      message: `Processing ${files.length} file(s)...`
    }]);

    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
        
        if (file.size > MAX_FILE_SIZE) {
          errors.push(`${file.name} is too large (max: ${MAX_FILE_SIZE / 1024 / 1024}MB)`);
          continue;
        }

        // Determine file type
        const type = Object.entries(ALLOWED_FILE_TYPES).find(([_, types]) => 
          types.includes(file.type)
        )?.[0] as Attachment['type'] || 'document';
        
        console.log(`Determined file type: ${type}`);

        // Read file content using our improved utility
        console.log(`Extracting content from ${file.name}...`);
        const content = await extractFileContent(file);
        console.log(`Content extracted, length: ${content.length} characters`);
        const url = URL.createObjectURL(file);

        // For images, create a thumbnail
        let thumbnailUrl = type === 'image' ? await createImageThumbnail(file) : undefined;

        const attachment: Attachment = {
          id: generateUUID(),
          type,
          name: file.name,
          url,
          thumbnailUrl,
          size: file.size,
          mimeType: file.type,
          content // Store the content for processing
        };

        console.log(`Created attachment: ${attachment.id}, name: ${attachment.name}, content length: ${attachment.content?.length || 0}`);
        newAttachments.push(attachment);
      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        errors.push(`Failed to process ${file.name}: ${error}`);
      }
    }

    // Remove loading notification and show result
    setNotifications(prev => prev.filter(n => n.id !== notificationId));

    if (errors.length > 0) {
      console.error('File processing errors:', errors);
      setNotifications(prev => [...prev, {
        id: generateUUID(),
        type: 'error',
        title: 'Error processing files',
        message: errors.join('\n')
      }]);
    } else if (newAttachments.length > 0) {
      console.log(`Successfully attached ${newAttachments.length} files`);
      setNotifications(prev => [...prev, {
        id: generateUUID(),
        type: 'success',
        title: 'Files attached',
        message: `Successfully attached ${newAttachments.length} file(s)`
      }]);
    }

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  return (
    <div 
      className="flex flex-col h-full relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background p-8 rounded-xl shadow-lg border-2 border-dashed border-primary flex flex-col items-center">
            <Paperclip className="h-12 w-12 text-primary mb-4" />
            <p className="text-lg font-medium">Drop files to attach</p>
            <p className="text-sm text-muted-foreground mt-1">
              Supported formats: PDF, Word, Excel, images, and more
            </p>
          </div>
        </div>
      )}

      {/* Notifications */}
      <NotificationContainer>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </NotificationContainer>

      {/* Messages Area - Scrollable */}
      <div 
        className="flex-1 overflow-y-auto min-h-0"
        style={{
          backgroundColor: 'eggshell',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        <div className="h-full px-4 py-6 space-y-6">
          {chatMessages.length === 0 && !isStreaming && (
            <div className="flex items-center justify-center min-h-[300px] text-muted-foreground">
              <div className="text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with the assistant...</p>
              </div>
            </div>
          )}
          
          {/* Message List */}
          <div className="max-w-3xl mx-auto space-y-6">
            {chatMessages.map((message: ChatMessage) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 p-6 rounded-2xl transition-all duration-300 ease-in-out",
                "border",
                message.role === 'assistant' 
                    ? "bg-slate-200 dark:bg-slate-800/95 border-slate-200 dark:border-slate-700" 
                    : "bg-slate-300 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700",
                "hover:-translate-y-0.5 transform-gpu",
                "shadow-[0_10px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.3)]",
                "hover:shadow-[0_15px_50px_rgb(0,0,0,0.2)] dark:hover:shadow-[0_15px_50px_rgb(0,0,0,0.4)]"
              )}
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                transform: 'translate3d(0, 0, 0)'
              }}
            >
              {message.role === 'assistant' && (
                  <div className="relative shrink-0">
                    <div className="absolute -left-1 -top-1 w-8 h-8 bg-gradient-to-br from-blue-200/40 to-slate-200/30 rounded-full blur-md" />
                    <div className="relative bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-600 shadow-md">
                      <Bot className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    </div>
                  </div>
                )}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                      {message.role === 'assistant' ? (
                        <>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {currentMode?.name || 'Assistant'}
                          </span>
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-400/50" />
                        </>
                      ) : (
                        <span className="text-slate-600 dark:text-slate-300 font-semibold">You</span>
                      )}
                    </span>
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCopy(message.content, message.id)}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200",
                            "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100",
                            "bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700",
                            "border border-slate-200 dark:border-slate-600",
                            "shadow-sm hover:shadow-md transform-gpu hover:-translate-y-0.5"
                          )}
                          title="Copy message"
                        >
                          {copiedMessageId === message.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-green-500" />
                              <span className="text-green-500 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span className="font-medium">Copy</span>
                            </>
                          )}
                        </button>
                </div>
                    )}
                  </div>
                  <div className={cn(
                    "prose prose-lg max-w-none",
                    "text-slate-800 dark:text-slate-200",
                    "prose-headings:font-bold prose-headings:border-b prose-headings:border-slate-200 dark:prose-headings:border-slate-700 prose-headings:pb-2 prose-headings:mb-6",
                    "prose-h1:text-2xl prose-h1:text-blue-700 dark:prose-h1:text-blue-400",
                    "prose-h2:text-xl prose-h2:text-blue-600 dark:prose-h2:text-blue-500",
                    "prose-h3:text-lg prose-h3:text-blue-500 dark:prose-h3:text-blue-600",
                    "prose-p:mb-4 prose-p:leading-relaxed",
                    "prose-pre:bg-slate-100/80 dark:prose-pre:bg-slate-800/80",
                    "prose-pre:shadow-inner prose-pre:border prose-pre:border-slate-200 dark:prose-pre:border-slate-700 prose-pre:p-4 prose-pre:rounded-lg",
                    "prose-ul:list-disc prose-ol:list-decimal prose-li:ml-4 prose-li:mb-2",
                    "prose-ul:pl-5 prose-ol:pl-5 prose-ul:my-4 prose-ol:my-4",
                    "prose-table:border-collapse prose-table:w-full prose-table:my-6",
                    "prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-2 prose-th:border prose-th:border-slate-300 dark:prose-th:border-slate-700 prose-th:text-left",
                    "prose-td:p-2 prose-td:border prose-td:border-slate-200 dark:prose-td:border-slate-700",
                    "prose-strong:font-bold prose-strong:text-blue-700 dark:prose-strong:text-blue-400",
                    "prose-code:bg-slate-100 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm",
                    "font-semibold"
                  )}>
                    {message.role === 'assistant' ? (
                      <div dangerouslySetInnerHTML={{ __html: message.content }} />
                    ) : (
                      message.content.split('\n\n').map((paragraph, index) => (
                        <p key={index} className="mb-4">{paragraph}</p>
                      ))
                    )}
                  </div>
                {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {message.attachments.map((attachment: Attachment) => (
                      <div key={attachment.id} className="w-full">
                        <AttachmentPreview 
                          attachment={attachment}
                          showControls={true}
                          className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
            
          {isStreaming && (
            <div className={cn(
                "flex gap-4 p-5 rounded-2xl transition-all duration-300 ease-in-out",
                "border",
                "bg-white/95 dark:bg-slate-800/95 border-slate-200 dark:border-slate-700",
                "shadow-[0_10px_40px_rgb(0,0,0,0.12)] dark:shadow-[0_10px_40px_rgb(0,0,0,0.3)]",
                "animate-in fade-in-0 slide-in-from-bottom-4"
              )}
              style={{
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                transform: 'translate3d(0, 0, 0)'
              }}>
                <div className="relative shrink-0">
                  <div className="absolute -left-1 -top-1 w-8 h-8 bg-gradient-to-br from-blue-200/40 to-slate-200/30 rounded-full blur-md" />
                  <div className="relative bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-600 shadow-md">
                    <Bot className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {currentMode?.name || 'Assistant'}
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400/50 animate-pulse" />
                </div>
                  <div 
                    className="prose prose-sm max-w-none text-slate-800 dark:text-slate-200"
                    dangerouslySetInnerHTML={{ __html: formatStreamingContent(streamingMessage) }}
                  />
                  <span className="inline-block w-1.5 h-4 ml-1 bg-blue-400/40 animate-pulse rounded-sm" />
                </div>
              </div>
          )}
          </div>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="shrink-0 border-t border-border bg-background/95 backdrop-blur-md">
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="px-4 py-2 border-b border-border">
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="w-48">
                  <AttachmentPreview 
                    attachment={attachment}
                    onRemove={removeAttachment}
                    showControls={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2">
              {/* File Input with Drag & Drop */}
              <FileDropZone
                onFilesAdded={(newAttachments) => {
                  setAttachments(prev => [...prev, ...newAttachments]);
                  setNotifications(prev => [...prev, {
                    id: generateUUID(),
                    type: 'success',
                    title: 'Files attached',
                    message: `Successfully attached ${newAttachments.length} file(s)`
                  }]);
                }}
                onError={(errorMessage) => {
                  setNotifications(prev => [...prev, {
                    id: generateUUID(),
                    type: 'error',
                    title: 'Error processing files',
                    message: errorMessage
                  }]);
                }}
              />

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
                  <div className="absolute bottom-full left-0 mb-2 p-2 bg-background border border-border rounded-lg shadow-lg z-50">
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
                className="flex-1 px-4 py-2 rounded-lg border bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading || voiceState.isRecording}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[48px]",
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
              <p className="text-sm text-red-500 mt-2">
                Error with voice input: {voiceState.error}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Workflow Creation Modal */}
      {showWorkflowCreate && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Create Workflow</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="workflowName" className="block text-sm font-medium mb-1">
                  Workflow Name
                </label>
                <input
                  type="text"
                  id="workflowName"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border bg-background text-foreground"
                  placeholder="Enter workflow name..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowWorkflowCreate(false)}
                  className="px-4 py-2 rounded-md hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={saveWorkflow}
                  disabled={!workflowName.trim()}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Save Workflow
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}