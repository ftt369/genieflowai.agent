import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Bot, History, Send, GripVertical, ChevronRight, ChevronLeft, Loader2, Copy, Sparkles, Check, PlayCircle, PlusCircle, HelpCircle, File, Upload, Link, ChevronUp, ChevronDown, Eraser, FileText } from 'lucide-react';
import { cn } from '@utils/cn';
import type { ChatMessage } from '@stores/chat/chatStore';
import { useModelStore } from '@stores/model/modelStore';
import { useChatStore } from '@stores/chat/chatStore';
import { useThemeStore } from '@/stores/theme/themeStore';
import { type ColorProfile } from '@/config/theme';
import ChatScreen from '../../chat/ChatScreen';
import ResearchAssistant from '../../ResearchAssistant';
import toast from 'react-hot-toast';

// Update color constants to match Spiral logo colors
const SPIRAL_COLORS = {
  gold: { bg: '#e6b44c', text: '#e6b44c' },
  blue: { bg: '#53c5eb', text: '#53c5eb' },
  darkBlue: { bg: '#004080', text: '#004080' },
  lightGold: { bg: '#f8e8c6', text: '#e6b44c' },
  lightBlue: { bg: '#e0f5fc', text: '#53c5eb' },
  border: '#e6b44c'
};

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onWidthChange: (width: number) => void;
  mainChatMessages: any[];
  onMainChatInteraction: (action: 'copy' | 'workflow' | 'attach' | 'search', content: string) => void;
  children?: React.ReactNode;
  activeTab?: 'chat' | 'research' | 'agent' | 'history' | 'documents';
  onTabChange?: (tab: 'chat' | 'research' | 'agent' | 'history' | 'documents') => void;
}

interface SideMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  reference?: {
    type: 'main-chat' | 'analysis';
    messageId?: string;
  };
}

interface Workflow {
  id: string;
  name: string;
  prompt: string;
  createdAt: Date;
  lastRun?: Date;
}

interface SuggestedQuestion {
  id: string;
  text: string;
  category: 'clarification' | 'solution' | 'exploration' | 'technical';
  complexity: 'simple' | 'moderate' | 'complex';
  expectedOutcome: string;
  reasoning?: string;
  followUp?: string[];
}

interface AnalysisResult {
  topics: string[];
  keyPoints: string[];
  technicalConcepts: string[];
  researchGaps: string[];
  suggestedWorkflows: {
    goal: string;
    steps: string[];
    requiredInfo: string[];
  }[];
  thoughtPrompts: string[];
  potentialChallenges: string[];
  nextSteps: string[];
}

interface AttachedDocument {
  id: string;
  name: string;
  type: string;
  content: string;
  createdAt: Date;
  tags: string[];
}

interface ContextItem {
  id: string;
  type: 'document' | 'message' | 'workflow';
  reference: string;
  relevance: number;
}

interface QuestionData {
  text: string;
  category: 'clarification' | 'solution' | 'exploration' | 'technical';
  complexity: 'simple' | 'moderate' | 'complex';
  expectedOutcome: string;
}

interface AnalysisResponse {
  questions: QuestionData[];
  analysis: {
    topics: string[];
    keyPoints: string[];
    technicalConcepts: string[];
    suggestedApproach?: string;
  };
}

const MIN_WIDTH = 400;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 500;
const COLLAPSED_WIDTH = 40;

