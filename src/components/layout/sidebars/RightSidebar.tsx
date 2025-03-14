import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Bot, History, Send, GripVertical, ChevronRight, ChevronLeft, Loader2, Copy, Sparkles, Check, PlayCircle, PlusCircle, HelpCircle, File, Upload, Link, ChevronUp, ChevronDown, Eraser } from 'lucide-react';
import { cn } from '@utils/cn';
import type { ChatMessage } from '@stores/chat/chatStore';
import { useModelStore } from '@stores/model/modelStore';
import { useChatStore } from '@stores/chat/chatStore';
import ChatScreen from '../../chat/ChatScreen';

// Add color constants
const GOOGLE_COLORS = {
  blue: { bg: '#1a73e8', text: '#1967d2' },
  red: { bg: '#ea4335', text: '#d93025' },
  yellow: { bg: '#fbbc04', text: '#ea8600' },
  green: { bg: '#34a853', text: '#137333' },
  grey: { bg: '#f1f3f4', text: '#5f6368' },
  border: '#dadce0'
};

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onWidthChange: (width: number) => void;
  mainChatMessages: any[];
  onMainChatInteraction: (action: 'copy' | 'workflow' | 'attach' | 'search', content: string) => void;
  children?: React.ReactNode;
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
  children
}: RightSidebarProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'research' | 'agent' | 'history' | 'documents'>('chat');
  const [messages, setMessages] = useState<SideMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { modelService } = useModelStore();
  const {
    chats,
    activeChat,
    clearAllChats
  } = useChatStore();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showWorkflowCreate, setShowWorkflowCreate] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<SideMessage | null>(null);
  const [attachedDocuments, setAttachedDocuments] = useState<AttachedDocument[]>([]);
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showClearHistoryConfirm, setShowClearHistoryConfirm] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<SuggestedQuestion[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userMessage: SideMessage = {
      id: generateUUID(),
      content: inputValue,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    try {
      // Create streaming message
      const streamingId = generateUUID();
      const streamingMessage: SideMessage = {
        id: streamingId,
        role: 'assistant',
        content: '',
        reference: { type: 'analysis' }
      };
      setMessages(prev => [...prev, streamingMessage]);

      // Prepare context with main chat messages
      const context = [
        {
          role: 'system' as const,
          content: `You are a helpful AI assistant that can analyze the main conversation and answer questions about it, or help with any other topics. 
          
Current main conversation context:
${mainChatMessages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n')}

Remember:
1. You can reference and analyze the main conversation
2. You can also help with new, unrelated topics
3. Be clear when you're referencing the main conversation vs discussing new topics`
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user' as const, content: inputValue }
      ];

      // Stream the response
      const stream = await modelService.generateChatStream(context);
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
    } catch (error) {
      console.error('Error in side chat:', error);
      setMessages(prev => [...prev, {
        id: generateUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        reference: { type: 'analysis' }
      }]);
    } finally {
      setIsProcessing(false);
    }
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

  const getTabContent = () => {
    switch (activeTab) {
      case 'chat':
  return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {messages.map((message, index) => (
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
                              Assistant
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
                            {copiedId === message.id ? (
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
          <button
                            onClick={() => {
                              handleCreateWorkflow(message);
                              onMainChatInteraction('workflow', message.content);
                            }}
            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-lg transition-all duration-200",
                              "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100",
                              "bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700",
                              "border border-slate-200 dark:border-slate-600",
                              "shadow-sm hover:shadow-md transform-gpu hover:-translate-y-0.5"
                            )}
                            title="Save as workflow"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            <span className="font-medium">Save as Workflow</span>
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
                        <div dangerouslySetInnerHTML={{ __html: formatStreamingContent(message.content) }} />
                      ) : (
                        message.content.split('\n\n').map((paragraph, index) => (
                          <p key={index} className="mb-4">{paragraph}</p>
                        ))
                      )}
                    </div>
                  </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                </div>
          </div>
        );
      case 'research':
        return (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4">
              {isAnalyzing && (
                <div className="text-gray-500 italic mb-4">
                  Analyzing conversation...
                </div>
              )}
              
              {analysisResult && (
                <>
                  {/* Suggested Workflows - Moved to top */}
                  {analysisResult.suggestedWorkflows && analysisResult.suggestedWorkflows.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2">Suggested Workflows</h3>
                      <div className="space-y-3">
                        {analysisResult.suggestedWorkflows.map((workflow, index) => (
                          <div key={index} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 shadow-md">
                            <h4 className="font-medium mb-1 text-lg">{workflow.goal}</h4>
                            <ul className="list-disc list-inside mb-2 text-sm">
                              {workflow.steps.map((step, stepIndex) => (
                                <li key={stepIndex}>{step}</li>
                              ))}
                            </ul>
                <button
                              className="mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors"
                              onClick={() => handleQuestionClick(`Help me with this workflow: ${workflow.goal}`)}
                            >
                              Send to Chat →
                </button>
                          </div>
                        ))}
                      </div>
                    </div>
          )}

                  {/* Combined Questions Section - Thought Prompts + Suggested Questions */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">Questions to Explore</h3>
                <div className="space-y-2">
                      {/* Thought Prompts */}
                      {analysisResult.thoughtPrompts && analysisResult.thoughtPrompts.length > 0 && (
                        <>
                          {analysisResult.thoughtPrompts.map((prompt, index) => (
                            <div key={`thought-${index}`} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 shadow-md">
                              <p className="text-sm mb-2">{prompt}</p>
                  <button
                                className="mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors"
                                onClick={() => handleQuestionClick(prompt)}
                  >
                                Send to Chat →
                  </button>
                            </div>
                          ))}
                        </>
                      )}

                      {/* Suggested Questions */}
                      {suggestedQuestions && suggestedQuestions.length > 0 && (
                        <>
                          {suggestedQuestions.map((question, index) => (
                            <div key={`question-${index}`} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 shadow-md">
                              <p className="text-sm mb-2">{question.text}</p>
                              <div className="flex gap-2 text-xs text-gray-500 mb-2">
                                <span>{question.category}</span>
                                <span>•</span>
                                <span>{question.complexity}</span>
                              </div>
                              <button
                                className="mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors"
                                onClick={() => handleQuestionClick(question.text)}
                              >
                                Send to Chat →
                              </button>
                            </div>
                          ))}
                        </>
                      )}
                </div>
                    </div>

                  {/* Research Gaps - Moved to bottom */}
                  {analysisResult.researchGaps && analysisResult.researchGaps.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold mb-2">Research Gaps</h3>
                <div className="space-y-2">
                        {analysisResult.researchGaps.map((gap, index) => (
                          <div key={index} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/90 shadow-md">
                            <p className="text-sm mb-2">{gap}</p>
                            <button
                              className="mt-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md text-sm font-medium transition-colors"
                              onClick={() => handleQuestionClick(`How can I address this research gap: ${gap}`)}
                            >
                              Send to Chat →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      case 'agent':
        return (
          <div className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-[#dadce0]">
                      <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#202124]">Saved Workflows</h3>
              <span className="text-xs text-[#5f6368]">
                {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
                        </span>
                    </div>
            <div className="space-y-3">
              {workflows.map(workflow => (
                <div
                  key={workflow.id}
                  className="p-3 rounded-lg border border-[#dadce0] hover:bg-[#f8f9fa] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-[#202124]">{workflow.name}</h4>
                      <p className="text-xs text-[#5f6368] mt-1">
                        Created {new Date(workflow.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => runWorkflow(workflow)}
                      className="p-1 hover:bg-[#e8f0fe] rounded transition-colors"
                      disabled={isProcessing}
                    >
                      <PlayCircle className="h-4 w-4 text-[#1a73e8]" />
                    </button>
                  </div>
                  {workflow.lastRun && (
                    <p className="text-xs text-[#5f6368] mt-2">
                      Last run: {new Date(workflow.lastRun).toLocaleString()}
                    </p>
                  )}
                    </div>
                  ))}
              </div>
            </div>
        );
      case 'history':
        return (
          <div className="space-y-4">
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
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[#dadce0] hover:bg-[#f8f9fa] transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4 text-[#1a73e8]" />
                <span className="text-sm text-[#202124]">Attach Documents</span>
              </label>
              
              {/* Search Documents */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search documents..."
                  className="w-full px-4 py-2 rounded-lg border border-[#dadce0] bg-white text-[#202124] placeholder:text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[#5f6368]" />
                )}
              </div>
            </div>

            {/* Document List */}
            <div className="space-y-3">
              {attachedDocuments.map(doc => (
                <div
                  key={doc.id}
                  className={cn(
                    "p-4 rounded-lg border border-[#dadce0] transition-colors",
                    activeDocumentId === doc.id ? "bg-[#f8f9fa]" : "bg-white hover:bg-[#f8f9fa]"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium text-[#202124]">{doc.name}</h4>
                      <p className="text-xs text-[#5f6368]">
                        Added {new Date(doc.createdAt).toLocaleString()}
                      </p>
                  </div>
                    <button
                      onClick={() => setActiveDocumentId(doc.id === activeDocumentId ? null : doc.id)}
                      className="p-1 hover:bg-[#e8f0fe] rounded transition-colors"
                    >
                      {activeDocumentId === doc.id ? (
                        <ChevronUp className="h-4 w-4 text-[#1a73e8]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#5f6368]" />
                      )}
                    </button>
                      </div>

                  {/* Tags */}
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {doc.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 text-xs rounded-full bg-[#e8f0fe] text-[#1967d2]"
                        >
                          {tag}
                        </span>
              ))}
                        </div>
                      )}

                  {/* Document Preview */}
                  {activeDocumentId === doc.id && (
                    <div className="mt-4 space-y-2">
                      <div className="max-h-48 overflow-y-auto rounded bg-[#f8f9fa] p-3 border border-[#dadce0]">
                        <pre className="text-xs whitespace-pre-wrap text-[#202124]">
                          {doc.content.substring(0, 500)}...
                        </pre>
                    </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(doc.content, doc.id)}
                          className="flex items-center gap-1 text-xs text-[#5f6368] hover:text-[#202124]"
                        >
                          {copiedId === doc.id ? (
                            <Check className="h-3 w-3 text-[#34a853]" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          {copiedId === doc.id ? 'Copied!' : 'Copy'}
                        </button>
                        <button
                          onClick={() => onMainChatInteraction('attach', doc.content)}
                          className="flex items-center gap-1 text-xs text-[#5f6368] hover:text-[#202124]"
                        >
                          <Link className="h-3 w-3" />
                          Reference in Chat
                        </button>
                  </div>
          </div>
        )}
                      </div>
              ))}
                        </div>
      </div>
  );
      default:
        return null;
    }
  };

  return (
    <div 
      ref={sidebarRef}
      className="h-full flex flex-col relative bg-white"
    >
      {/* Resize Handle */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-[#dadce0] transition-colors"
        onMouseDown={startResize}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Tabs - Fixed at top */}
        <div className="shrink-0 flex border-b border-[#dadce0] bg-white z-10">
          <TabButton 
            icon={<MessageSquare className="h-4 w-4" />} 
            label="Chat" 
            isActive={activeTab === 'chat'} 
            onClick={() => setActiveTab('chat')}
            color={GOOGLE_COLORS.blue}
          />
          <TabButton 
            icon={<Sparkles className="h-4 w-4" />} 
            label="Research" 
            isActive={activeTab === 'research'} 
            onClick={() => setActiveTab('research')}
            color={GOOGLE_COLORS.yellow}
          />
          <TabButton 
            icon={<Bot className="h-4 w-4" />} 
            label="Agent" 
            isActive={activeTab === 'agent'} 
            onClick={() => setActiveTab('agent')}
            color={GOOGLE_COLORS.green}
          />
          <TabButton 
            icon={<History className="h-4 w-4" />} 
            label="History" 
            isActive={activeTab === 'history'} 
            onClick={() => setActiveTab('history')}
            color={GOOGLE_COLORS.red}
          />
          <TabButton 
            icon={<File className="h-4 w-4" />} 
            label="Docs" 
            isActive={activeTab === 'documents'} 
            onClick={() => setActiveTab('documents')}
            color={GOOGLE_COLORS.grey}
          />
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          {children}
          
          <div className="p-4 space-y-4">
            {getTabContent()}
                    </div>
                  </div>

        {/* Input Area - Fixed at bottom */}
        {activeTab === 'chat' && (
          <div className="shrink-0 border-t border-[#dadce0] bg-white shadow-[0_-2px_8px_rgba(60,64,67,0.1)]">
            <form onSubmit={handleSubmit} className="px-4 py-3 flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="Ask about the conversation or anything else..."
                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white text-[#202124] placeholder:text-[#5f6368] focus:outline-none focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent"
                disabled={isProcessing}
              />
              <button
                type="submit"
                disabled={isProcessing || !inputValue.trim()}
                className={cn(
                  "px-4 py-2 rounded-lg transition-colors flex items-center justify-center min-w-[48px]",
                  "bg-[#1a73e8] text-white hover:bg-[#1557b0]",
                  "disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                )}
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Clear History Confirmation Modal */}
      {showClearHistoryConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-[#202124] mb-2">Clear Chat History</h3>
            <p className="text-sm text-[#5f6368] mb-4">
              Are you sure you want to clear all chat history? This will delete all chats, including pinned and saved ones. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearHistoryConfirm(false)}
                className="px-4 py-2 rounded-lg hover:bg-[#f1f3f4] text-[#5f6368]"
              >
                Cancel
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 rounded-lg bg-[#d93025] text-white hover:bg-[#c5221f]"
              >
                Clear All History
              </button>
            </div>
          </div>
          </div>
        )}
      </div>
  );
}

function TabButton({ icon, label, isActive, onClick, color }: { 
  icon: React.ReactNode; 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
  color: { bg: string; text: string };
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3",
        "text-sm font-medium transition-colors relative",
        isActive 
          ? `text-[${color.text}]` 
          : "text-[#5f6368] hover:text-[#202124]",
        "after:absolute after:bottom-0 after:left-0 after:right-0",
        "after:h-[3px] after:transition-all after:duration-200",
        isActive && `after:bg-[${color.text}]`
      )}
    >
      {icon}
      {label}
    </button>
  );
} 