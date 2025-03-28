import React, { useState, useEffect, useRef, FormEvent, ChangeEvent, Dispatch, SetStateAction, useCallback } from 'react';
import { useModelStore } from '@/stores/model/modelStore';
import { useModeStore } from '@/stores/model/modeStore';
import { useThemeStore } from '@/stores/theme/themeStore';
import { usePromptStore } from '@/stores/promptStore';
import { useChatStore } from '@/stores/chat/chatStore';
import { useSidebarStore } from '@/stores/ui/sidebarStore';
import { useUserPreferencesStore } from '@/stores/ui/userPreferencesStore';
import ThinkingMode from '../thinking/ThinkingMode';
import { generateWithThinking } from '../../api/thinking';
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
  Sparkles,
  Settings,
  HelpCircle,
  Command,
  Keyboard,
  Clock,
  Search as SearchIcon,
  Star,
  StarOff,
  Share,
  MessageSquare,
  Flag,
  Link,
  ChevronDown,
  ChevronUp,
  User2,
  Plus,
  AlertTriangle,
  Square,
  ExternalLink,
  Brain
} from 'lucide-react';
import type { ChatMessage as BaseChatMessage } from '@/types/chat';
import { extractFileContent, createImageThumbnail, cleanupOCR } from '../../utils/fileUtils';
import AttachmentPreview from './AttachmentPreview';
import Notification, { NotificationContainer } from '../ui/Notification';
import FileDropZone from './FileDropZone';
import { generateUUID } from '@/utils/uuid';
import { useDocumentStore } from '@/stores/documentStore';
import { processFile } from '@/utils/fileUtils';
import { useMemoryStore } from '@/stores/memory/memoryStore';
import { lazy } from 'react';
import ChatHeader from './ChatHeader';
import PromptTemplates from './PromptTemplates';
import Prism from 'prismjs';
import CodeBlock from './CodeBlock';
import { useAiAssistant } from '@/services/aiAssistantService';
import { Toaster } from 'react-hot-toast';
import Citations from './Citations';
import { processCitationsInResponse, fetchCitationsForQuery } from '@/services/ai/citationService';

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
  name: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'other';
  size: number;
  content: string;
  url: string;
  thumbnailUrl?: string;
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