// Add UUID generation function for browser compatibility
function generateUUID() {
  // Simple UUID generation that doesn't rely on crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Add these functions if they don't exist in ChatScreen.tsx
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

export default function RightSidebar({
  isOpen,
  onClose,
  onWidthChange,
  mainChatMessages,
  onMainChatInteraction,
  children,
  activeTab: parentActiveTab = 'chat',
  onTabChange
}: RightSidebarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [activeTab, setActiveTab] = useState<'chat' | 'research' | 'agent' | 'history' | 'documents'>(parentActiveTab);
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<SideMessage[]>([]);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [attachedDocuments, setAttachedDocuments] = useState<AttachedDocument[]>([]);
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const { modelService } = useModelStore();
  const {
    chats,
    activeChat,
    clearAllChats
  } = useChatStore();
  const [isStepsOpen, setIsStepsOpen] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const { profile: themeProfile } = useThemeStore();
  
  // Check if we're using the Office theme profile
  const isOfficeStyle = themeProfile === 'office' as ColorProfile;
  // Check if we're using the Spiral theme profile
  const isSpiralStyle = themeProfile === 'spiral' as ColorProfile;

  // Update activeTab when parentActiveTab changes
  useEffect(() => {
    if (parentActiveTab) {
      setActiveTab(parentActiveTab);
    }
  }, [parentActiveTab]);
  
  // Notify parent when activeTab changes
  const handleTabChange = (tab: 'chat' | 'research' | 'agent' | 'history' | 'documents') => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const sidebarRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const startResizeX = useRef<number>(0);
  const startWidth = useRef<number>(0);

  const activeChatMessages = activeChat ? chats.find(chat => chat.id === activeChat)?.messages || [] : [];

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update parent when width changes
  useEffect(() => {
    if (!isOpen) return;
    onWidthChange(width);
  }, [width, onWidthChange, isOpen]);

  // Handle resize
  useEffect(() => {
      if (!isResizing) return;
      
    function onMouseMove(e: MouseEvent) {
      if (!sidebarRef.current) return;
      const newWidth = Math.min(
        Math.max(
          startWidth.current - (e.clientX - startResizeX.current),
          MIN_WIDTH
        ),
        MAX_WIDTH
      );
        setWidth(newWidth);
      onWidthChange(newWidth);
      }

    function onMouseUp() {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isResizing, onWidthChange]);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    startResizeX.current = e.clientX;
    startWidth.current = width;
    setIsResizing(true);
    document.body.style.cursor = 'ew-resize';
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;
    
    // Add your message handling logic here
    const newMessage: SideMessage = {
      id: generateUUID(),
      role: 'user',
      content: inputValue
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    // Process the message...
  };

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCreateWorkflow = (message: SideMessage) => {
    // First, add the workflow to the workflows list
    const newWorkflow: Workflow = {
      id: generateUUID(),
      name: message.content.substring(0, 50) + '...',  // Use first 50 chars as default name
      prompt: message.content,
      createdAt: new Date()
    };

    setWorkflows(prev => [...prev, newWorkflow]);
    
    // Then switch to the agent tab to show the new workflow
    setActiveTab('agent');
  };

  const handleQuestionClick = (question: string) => {
    console.log("Question clicked:", question);
    
    // First add a confirmation message in the sidebar
    const analysisMessage: SideMessage = {
      id: generateUUID(),
      role: 'assistant',
      content: `Question sent to main chat: "${question}"`,
      reference: { type: 'analysis' }
    };
    setMessages(prev => [...prev, analysisMessage]);
    
    // Track if the search action was successful
    let searchActionTriggered = false;
    
    // Then send the question to the main chat with a slight delay
    // This ensures the UI updates before potentially heavy processing
    setTimeout(() => {
      try {
        console.log("Triggering search action for:", question);
        onMainChatInteraction('search', question);
        searchActionTriggered = true;
    } catch (error) {
        console.error("Error triggering search action:", error);
        
        // Add an error message to the sidebar
      const errorMessage: SideMessage = {
          id: generateUUID(),
        role: 'assistant',
          content: `Error sending question to main chat. Please try again with a shorter or simpler question.`,
          reference: { type: 'analysis' }
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    }, 100);
    
    // Check if the search action was triggered after a delay
    setTimeout(() => {
      if (!searchActionTriggered) {
        // Add a fallback message to the sidebar
        const fallbackMessage: SideMessage = {
          id: generateUUID(),
          role: 'assistant',
          content: `The question may have been too complex. Try breaking it down into smaller parts or rephrasing it.`,
          reference: { type: 'analysis' }
        };
        setMessages(prev => [...prev, fallbackMessage]);
      }
    }, 5000);
  };

  const runWorkflow = async (workflow: Workflow) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const streamingId = generateUUID();
      const streamingMessage: SideMessage = {
        id: streamingId,
        role: 'assistant',
        content: '',
        reference: { type: 'analysis' }
      };
      setMessages(prev => [...prev, streamingMessage]);

      const stream = await modelService.generateChatStream([
        { role: 'system', content: 'Running workflow: ' + workflow.name },
        { role: 'user', content: workflow.prompt }
      ]);

      let accumulated = '';
      for await (const chunk of stream) {
        accumulated += chunk;
        setMessages(prev => 
          prev.map(msg => 
            msg.id === streamingId 
              ? { ...msg, content: accumulated }
              : msg
          )
        );
      }

      // Update workflow last run time
      setWorkflows(prev => 
        prev.map(w => 
          w.id === workflow.id 
            ? { ...w, lastRun: new Date() }
            : w
        )
      );
    } catch (error) {
      console.error('Error running workflow:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add new functions for document handling
  const handleDocumentAttachment = async (files: FileList) => {
    const newDocuments: AttachedDocument[] = [];
    
    for (const file of Array.from(files)) {
      if (file.type.includes('text') || file.type.includes('application/json')) {
        const content = await file.text();
        newDocuments.push({
          id: generateUUID(),
          name: file.name,
          type: file.type,
          content,
          createdAt: new Date(),
          tags: []
        });
      }
    }

    setAttachedDocuments(prev => [...prev, ...newDocuments]);
  };

  const analyzeDocuments = async (documents: AttachedDocument[]) => {
    if (documents.length === 0) return;
    setIsProcessing(true);

    try {
      for (const doc of documents) {
        const analysisPrompt = `Analyze this document and provide:
1. Key topics and concepts
2. Relevant technical details
3. Potential connections to the current conversation
4. Suggested tags for categorization

Document: ${doc.name}
Content: ${doc.content.substring(0, 1000)}...`;

        const stream = await modelService.generateChatStream([
          { role: 'system', content: 'You are an expert at analyzing technical documents and finding relevant connections.' },
          { role: 'user', content: analysisPrompt }
        ]);

        let response = '';
        for await (const chunk of stream) {
          response += chunk;
        }

        try {
          const analysis = JSON.parse(response);
          setAttachedDocuments(prev => 
            prev.map(d => 
              d.id === doc.id 
                ? { ...d, tags: [...d.tags, ...analysis.suggestedTags] }
                : d
            )
          );

          // Add to context items
          setContextItems(prev => [...prev, {
            id: generateUUID(),
            type: 'document',
            reference: doc.id,
            relevance: analysis.relevance || 0.5
          }]);
    } catch (error) {
          console.error('Error parsing document analysis:', error);
        }
      }
    } catch (error) {
      console.error('Error analyzing documents:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const searchDocuments = async (query: string) => {
    setIsSearching(true);
    try {
      const results = attachedDocuments.filter(doc => 
        doc.content.toLowerCase().includes(query.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      // Sort by relevance
      results.sort((a, b) => {
        const aRelevance = contextItems.find(item => item.reference === a.id)?.relevance || 0;
        const bRelevance = contextItems.find(item => item.reference === b.id)?.relevance || 0;
        return bRelevance - aRelevance;
      });

      return results;
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearHistory = () => {
    clearAllChats();
    setShowClearHistoryConfirm(false);
  };

  // Add real-time analysis with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timeoutId = setTimeout(() => {
      // Only analyze if we have messages or if we're in research tab
      if (mainChatMessages.length > 0 || activeTab === 'research') {
        analyzeMainChat();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [mainChatMessages, isOpen, activeTab]);

  const analyzeMainChat = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);

    const MAX_RETRIES = 2;
    let retryCount = 0;
    let success = false;

    while (!success && retryCount <= MAX_RETRIES) {
      try {
        const context = mainChatMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        // If no messages, provide a default context
        if (context.length === 0) {
          context.push({
            role: 'assistant' as const,
            content: 'Starting a new conversation. I will help analyze and guide the research process.'
          });
        }

        // For retries, simplify the prompt
        let analysisPrompt = '';
        if (retryCount === 0) {
          analysisPrompt = `Analyze this conversation and provide real-time guidance to help drive the research forward.

Current conversation:
${context.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

Respond with ONLY a valid JSON object containing:
1. Relevant questions to drive the conversation forward
2. Analysis of key points and concepts
3. Suggested next steps and workflows

The JSON must match this structure exactly:
{
  "questions": [
    {
      "text": "question text",
      "category": "clarification | solution | exploration | technical",
      "complexity": "simple | moderate | complex",
      "expectedOutcome": "what answering will achieve"
    }
  ],
  "analysis": {
    "topics": ["key topics"],
    "keyPoints": ["main points"],
    "technicalConcepts": ["technical terms"],
    "researchGaps": ["areas needing investigation"],
    "suggestedWorkflows": [
      {
        "goal": "workflow goal",
        "steps": ["steps to take"],
        "requiredInfo": ["needed information"]
      }
    ],
    "thoughtPrompts": ["thinking prompts"],
    "potentialChallenges": ["challenges"],
    "nextSteps": ["actions to take"]
  }
}`;
        } else {
          // Simplified prompt for retries
          analysisPrompt = `Analyze this conversation briefly and suggest a few follow-up questions.

Current conversation:
${context.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

Respond with ONLY a valid JSON object containing:
{
  "questions": [
    {
      "text": "question text",
      "category": "clarification",
      "complexity": "simple",
      "expectedOutcome": "what answering will achieve"
    }
  ],
  "analysis": {
    "topics": ["key topics"],
    "keyPoints": ["main points"],
    "technicalConcepts": ["technical terms"]
  }
}`;
        }

        const stream = await modelService.generateChatStream([
          { 
            role: 'system', 
            content: 'You are a research assistant focused on providing real-time analysis and guidance. Output ONLY valid JSON.' 
          },
          { role: 'user', content: analysisPrompt }
        ]);

        let fullResponse = '';
        let validJsonFound = false;

        try {
          for await (const chunk of stream) {
            fullResponse += chunk;
            
            // Try to parse JSON as it comes in
            try {
              const jsonMatch = fullResponse.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                
                // Update questions if valid
                if (parsed.questions && Array.isArray(parsed.questions)) {
                  const validQuestions = parsed.questions
                    .filter((q: Partial<QuestionData>) => 
                      q.text && q.category && q.complexity && q.expectedOutcome
                    )
                    .map((q: QuestionData) => ({
                      id: generateUUID(),
                      text: q.text,
                      category: q.category,
                      complexity: q.complexity,
                      expectedOutcome: q.expectedOutcome
                    }));
                  
                  setSuggestedQuestions(validQuestions);
                  validJsonFound = true;
                }

                // Update analysis if valid
                if (parsed.analysis) {
                  setAnalysisResult({
                    topics: parsed.analysis.topics || [],
                    keyPoints: parsed.analysis.keyPoints || [],
                    technicalConcepts: parsed.analysis.technicalConcepts || [],
                    researchGaps: parsed.analysis.researchGaps || [],
                    suggestedWorkflows: parsed.analysis.suggestedWorkflows || [],
                    thoughtPrompts: parsed.analysis.thoughtPrompts || [],
                    potentialChallenges: parsed.analysis.potentialChallenges || [],
                    nextSteps: parsed.analysis.nextSteps || []
                  });
                  validJsonFound = true;
                }
              }
            } catch (error) {
              // Ignore parsing errors while streaming
              console.debug('Parsing in progress...');
            }
          }
          
          // If we got here without errors and found valid JSON, mark as success
          if (validJsonFound) {
            success = true;
          } else if (retryCount < MAX_RETRIES) {
            console.log(`No valid JSON found in response, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
            retryCount++;
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            // Last attempt failed, but we'll exit the loop
            console.error('Failed to get valid JSON after all retries');
            success = true; // To exit the loop
          }
        } catch (streamError) {
          console.error('Stream processing error:', streamError);
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Stream error, retrying (${retryCount}/${MAX_RETRIES})...`);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            // Last attempt failed, but we'll exit the loop
            console.error('Failed to process stream after all retries');
            success = true; // To exit the loop
          }
        }
      } catch (error) {
        console.error(`Error in analyzeMainChat (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);
        
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
        } else {
          // Last attempt failed
          setSuggestedQuestions([]);
          setAnalysisResult(null);
          success = true; // To exit the loop
        }
      }
    }
    
    setIsAnalyzing(false);
  };

  // Handle document processing for AI Assistant
  const processDocumentTask = (taskType: string) => {
    // Show feedback that the task is being processed
    const newMessage: SideMessage = {
      id: generateUUID(),
      role: 'assistant',
      content: `Starting task: ${taskType}. This may take a moment...`,
      reference: { type: 'analysis' }
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Send the task to the main chat
    onMainChatInteraction('search', taskType);
    
    // Switch to the chat tab after initiating a task
    handleTabChange('chat');
  };

  const getTabContent = () => {
    switch (activeTab) {
      case 'chat':
  return (
          <div className="flex-1 flex flex-col">
            <div className={cn(
              "p-4 border-b",
              isOfficeStyle ? "border-[#e1dfdd] bg-white" : 
              isSpiralStyle ? "border-[#e6b44c] bg-white" : 
              "border-gray-200 bg-white"
            )}>
              <h2 className={cn(
                "text-lg font-medium mb-2",
                isOfficeStyle ? "text-[#0078d4]" : 
                isSpiralStyle ? "text-[#004080]" : 
                ""
              )}>Chat</h2>
              <p className="text-sm text-gray-600">
                Discuss your current conversation or ask questions about anything.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "p-3 rounded-lg max-w-[80%]",
                    message.role === 'user' ? (
                      isOfficeStyle ? "bg-[#deecf9] text-gray-800 ml-auto" : 
                      isSpiralStyle ? "bg-[#f8e8c6] text-gray-800 ml-auto" : 
                      "bg-blue-100 text-gray-800 ml-auto"
                    ) : (
                      isOfficeStyle ? "bg-white border border-[#e1dfdd]" : 
                      isSpiralStyle ? "bg-white border border-[#e6b44c]" : 
                      "bg-white border border-gray-200"
                    )
                  )}
                >
                  {message.content}
                  {message.reference && (
                    <div className={cn(
                      "mt-1 text-xs p-1 rounded",
                      isOfficeStyle ? "bg-[#f3f2f1] text-[#0078d4]" : 
                      isSpiralStyle ? "bg-[#f5f1e5] text-[#004080]" : 
                      "bg-gray-100 text-blue-600"
                    )}>
                      Referencing main chat
                    </div>
                  )}
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-center space-x-2 p-3 rounded-lg bg-white border border-gray-200 max-w-[80%]">
                  <Loader2 className={cn(
                    "h-4 w-4 animate-spin",
                    isOfficeStyle ? "text-[#0078d4]" : 
                    isSpiralStyle ? "text-[#004080]" : 
                    "text-blue-500"
                  )} />
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              )}
            </div>
          </div>
        );
      case 'research':
        return (
          <div className="flex-1 flex flex-col">
            <div className={cn(
              "p-4 border-b",
              isOfficeStyle ? "border-[#e1dfdd] bg-white" : 
              isSpiralStyle ? "border-[#e6b44c] bg-white" : 
              "border-gray-200 bg-white"
            )}>
              <h2 className={cn(
                "text-lg font-medium mb-2",
                isOfficeStyle ? "text-[#0078d4]" : 
                isSpiralStyle ? "text-[#004080]" : 
                ""
              )}>Research Assistant</h2>
              <p className="text-sm text-gray-600">
                I can analyze your conversation and provide research insights and suggestions.
              </p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-200px)]">
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-6 text-gray-500">
                  <Loader2 className={cn(
                    "h-5 w-5 mr-2 animate-spin",
                    isOfficeStyle ? "text-[#0078d4]" : 
                    isSpiralStyle ? "text-[#004080]" : 
                    "text-blue-500"
                  )} />
                  <span>Analyzing conversation...</span>
                </div>
              ) : (
                <ResearchAssistant 
                  messages={mainChatMessages}
                  onSuggestionClick={(suggestion) => {
                    // Set the input value in the sidebar chat
                    setInputValue(suggestion);
                    
                    // Send this suggestion to the main chat and auto-submit
                    if (onMainChatInteraction) {
                      // Log for debugging
                      console.log('Sending suggestion to main chat:', suggestion);
                      
                      // Make sure we're using the right action type - should be 'workflow'
                      onMainChatInteraction('workflow', suggestion);
                      
                      // Show visual feedback that the suggestion was sent
                      toast.success("Suggestion sent to main chat", {
                        duration: 2000,
                        position: 'bottom-right',
                      });
                    } else {
                      console.error('onMainChatInteraction is not defined');
                      toast.error("Unable to send suggestion to main chat", {
                        duration: 2000,
                        position: 'bottom-right',
                      });
                    }
                  }}
                />
              )}
            </div>
          </div>
        );
      case 'agent':
        return (
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-medium mb-2">AI Assistant</h2>
              <p className="text-sm text-gray-600">
                I can suggest tasks and analyze your documents to help you work more efficiently.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Task Suggestions Section */}
              <div className="mb-4">
                <h3 className="text-base font-medium mb-3 text-gray-700">Suggested Tasks</h3>
                <div className="space-y-2">
                  {attachedDocuments.length > 0 ? (
                    <>
                      <button
                        onClick={() => processDocumentTask('Analyze the key themes across all my uploaded documents')}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-[#e1effa] hover:border-[#0078d4] transition-colors"
                      >
                        <div className="flex items-start">
                          <FileText className="h-5 w-5 text-[#0078d4] mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-[#0078d4]">Analyze Document Themes</h4>
                            <p className="text-sm text-gray-600 mt-1">Identify key themes and concepts across all uploaded documents</p>
          </div>
        </div>
                      </button>

      <button
                        onClick={() => processDocumentTask('Summarize the content of all my documents')}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-[#e1effa] hover:border-[#0078d4] transition-colors"
                      >
                        <div className="flex items-start">
                          <MessageSquare className="h-5 w-5 text-[#0078d4] mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-[#0078d4]">Generate Executive Summary</h4>
                            <p className="text-sm text-gray-600 mt-1">Create a concise summary of all document content</p>
                          </div>
                        </div>
      </button>

          <button
                        onClick={() => processDocumentTask('Compare and contrast the information in my documents')}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-[#e1effa] hover:border-[#0078d4] transition-colors"
                      >
                        <div className="flex items-start">
                          <Bot className="h-5 w-5 text-[#0078d4] mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-[#0078d4]">Compare Documents</h4>
                            <p className="text-sm text-gray-600 mt-1">Identify similarities, differences, and contradictions</p>
                          </div>
                        </div>
          </button>
                      
          <button
                        onClick={() => processDocumentTask('Extract actionable insights from all documents')}
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-[#e1effa] hover:border-[#0078d4] transition-colors"
                      >
                        <div className="flex items-start">
                          <Sparkles className="h-5 w-5 text-[#0078d4] mr-3 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-[#0078d4]">Extract Actionable Insights</h4>
                            <p className="text-sm text-gray-600 mt-1">Highlight key findings and next steps from your documents</p>
                          </div>
                        </div>
          </button>
                    </>
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-sm mb-3">Upload documents to get AI-powered task suggestions</p>
          <button
                        onClick={() => handleTabChange('documents')}
                        className="px-4 py-2 bg-[#0078d4] text-white rounded-sm hover:bg-[#106ebe] transition-colors text-sm"
                      >
                        Go to Documents
          </button>
                    </div>
                  )}
                </div>
        </div>

              {/* Saved Workflows Section */}
              <div className="mt-6">
                <h3 className="text-base font-medium mb-3 text-gray-700">Saved Workflows</h3>
                <div className="space-y-3">
                  {workflows.length > 0 ? (
                    workflows.map(workflow => (
                      <div
                        key={workflow.id}
                        className="p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800">{workflow.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">
                              Created {new Date(workflow.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <button
                            onClick={() => runWorkflow(workflow)}
                            className="p-1 hover:bg-[#e1effa] rounded transition-colors"
                            disabled={isProcessing}
                          >
                            <PlayCircle className="h-4 w-4 text-[#0078d4]" />
                          </button>
                        </div>
                        {workflow.lastRun && (
                          <p className="text-xs text-gray-500 mt-2">
                            Last run: {new Date(workflow.lastRun).toLocaleString()}
                          </p>
                      )}
                    </div>
                    ))
                  ) : (
                    <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-gray-500 text-sm">No workflows saved yet. Chat responses can be saved as workflows.</p>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="p-4 space-y-4">
            {/* History content goes here */}
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500 text-sm">Chat history will be displayed here</p>
            </div>
          </div>
        );
      case 'documents':
        return (
          <div className="p-4 space-y-4">
            {/* Document Upload */}
            <div className="flex items-center gap-2">
                      <input
                type="file"
                multiple
                onChange={(e) => e.target.files && handleDocumentAttachment(e.target.files)}
                className="hidden"
                id="document-upload"
                accept=".txt,.json,.md,.js,.ts,.py,.html,.css"
              />
              <label
                htmlFor="document-upload"
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4 text-[#0078d4]" />
                <span className="text-sm text-gray-700">Attach Documents</span>
              </label>
            </div>

            {/* Document List */}
            <div className="space-y-3">
              {attachedDocuments.map(doc => (
                <div
                  key={doc.id}
                  className={cn(
                    "p-4 rounded-lg border border-gray-200 transition-colors",
                    activeDocumentId === doc.id ? "bg-gray-50" : "bg-white hover:bg-gray-50"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-gray-800">{doc.name}</h4>
                      <p className="text-xs text-gray-500">
                        Added {new Date(doc.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveDocumentId(doc.id === activeDocumentId ? null : doc.id)}
                      className="p-1 hover:bg-[#e1effa] rounded transition-colors"
                    >
                      {activeDocumentId === doc.id ? (
                        <ChevronUp className="h-4 w-4 text-[#0078d4]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                  )}
                </button>
                      </div>

                  {/* Tags */}
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doc.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full bg-[#e1effa] text-[#0078d4]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
          )}

                  {/* Document Preview */}
                  {activeDocumentId === doc.id && (
                    <div className="mt-4 space-y-2">
                      <div className="max-h-48 overflow-y-auto rounded bg-gray-50 p-3 border border-gray-200">
                        <pre className="text-xs whitespace-pre-wrap text-gray-700">
                          {doc.content.substring(0, 500)}...
                        </pre>
                      </div>
                      <div className="flex items-center gap-2">
                  <button
                          onClick={() => handleCopy(doc.content, doc.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          {copiedId === doc.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copiedId === doc.id ? 'Copied!' : 'Copy'}
                  </button>
                        <button
                          onClick={() => onMainChatInteraction('attach', doc.content)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <Link className="h-3 w-3" />
                          Reference in Chat
                        </button>
                    </div>
                    </div>
                      )}
                    </div>
                  ))}
              
              {attachedDocuments.length === 0 && (
                <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500 text-sm">No documents attached yet</p>
              </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={containerRef}
                  className={cn(
        "h-full overflow-hidden flex flex-col relative",
        isOpen ? "w-full" : "w-0"
      )}
      style={{ width: `${width}px` }}
    >
      <div className={cn(
        "flex w-full px-3 py-2 border-b space-x-3",
        isOfficeStyle ? "bg-white border-[#e1dfdd]" : 
        isSpiralStyle ? "bg-white border-[#e6b44c]" : 
        "bg-white border-gray-200"
      )}>
          <button
            className={cn(
            "flex-1 flex justify-center items-center py-1.5 px-3 rounded-md text-sm font-medium",
            activeTab === 'chat' ? (
              isOfficeStyle ? "bg-[#e1effa] text-[#0078d4]" : 
              isSpiralStyle ? "bg-[#f8e8c6] text-[#004080]" : 
              "bg-gray-100 text-gray-800"
            ) : (
              isOfficeStyle ? "text-gray-600 hover:bg-[#f3f2f1]" : 
              isSpiralStyle ? "text-gray-600 hover:bg-[#f8e8c6]/50" : 
              "text-gray-600 hover:bg-gray-100"
            )
          )}
          onClick={() => handleTabChange('chat')}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Chat
          </button>
          <button
            className={cn(
            "flex-1 flex justify-center items-center py-1.5 px-3 rounded-md text-sm font-medium",
            activeTab === 'research' ? (
              isOfficeStyle ? "bg-[#e1effa] text-[#0078d4]" : 
              isSpiralStyle ? "bg-[#f8e8c6] text-[#004080]" : 
              "bg-gray-100 text-gray-800"
            ) : (
              isOfficeStyle ? "text-gray-600 hover:bg-[#f3f2f1]" : 
              isSpiralStyle ? "text-gray-600 hover:bg-[#f8e8c6]/50" : 
              "text-gray-600 hover:bg-gray-100"
            )
          )}
          onClick={() => handleTabChange('research')}
        >
          <FileText className="h-4 w-4 mr-1" />
          Research
          </button>
          <button
            className={cn(
            "flex-1 flex justify-center items-center py-1.5 px-3 rounded-md text-sm font-medium",
            activeTab === 'agent' ? (
              isOfficeStyle ? "bg-[#e1effa] text-[#0078d4]" : 
              isSpiralStyle ? "bg-[#f8e8c6] text-[#004080]" : 
              "bg-gray-100 text-gray-800"
            ) : (
              isOfficeStyle ? "text-gray-600 hover:bg-[#f3f2f1]" : 
              isSpiralStyle ? "text-gray-600 hover:bg-[#f8e8c6]/50" : 
              "text-gray-600 hover:bg-gray-100"
            )
          )}
          onClick={() => handleTabChange('agent')}
        >
          <Sparkles className="h-4 w-4 mr-1" />
          AI Assistant
        </button>
        <button
          className={cn(
            "w-8 h-8 flex items-center justify-center rounded-md",
            isOfficeStyle ? "text-gray-600 hover:bg-[#f3f2f1]" : 
            isSpiralStyle ? "text-gray-600 hover:bg-[#f8e8c6]/50" : 
            "text-gray-600 hover:bg-gray-100"
          )}
          onClick={onClose}
        >
          <ChevronRight className="h-4 w-4" />
          </button>
                  </div>

      {/* Resizable Handle */}
      <div
                    className={cn(
          "absolute top-0 left-0 bottom-0 w-1 cursor-ew-resize transition-colors",
          isResizing ? (
            isOfficeStyle ? "bg-[#0078d4]" : 
            isSpiralStyle ? "bg-[#e6b44c]" : 
            "bg-blue-500"
          ) : "bg-transparent hover:bg-gray-300"
        )}
        onMouseDown={startResize}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {children}

        {/* Main Content Based on Tab */}
        <div className="flex-1 overflow-y-auto">
          {getTabContent()}
                  </div>

      {/* Message Input for Chat Tab */}
      {activeTab === 'chat' && (
        <div className={cn(
          "p-4 border-t",
          isOfficeStyle ? "border-[#e1dfdd]" : 
          isSpiralStyle ? "border-[#e6b44c]" : 
          "border-gray-200"
        )}>
          <div className="flex items-center rounded-lg border border-gray-300 bg-white overflow-hidden">
                      <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 focus:outline-none"
                />
                <button
              onClick={handleSubmit}
              disabled={isProcessing || !inputValue.trim()}
                  className={cn(
                "p-2 rounded-r-lg",
                isProcessing ? "opacity-50 cursor-not-allowed" : "",
                inputValue.trim() ? (
                  isOfficeStyle ? "bg-[#0078d4] text-white" : 
                  isSpiralStyle ? "bg-[#004080] text-white" : 
                  "bg-blue-500 text-white"
                ) : (
                  isOfficeStyle ? "bg-gray-100 text-gray-400" : 
                  isSpiralStyle ? "bg-gray-100 text-gray-400" : 
                  "bg-gray-100 text-gray-400"
                )
              )}
            >
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
                  )}
                </button>
                      </div>
          </div>
        )}
                </div>
      </div>
  );
} 