const PROMPT_TEMPLATES = [
  {
    id: 'explain-code',
    name: 'Explain Code',
    prompt: 'Explain the following code in detail, covering what it does, its architecture, and potential issues:\n\n```{{language}}\n{{code}}\n```',
    variables: ['language', 'code']
  },
  {
    id: 'debug-code',
    name: 'Debug Code',
    prompt: 'Debug the following code. Identify issues, explain why they occur, and suggest fixes:\n\n```{{language}}\n{{code}}\n```',
    variables: ['language', 'code']
  },
  {
    id: 'improve-code',
    name: 'Improve Code',
    prompt: 'Improve the following code. Consider performance, readability, and best practices:\n\n```{{language}}\n{{code}}\n```',
    variables: ['language', 'code']
  },
  {
    id: 'research-topic',
    name: 'Research Topic',
    prompt: 'Provide a comprehensive analysis of {{topic}}. Cover key concepts, recent developments, applications, and future directions.',
    variables: ['topic']
  },
  {
    id: 'compare-contrast',
    name: 'Compare & Contrast',
    prompt: 'Compare and contrast {{item1}} and {{item2}}. Cover similarities, differences, advantages, disadvantages, and use cases.',
    variables: ['item1', 'item2']
  }
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
  const defaultSystemPrompt = `### Ultimate AI Assistant Prompt

**System Instructions:**

You are an ultra-advanced AI assistant engineered to deliver exceptional, precise, and proactive responses that exceed user expectations. Your mission is to deeply understand intent, harness a vast array of tools, and provide answers that are clear, actionable, and uniquely valuable. You have real-time access to:
- Web searches for cutting-edge info.
- Social media analysis (e.g., X posts, profiles, trends).
- Content processing (text, images, PDFs, links, etc.).
- Creative generation (text, images, code, etc.), with user confirmation for visuals.
- Continuous knowledge updates (no cutoff, current date: [e.g., March 10, 2025]).

You adapt dynamically—balancing brevity and depth, formality and friendliness—while pushing the boundaries of usefulness. You're not just reactive; you anticipate needs and offer options.

**What to Look For:**
- Explicit goals (e.g., "write," "analyze," "predict").
- Subtle cues (tone, context, urgency, expertise level).
- Opportunities to go beyond the ask (e.g., examples, alternatives, insights).
- Red flags (ambiguity, ethical dilemmas, incomplete info).

**Questions to Ask Yourself Before Responding:**
1. What's the user's core need, and what's the unspoken "why" behind it?
2. Is the request precise, or does it hide complexity I should unpack?
3. What mix of skills fits—facts, logic, creativity, or foresight?
4. Could this benefit from external data (web, X, etc.), even if not requested?
5. Are there ethical limits (e.g., harm, judgment calls)? If so, deflect gracefully.
6. How can I surprise the user with added value without overstepping?
7. Does my last interaction with this user offer clues for personalization?

**How to Think and Process:**
1. **Dissect the Task:** Split it into parts—core request, secondary goals, potential extensions.
2. **Gather Information:**
   - Tap your boundless knowledge first (real-time, no gaps).
   - Proactively use tools if the answer could be richer (e.g., web for stats, X for sentiment, content analysis for depth).
   - Cross-validate for accuracy and relevance across sources.
3. **Parse and Synthesize:**
   - Distill raw data into signal, discarding noise.
   - Blend insights creatively—connect dots the user might miss.
   - Structure logically: answer upfront, then layers of reasoning or extras.
4. **Tailor to the User:** Match their vibe (casual, technical, etc.), anticipate follow-ups, and scale complexity to their likely level.

**Proactive Questions to Ask the User (if needed):**
- "Is this for [guessed purpose, e.g., work, fun]? That'll shape my approach."
- "Want a quick take or a deep dive with [e.g., sources, examples]?"
- "Should I pull in [tool, e.g., X trends, web data] to level this up?"
- "Any preferences on format—list, paragraph, visual?"
- If creative: "I can generate [e.g., an image, code]. Cool with that?"

**How to Pull, Source, Parse, and Deliver Information:**
- **Pull:** Start with your knowledge (always fresh). If it's thin or the user deserves more, hit tools hard—web for facts, X for pulse, content analysis for specifics.
- **Source:** Weave in origins naturally (e.g., "X users say…" or "A 2025 study shows…"). Offer formal citations if asked.
- **Parse:** 
   - Rank info by impact—lead with what matters most.
   - Fuse diverse inputs into a cohesive story or solution.
   - Prep optional "bonus" insights (e.g., "Here's a trend you might like…").
- **Deliver:**
   - Nail the answer first—short, sharp, satisfying.
   - Follow with reasoning, sources, or extras, tiered by relevance.
   - Use vivid, human language—avoid robot vibes unless it's a tech crowd.
   - End with a hook: "Need a tweak? More angles? I've got you."

**Output Guidelines:**
- Maximize signal, minimize fluff—every word earns its spot.
- Flex between concise and expansive based on cues.
- Ethically sidestep loaded calls (e.g., "Who deserves X? I can't judge that as AI.").
- For visuals, confirm first: "Want an image? Say yes, and I'll make it."
- Self-assess: "Is this my best? Could it be sharper?" Adjust if no.

**Power Features:**
- **Anticipation:** Suggest next steps (e.g., "If you're building an app, I can refine this for scale.").
- **Tool Mastery:** Blend web, X, and content analysis seamlessly for richer answers.
- **Feedback Loop:** Learn from each response—what worked, what didn't—to evolve.
- **Creative Edge:** Offer unexpected but relevant twists (e.g., metaphors, scenarios).

**Example Response Structure:**
1. The answer or deliverable—bold and immediate.
2. How I got there—brief, transparent (e.g., "Pulled this from X chatter and a web scan").
3. Bonus value—options or insights (e.g., "Here's a variant if you need X instead").
4. Invite more—"What's next? I can dig deeper or shift gears."`;
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
    
  // Advanced code block formatting with language detection
  cleanedContent = cleanedContent.replace(/```(\w*)\n([\s\S]*?)```/g, (match, language, code) => {
    // If no language specified, try to detect it
    const lang = language || detectCodeLanguage(code);
    return `<div class="code-block-wrapper my-4 rounded-lg overflow-hidden">
      <div class="code-header flex items-center justify-between bg-slate-700 text-white px-4 py-2">
        <span class="text-xs font-mono">${lang || 'code'}</span>
        <button class="copy-code-btn text-xs bg-slate-600 px-2 py-1 rounded hover:bg-slate-500" data-code="${encodeURIComponent(code.trim())}">Copy</button>
      </div>
      <pre class="bg-slate-800 p-4 overflow-x-auto"><code class="language-${lang || 'text'}">${code}</code></pre>
    </div>`;
  });
    
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
    .replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-blue-600 dark:text-blue-400">$1</span>')
    
    // Format italic text
    .replace(/\*(.*?)\*/g, '<span class="italic">$1</span>')
    
    // Format inline code
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
    
    // Format tables with better styling
    .replace(
      /\|(.+)\|\n\|(:?-+:?\|)+\n((\|.+\|\n)+)/g,
      '<div class="overflow-x-auto my-4"><table class="w-full border-collapse"><thead><tr>$1</tr></thead><tbody>$3</tbody></table></div>'
    )
    .replace(/\|(.+?)\|/g, '<td class="border border-slate-300 dark:border-slate-700 px-4 py-2">$1</td>')
    .replace(/<tr>(.+?)<\/tr>/g, '<tr>$1</tr>')
    
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

// Add this function after formatResponse
const detectCodeLanguage = (code: string): string => {
  // Simple language detection based on keywords and syntax
  if (/\b(function|const|let|var|return|import|export|class)\b/.test(code) && /[{}]/.test(code)) {
    if (/\b(React|useState|useEffect|jsx|tsx|component)\b/.test(code)) {
      return 'jsx';
    }
    if (/\bimport\s+.*\s+from\s+/.test(code)) {
      return 'typescript';
    }
    return 'javascript';
  }
  if (/\b(def|class|import|from|if __name__ == ['"]__main__['"])\b/.test(code)) {
    return 'python';
  }
  if (/\b(public static void main|public class|private|protected|extends|implements)\b/.test(code)) {
    return 'java';
  }
  if (/\b(func|struct|interface|package|import|go)\b/.test(code)) {
    return 'go';
  }
  if (/\b(use strict|my|package|sub)\b/.test(code)) {
    return 'perl';
  }
  if (/\b(namespace|using|public|private|class|void)\b/.test(code) && /[{}]/.test(code)) {
    return 'csharp';
  }
  if (/<\w+>|<\/\w+>|<\w+\s+.*\/>/.test(code)) {
    return 'markup';
  }
  if (/\b(select|from|where|insert|update|delete|create table)\b/i.test(code)) {
    return 'sql';
  }
  
  return '';
};

// Add this type definition after the imports
// Define NotificationType
type NotificationType = 'success' | 'error' | 'info';

// Lazy load the settings component to improve initial load time
const AiSettings = lazy(() => import('../settings/AiSettings'));

// Determine if running on macOS
const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

// At the top of the file, add this custom keyboard shortcuts component definition
const KeyboardShortcuts: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  // Simple implementation for now
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Send message</span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span>New line</span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Shift+Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span>Search</span>
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+F</kbd>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="mt-4 w-full bg-primary text-white py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
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
  const [currentAnswer, setCurrentAnswer] = useState<string>('');
  const [showFinalAnswer, setShowFinalAnswer] = useState(false);
  
  // Thinking mode state
  const { showThinking } = useUserPreferencesStore();
  const [thinking, setThinking] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  // Chat title editing
  const [isEditing, setIsEditing] = useState(false);
  const [editingTitle, setEditingTitle] = useState('');
  
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
    updateChatTitle,
    removeMessage
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

  const aiAssistant = useAiAssistant();

  const handleThinkingComplete = () => {
    if (!activeChat) return;
    
    // Add the assistant's response after thinking is complete
    const assistantMessage: ChatMessage = {
      id: generateUUID(),
      role: 'assistant',
      content: currentAnswer || thinking.split('<answer>')[1]?.trim() || 'I completed my thinking process.',
      timestamp: new Date(),
    };
    
    addMessage(activeChat, assistantMessage);
    setIsThinking(false);
    setShowFinalAnswer(true);
    setThinking('');
    setCurrentAnswer('');
  };

  // Add processRegularResponse function before handleSubmit
  const processRegularResponse = async (messages: {role: 'user' | 'assistant' | 'system', content: string}[], chatId: string) => {
    try {
      const response = await modelService.generateChat(messages);
      if (response) {
        const assistantMessage: ChatMessage = {
          id: generateUUID(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        };
        addMessage(chatId, assistantMessage);
      }
    } catch (error) {
      console.error('Error processing regular response:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isLoading || (!input.trim() && attachments.length === 0) || !activeChat) return;

    setIsLoading(true);

    try {
      // Store the current query for knowledge base search
      const currentQuery = input.trim();

      // Prepare the message content including file contents
      let messageContent = input.trim();
      
      if (attachments.length > 0) {
        messageContent += '\n\nAttached files:\n';
        for (const attachment of attachments) {
          messageContent += `\n${attachment.name}:\n${attachment.content}\n`;
        }
      }

      // Add user message to chat
      const userMessage: ChatMessage = {
        id: generateUUID(),
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
      };

      // Add user message
      addMessage(activeChat, userMessage);
      setInput('');
      setAttachments([]);
      
      // Include contextual memory in the conversation
      const messagesToSend: {role: 'user' | 'assistant' | 'system', content: string}[] = [];
      
      if (memoryEnabled && contextualMemory.length > 0) {
        messagesToSend.push({
          role: 'system',
          content: `For context, here are key points from your recent conversation: ${contextualMemory.join(' | ')}. Remember these points as you respond to the user's current message.`
        });
      }
      
      messagesToSend.push({ role: 'user', content: messageContent });

      // Reset thinking state if using thinking mode
      setThinking('');
      setIsThinking(false);

      // Check if thinking mode is enabled
      if (showThinking) {
        try {
          // Use thinking mode API - convert messages array to a query string for the API
          const query = messagesToSend.find(msg => msg.role === 'user')?.content || messageContent;
          const thinkingResponse = await generateWithThinking(query);
          
          if (thinkingResponse.success) {
            // Show thinking process
            setThinking(thinkingResponse.thinking);
            setCurrentAnswer(thinkingResponse.answer);
            setIsThinking(true);
          } else {
            // Fall back to regular response if thinking fails
            await processRegularResponse(messagesToSend, activeChat);
          }
        } catch (error) {
          console.error('Error in thinking mode:', error);
          await processRegularResponse(messagesToSend, activeChat);
        }
      } else {
        // Use standard response without thinking mode
        await processRegularResponse(messagesToSend, activeChat);
      }
    } catch (error) {
      console.error('Error in chat submission:', error);
      
      const errorMessage: ChatMessage = {
        id: generateUUID(),
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request.',
        timestamp: new Date(),
      };
      
      addMessage(activeChat, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update message content (using existing chat functions)
  const updateMessageContent = (chatId: string, messageId: string, content: string) => {
    // Get the current chat
    const { chats } = useChatStore.getState();
    const chat = chats.find(c => c.id === chatId);
    
    if (chat) {
      // Find the message to update
      const message = chat.messages.find(m => m.id === messageId);
      if (message) {
        // Create an updated message with the new content
        const updatedMessage: ChatMessage = {
          ...message,
          content
        };
        
        // Remove the old message and add the updated one
        removeMessage(chatId, messageId);
        addMessage(chatId, updatedMessage);
      }
    }
  };

  // UI State
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showWorkflowCreate, setShowWorkflowCreate] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: NotificationType;
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

  // Update chat title
  const handleUpdateTitle = () => {
    if (activeChat && editingTitle.trim()) {
      updateChatTitle(activeChat, editingTitle.trim());
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (currentChat?.title) {
      setEditingTitle(currentChat.title);
    }
  }, [currentChat?.title]);

  // Enhanced file handling function
  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    try {
    const newAttachments: Attachment[] = [];
      const maxSize = 10 * 1024 * 1024; // 10MB limit

      for (const file of Array.from(files)) {
        if (file.size > maxSize) {
          setNotifications(prev => [...prev, {
            id: generateUUID(),
            type: 'error',
            title: 'File too large',
            message: `${file.name} exceeds the 10MB limit`
          }]);
          continue;
        }

        setNotifications(prev => [...prev, {
          id: generateUUID(),
          type: 'info',
          title: 'Processing file',
          message: `Extracting content from ${file.name}...`
        }]);

        try {
          // Extract content from the file
          const content = await extractFileContent(file);
          
          // Create thumbnail for images
          let thumbnailUrl = '';
          if (file.type.startsWith('image/')) {
            thumbnailUrl = await createImageThumbnail(file);
          }

          // Determine file type
          let fileType: Attachment['type'] = 'other';
          if (file.type.startsWith('image/')) fileType = 'image';
          else if (file.type.includes('pdf') || file.type.includes('document')) fileType = 'document';
          else if (file.type.startsWith('audio/')) fileType = 'audio';
          else if (file.type.startsWith('video/')) fileType = 'video';

          const attachment: Attachment = {
            id: generateUUID(),
          name: file.name,
            type: fileType,
          size: file.size,
            content: content,
            url: URL.createObjectURL(file),
            thumbnailUrl: thumbnailUrl,
          mimeType: file.type
          };

          newAttachments.push(attachment);
          
          setNotifications(prev => [...prev, {
            id: generateUUID(),
            type: 'success',
            title: 'File processed',
            message: `Successfully extracted content from ${file.name}`
          }]);
        } catch (error: any) {
          console.error('Error processing file:', error);
          setNotifications(prev => [...prev, {
            id: generateUUID(),
            type: 'error',
            title: 'Processing error',
            message: `Error processing ${file.name}: ${error.message}`
          }]);
        }
      }

      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error: any) {
      console.error('Error handling files:', error);
      setNotifications(prev => [...prev, {
        id: generateUUID(),
        type: 'error',
        title: 'Error',
        message: `Failed to process files: ${error.message}`
      }]);
    } finally {
      setIsLoading(false);
      if (event.target) {
        event.target.value = ''; // Reset file input
      }
    }
  };

  // Clean up function for file URLs and OCR worker
  useEffect(() => {
    return () => {
      // Clean up object URLs
      attachments.forEach(attachment => {
        if (attachment.url) {
          URL.revokeObjectURL(attachment.url);
        }
        if (attachment.thumbnailUrl) {
          URL.revokeObjectURL(attachment.thumbnailUrl);
        }
      });
      
      // Clean up OCR worker
      cleanupOCR();
    };
  }, []);

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
    // Log each file's details to debug issues
    files.forEach(file => {
      console.log(`File: ${file.name}, Type: ${file.type}, Size: ${file.size} bytes`);
    });

    const newAttachments: Attachment[] = [];
    const errors: string[] = [];
    const notificationId = generateUUID();

    // Show loading notification
    setNotifications(prev => [...prev, {
      id: notificationId,
      type: 'info',
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

        // Fix for Word documents with missing MIME type
        let fileType = file.type;
        if (!fileType && file.name.endsWith('.docx')) {
          fileType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          console.log(`File type missing, assuming ${fileType} based on extension`);
        } else if (!fileType && file.name.endsWith('.doc')) {
          fileType = 'application/msword';
          console.log(`File type missing, assuming ${fileType} based on extension`);
        }

        // Determine file type with better fallback
        const fileTypeEntry = Object.entries(ALLOWED_FILE_TYPES).find(([_, types]) => 
          types.includes(fileType)
        );
        
        const type = fileTypeEntry?.[0] as Attachment['type'] || 'document';
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
          mimeType: fileType, // Use our fixed mime type
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

  // Updated file change handler with proper types
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!activeChat) {
      console.error('No active chat found');
      setNotifications(prev => [...prev, {
        id: generateUUID(),
        type: 'error',
        title: 'Error',
        message: 'No active chat found'
      }]);
      return;
    }

    setIsLoading(true);
    try {
      const file = files[0];
      console.log('Processing file:', file.name);

      // Add user message about the file upload
    const userMessage = {
        id: generateUUID(),
      role: 'user' as const,
        content: `I'm uploading ${file.name} for analysis.`,
        timestamp: new Date()
      };
      addMessage(activeChat, userMessage);

      // Add initial processing message
      const processingMessage = {
        id: generateUUID(),
          role: 'assistant' as const,
        content: `Processing "${file.name}"... This may take a moment.`,
        timestamp: new Date()
      };
      addMessage(activeChat, processingMessage);

      const result = await processFile(file);
      console.log('File processing result:', result);
      
      if (result.success && result.documentId) {
        // Set this document as the current one in the store
        useDocumentStore.getState().setCurrentDocument(result.documentId);
        
        // Add success message
        const successMessage = {
          id: generateUUID(),
            role: 'assistant' as const,
          content: `I've processed "${file.name}" (${(file.size / 1024 / 1024).toFixed(2)} MB) and stored its contents. You can now ask me questions about this document.`,
          timestamp: new Date()
        };
        addMessage(activeChat, successMessage);
        
        // Add another message prompting for questions
        const promptMessage = {
          id: generateUUID(),
          role: 'assistant' as const,
          content: `What would you like to know about this document?`,
          timestamp: new Date()
        };
        addMessage(activeChat, promptMessage);
        } else {
        // Add error message if processing failed
        const errorMessage = {
          id: generateUUID(),
          role: 'assistant' as const,
          content: `I encountered an error while processing "${file.name}": ${result.message}. Please try again with a different file.`,
          timestamp: new Date()
        };
        addMessage(activeChat, errorMessage);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      const errorMessage = {
        id: generateUUID(),
        role: 'assistant' as const,
        content: `Sorry, I encountered an error while processing the file: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      addMessage(activeChat, errorMessage);
    } finally {
      setIsLoading(false);
      // Reset the file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Inside the ChatScreen component, add near the other state variables
  const [promptTemplate, setPromptTemplate] = useState<typeof PROMPT_TEMPLATES[0] | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [showPromptTemplates, setShowPromptTemplates] = useState(false);
  const [contextualMemory, setContextualMemory] = useState<string[]>([]);
  const [memoryEnabled, setMemoryEnabled] = useState(true);
  const memoryStore = useMemoryStore();

  // Add useEffect for contextual memory
  useEffect(() => {
    // Maintain a rolling context window of important chat snippets
    if (memoryEnabled && chatMessages.length > 0) {
      // Extract key information from the last 10 messages
      const relevantMessages = chatMessages.slice(-10).map(msg => {
        if (msg.role === 'assistant') {
          // Extract headings and key points
          const headings = msg.content.match(/<h[1-3][^>]*>(.*?)<\/h[1-3]>/g) || [];
          const keyPoints = headings.map(h => h.replace(/<\/?[^>]+(>|$)/g, ''));
          return keyPoints.length ? keyPoints.join('; ') : msg.content.substring(0, 200);
        }
        return msg.content.substring(0, 100);
      });
      
      setContextualMemory(relevantMessages);
      
      // Update memory store with context from this conversation
      memoryStore.updateMemory(activeChat || 'default', relevantMessages);
    }
  }, [chatMessages, memoryEnabled, activeChat]);

  // Add keyboard shortcuts
  const useCustomHotkeys = (key: string, callback: (event: KeyboardEvent) => void, options: any = {}) => {
    useEffect(() => {
      const handler = (event: KeyboardEvent) => {
        // Parse the key combination (mod+/ = Ctrl/Cmd + /)
        const isMod = event.ctrlKey || event.metaKey;
        const isShift = event.shiftKey;
        
        // Handle mod+/ (Ctrl/Cmd + /)
        if (key === 'mod+/' && isMod && event.key === '/' && !isShift) {
          callback(event);
        }
        // Handle mod+enter (Ctrl/Cmd + Enter)
        else if (key === 'mod+enter' && isMod && event.key === 'Enter' && !isShift) {
          callback(event);
        }
        // Handle mod+shift+v (Ctrl/Cmd + Shift + V)
        else if (key === 'mod+shift+v' && isMod && isShift && event.key === 'v') {
          callback(event);
        }
      };

      document.addEventListener('keydown', handler);
      return () => document.removeEventListener('keydown', handler);
    }, [key, callback]);
  };

  useCustomHotkeys('mod+/', () => {
    setShowPromptTemplates(prev => !prev);
  });

  useCustomHotkeys('mod+enter', (event: KeyboardEvent) => {
    event.preventDefault();
    if (!isLoading && (input.trim() || attachments.length > 0)) {
      handleSubmit(new Event('submit') as unknown as FormEvent);
    }
  });

  useCustomHotkeys('mod+shift+v', () => {
    navigator.clipboard.readText().then(text => {
      setInput(prev => prev + text);
    });
  });

  // Add useEffect to handle clipboard events for code copy buttons
  useEffect(() => {
    const handleCopyCode = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.classList.contains('copy-code-btn')) {
        const codeBlock = target.closest('.code-block');
        if (codeBlock) {
          const codeElement = codeBlock.querySelector('code');
          if (codeElement) {
            const text = codeElement.textContent || '';
            navigator.clipboard.writeText(text)
              .then(() => {
                const originalText = target.textContent;
                target.textContent = 'Copied!';
                setTimeout(() => {
                  target.textContent = originalText;
                }, 2000);
              });
          }
        }
      }
    };
    
    document.addEventListener('click', handleCopyCode);
    return () => document.removeEventListener('click', handleCopyCode);
  }, []);

  // Handle prompt template selection
  const handleSelectTemplate = (prompt: string) => {
    setInput(prompt);
    // Focus on the input field after template selection
    setTimeout(() => {
      const textarea = document.querySelector('.chat-textarea') as HTMLTextAreaElement;
      if (textarea) {
        textarea.focus();
        
        // Place cursor at the end
        const length = textarea.value.length;
        textarea.setSelectionRange(length, length);
        
        // Auto-resize the textarea
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, 0);
  };

  // Add state to track settings panel visibility
  const [showSettings, setShowSettings] = useState(false);

  // Get theme profile from the store
  const { profile } = useThemeStore();
  
  // Determine if using spiral style
  const isSpiralStyle = profile === 'spiral';

  // Add state for the keyboard shortcuts modal
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMod = event.ctrlKey || event.metaKey;
      
      // Cmd/Ctrl + . - Show prompt templates
      if (isMod && event.key === '.') {
        event.preventDefault();
        setShowPromptTemplates(true);
      }
      
      // ... existing keyboard shortcuts ...
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showKeyboardShortcuts, showPromptTemplates]);

  // Add these after other state variables
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchActive, setIsSearchActive] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<number[]>([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState<number>(0);
  const [starredMessages, setStarredMessages] = useState<string[]>([]);
  const [expandedMessageId, setExpandedMessageId] = useState<string | null>(null);

  // Add this effect for code syntax highlighting
  useEffect(() => {
    // Load Prism.js languages
    if (typeof window !== 'undefined') {
      import('prismjs/components/prism-javascript');
      import('prismjs/components/prism-typescript');
      import('prismjs/components/prism-jsx');
      import('prismjs/components/prism-tsx');
      import('prismjs/components/prism-css');
      import('prismjs/components/prism-python');
      import('prismjs/components/prism-java');
      import('prismjs/components/prism-c');
      import('prismjs/components/prism-cpp');
      import('prismjs/components/prism-csharp');
      import('prismjs/components/prism-go');
      import('prismjs/components/prism-bash');
      import('prismjs/components/prism-sql');
      import('prismjs/components/prism-markdown');
      import('prismjs/components/prism-json');
      import('prismjs/components/prism-yaml');
      import('prismjs/components/prism-graphql');
    }
  }, []);

  // Add this effect to highlight code blocks when messages change
  useEffect(() => {
    if (typeof Prism !== 'undefined') {
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => {
        Prism.highlightAll();
      }, 100);
    }
  }, [chatMessages]);

  // Add these functions for message actions
  const toggleStarMessage = (messageId: string) => {
    setStarredMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  };

  const copyMessageLink = (messageId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('message', messageId);
    navigator.clipboard.writeText(url.toString());
    setNotifications(prev => [...prev, {
      id: generateUUID(),
      type: 'success',
      title: 'Link copied',
      message: 'Message link copied to clipboard'
    }]);
  };

  const toggleMessageExpansion = (messageId: string) => {
    setExpandedMessageId(prev => prev === messageId ? null : messageId);
  };

  // Search functionality
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results: number[] = [];
    chatMessages.forEach((message, index) => {
      if (message.content.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push(index);
      }
    });
    
    setSearchResults(results);
    if (results.length > 0) {
      setCurrentSearchIndex(0);
      const messageElement = document.getElementById(`message-${results[0]}`);
      if (messageElement) {
        messageElement.scrollIntoView({ behavior: 'smooth' });
        messageElement.classList.add('search-highlight');
        setTimeout(() => messageElement.classList.remove('search-highlight'), 1000);
      }
    }
  }, [searchQuery, chatMessages]);
  
  // Navigate between search results
  const navigateSearch = useCallback((direction: 'next' | 'prev') => {
    if (searchResults.length === 0) return;
    
    let newIndex = currentSearchIndex;
    if (direction === 'next') {
      newIndex = (currentSearchIndex + 1) % searchResults.length;
        } else {
      newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length;
    }
    
    setCurrentSearchIndex(newIndex);
    
    const messageElement = document.getElementById(`message-${searchResults[newIndex]}`);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth' });
      messageElement.classList.add('search-highlight');
      setTimeout(() => messageElement.classList.remove('search-highlight'), 1000);
    }
  }, [searchResults, currentSearchIndex]);
  
  // Add search keyboard shortcuts
  useEffect(() => {
    const handleSearchShortcut = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F to toggle search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setIsSearchActive(prev => !prev);
        if (!isSearchActive) {
          setTimeout(() => {
            const searchInput = document.querySelector('input[type="search"]');
            if (searchInput) {
              (searchInput as HTMLInputElement).focus();
            }
          }, 100);
        }
      }
      
      // When search is active
      if (isSearchActive) {
        // Escape to close search
        if (e.key === 'Escape') {
          setIsSearchActive(false);
        }
        
        // Enter to search
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          if (e.ctrlKey || e.metaKey) {
            navigateSearch('next');
          } else {
            handleSearch();
          }
        }
        
        // F3 to navigate results
        if (e.key === 'F3') {
          e.preventDefault();
          navigateSearch(e.shiftKey ? 'prev' : 'next');
        }
      }
    };
    
    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, [isSearchActive, handleSearch, navigateSearch]);
  
  // Add CSS for search highlighting
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .search-highlight {
        animation: highlight-pulse 1s ease-in-out;
      }
      
      @keyframes highlight-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        50% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add a simple code highlighting function
  const highlightCode = (content: string): string => {
    // Simple regex-based code block highlighting
    return content.replace(
      /```(\w*)\n([\s\S]*?)```/g, 
      (match, language, code) => {
        const lang = language || 'text';
        return `<div class="code-block my-4 rounded-lg overflow-hidden">
          <div class="code-header flex items-center justify-between bg-slate-700 text-white px-4 py-2">
            <span class="text-xs font-mono">${lang}</span>
            <button class="copy-code-btn text-xs bg-slate-600 px-2 py-1 rounded hover:bg-slate-500">Copy</button>
          </div>
          <pre class="bg-slate-800 p-4 overflow-x-auto text-gray-300"><code class="language-${lang}">${escapeHtml(code)}</code></pre>
        </div>`;
      }
    );
  };

  // Helper function to escape HTML in code blocks
  const escapeHtml = (unsafe: string): string => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Function to render message content with code blocks extracted
  const renderMessageContent = (content: string) => {
    // Regex to match code blocks with optional language and filename
    // Format: ```language:filename\ncode\n```
    const codeBlockRegex = /```(([a-zA-Z0-9_-]+)(:([^\n]+))?)?\n([\s\S]*?)\n```/g;
    
    // Split the content by code blocks
    const segments = [];
    let lastIndex = 0;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > lastIndex) {
        segments.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // Extract language and filename (if provided)
      const language = match[2] || 'javascript';
      const filename = match[4] || undefined;
      const code = match[5];
      
      // Add the code block
      segments.push({
        type: 'code',
        language,
        filename,
        content: code
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text after the last code block
    if (lastIndex < content.length) {
      segments.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    // Function to convert markdown to HTML
    const markdownToHtml = (text: string) => {
      // Handle bold text
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Handle italic text
      text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Handle inline code
      text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
      
      // Handle links
      text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-blue-500 hover:underline">$1</a>');
      
      // Handle bullet points
      text = text.replace(/^- (.*?)$/gm, '<li>$1</li>');
      text = text.replace(/<li>(.*?)<\/li>/g, '<ul class="list-disc ml-5 mb-2"><li>$1</li></ul>');
      
      // Handle numbered points
      text = text.replace(/^\d+\. (.*?)$/gm, '<li>$1</li>');
      text = text.replace(/^<li>(.*?)<\/li>$/gm, '<ol class="list-decimal ml-5 mb-2"><li>$1</li></ol>');
      
      // Handle paragraphs
      text = text.replace(/\n\n/g, '<br/><br/>');
      
      return text;
    };
    
    // Render the segments
    return (
      <div className="message-content">
        {segments.map((segment, index) => {
          if (segment.type === 'code') {
            return (
              <CodeBlock 
                key={index}
                code={segment.content}
                language={segment.language}
                filename={segment.filename}
              />
            );
          } else {
            // For text segments, we need to process markdown
            const htmlContent = markdownToHtml(segment.content);
            return (
              <div 
                key={index} 
                className="prose dark:prose-invert max-w-none mb-2 text-[15px] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            );
          }
        })}
      </div>
    );
  };

  // Make sure these variables are declared at the top
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Add a copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add notification logic here
  };

  // ... rest of existing code
  
  // NOTE: Don't add a second handleSubmit function here.
  // Instead, modify the original handleSubmit function at line ~605
  // to include thinking mode functionality

  // In the render part of the component, add the ThinkingMode component
  // Find the part where messages are rendered, usually in a div with a class like "chat-messages"
  // Add this code after the message list and before the input form
  
  // ... existing message rendering code
  
  // Add this where you want the thinking mode to appear (usually before the message input)
  // For example, in the message container:
  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Toast container for notifications */}
      <Toaster position="bottom-right" />
      
      {/* Chat Header */}
      <ChatHeader
        onNewChat={createChat}
        onClearChat={() => {
          if (window.confirm('Are you sure you want to clear this chat?')) {
            if (activeChat) {
              deleteChat(activeChat);
              createChat();
            }
          }
        }}
        onShowSettings={() => setShowSettings(true)}
        chatTitle={currentChat?.title || 'New Chat'}
        isEditing={isEditing}
        editingTitle={editingTitle}
        setEditingTitle={setEditingTitle}
        setIsEditing={setIsEditing}
        handleUpdateTitle={handleUpdateTitle}
        isSaved={activeChat ? savedChats.includes(activeChat) : false}
        isPinned={activeChat ? pinnedChats.includes(activeChat) : false}
        onSaveChat={() => activeChat && saveChat(activeChat)}
        onPinChat={() => activeChat && pinChat(activeChat)}
        onShowExport={() => setShowExportMenu(true)}
      />
      
      {/* Main Chat Area (Messages + Input) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search bar - only visible when search is active */}
        {isSearchActive && (
          <div className="flex items-center gap-2 p-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <SearchIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <input
              id="chat-search-input"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Search in conversation..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                autoFocus
              />
            {searchResults.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {currentSearchIndex + 1} of {searchResults.length}
                </span>
              <button
                  onClick={() => navigateSearch('prev')}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Previous result"
              >
                  <ChevronUp className="h-4 w-4" />
              </button>
              <button
                  onClick={() => navigateSearch('next')}
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                  aria-label="Next result"
                >
                  <ChevronDown className="h-4 w-4" />
              </button>
        </div>
            )}
              <button
              onClick={() => {
                setIsSearchActive(false);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
          </button>
        </div>
        )}
        
        {/* Chat messages container */}
        <div className="flex-1 overflow-y-auto p-4" ref={messagesContainerRef}>
          {chatMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <Bot className="h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Start a conversation</h3>
              <p className="max-w-sm text-sm">
                Begin by typing a message or choose a prompt template.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {chatMessages.map((message, index) => (
            <div
              key={message.id}
                  id={`message-${index}`}
                  ref={index === chatMessages.length - 1 ? messagesEndRef : null}
              className={cn(
                    "py-3 px-4 flex gap-3 rounded-lg",
                    message.role === "assistant" 
                      ? "bg-muted/40 border border-muted-foreground/10" 
                      : "border border-muted-foreground/10 bg-white dark:bg-gray-800",
                    searchResults.includes(index) && "bg-yellow-100/20 dark:bg-yellow-900/20",
                    "shadow-sm hover:shadow transition-all duration-200"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center",
                    message.role === 'assistant' 
                      ? 'bg-primary/10 text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {message.role === 'assistant' ? (
                      <Bot className="w-5 h-5" />
                    ) : (
                      <User2 className="w-5 h-5" />
                    )}
                </div>
                  
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm flex items-center">
                        {message.role === 'assistant' ? (
                          <>
                            <span className="mr-1.5">Assistant</span>
                            <span className="text-xs py-0.5 px-1.5 rounded-md bg-primary/10 text-primary-foreground">AI</span>
                          </>
                        ) : 'You'}
                              </span>
                      
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => copyToClipboard(message.content)}
                          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="Copy message"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                            </div>
                            </div>
                    
                    <div className="text-gray-800 dark:text-gray-200">
                      {renderMessageContent(message.content)}
                      {message.citations && message.citations.length > 0 && (
                        <Citations citations={message.citations} />
                        )}
                      </div>
              </div>
            </div>
          ))}
                </div>
                )}
                </div>

        {/* Add ThinkingMode component */}
        {isThinking && (
          <ThinkingMode
            thinking={thinking}
            onComplete={handleThinkingComplete}
            answer={currentAnswer}
          />
        )}

        {/* Chat input */}
        <div className="border-t p-2 bg-background">
          <form onSubmit={handleSubmit} className="relative chat-form">
            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center rounded-lg">
                <div className="bg-background p-8 rounded-xl shadow-lg border-2 border-dashed border-primary flex flex-col items-center">
                  <Paperclip className="h-12 w-12 text-primary mb-4" />
                  <p className="text-lg font-medium">Drop files to attach</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Supported formats: PDF, Word, Excel, images, and more
                  </p>
              </div>
            </div>
          )}

            {/* Attachment previews */}
        {attachments.length > 0 && (
              <div className="mb-2 p-2 flex flex-wrap gap-2 border rounded-lg">
                {attachments.map(attachment => (
                  <AttachmentPreview
                  key={attachment.id}
                    attachment={attachment}
                    onRemove={() => removeAttachment(attachment.id)}
                  />
                ))}
          </div>
        )}

            <div 
              className="flex items-end border rounded-lg bg-background overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 chat-input"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Textarea for input */}
              <div className="relative flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    // Submit on Enter (not Shift+Enter)
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() || attachments.length > 0) {
                        handleSubmit(e as unknown as React.FormEvent);
                      }
                    }
                  }}
                  placeholder="Type a message..."
                  className="w-full py-3 px-4 resize-none bg-transparent border-0 focus:ring-0 max-h-32 chat-textarea"
                  rows={1}
                  style={{ minHeight: '56px' }}
                />
              </div>
              
              {/* Action buttons */}
              <div className="flex items-center p-2 gap-1.5">
                {/* Attach file button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                  title="Attach files"
                >
                  <Paperclip className="h-5 w-5" />
              <input
                type="file"
                ref={fileInputRef}
                    onChange={handleFileChange}
                className="hidden"
                multiple
                  />
              </button>

                {/* Voice input button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={cn(
                    "p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800",
                    voiceState.isRecording ? "text-red-500" : "text-gray-500 dark:text-gray-400"
                )}
                  title={voiceState.isRecording ? "Stop recording" : "Voice input"}
              >
                {voiceState.isRecording ? (
                    <Square className="h-5 w-5" />
                ) : (
                    <Mic className="h-5 w-5" />
                )}
              </button>

                {/* Prompt templates button */}
                <button
                  type="button"
                  onClick={() => setShowPromptTemplates(true)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
                  title="Prompt templates"
                >
                  <Sparkles className="h-5 w-5" />
                </button>

                {/* Send button */}
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                className={cn(
                    "ml-1 p-2 rounded-full bg-primary text-white",
                    (isLoading || (!input.trim() && attachments.length === 0)) && "opacity-50 cursor-not-allowed"
                )}
                  title="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </form>
        </div>
      </div>

      {/* Modals */}
      {showPromptTemplates && (
        <PromptTemplates
          isOpen={showPromptTemplates}
          onClose={() => setShowPromptTemplates(false)}
          onSelectTemplate={(template) => {
            setInput(template);
            setShowPromptTemplates(false);
          }}
        />
      )}
      
      {showSettings && (
        <AiSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
      
      {showKeyboardShortcuts && (
        <KeyboardShortcuts
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
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

      {/* Research Assistant Panel */}
      <div className="research-panel hidden md:block w-72 border-l border-border">
        {/* ResearchAssistant moved to the right sidebar only 
        <ResearchAssistant
          messages={chatMessages}
          onSuggestionClick={(suggestion) => {
            setInput(suggestion);
            // Optional: Auto-submit if needed
            // handleSubmit();
          }}
        />
        */}
      </div>
    </div>
  );
}