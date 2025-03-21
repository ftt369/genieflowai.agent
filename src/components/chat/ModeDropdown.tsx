import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  Search, 
  PlusCircle, 
  Settings, 
  Edit, 
  Save, 
  X, 
  Tag, 
  Sliders, 
  Thermometer, 
  Copy, 
  GripVertical, 
  Eye, 
  Star, 
  Upload, 
  Download, 
  Heart, 
  Share2, 
  ArrowDownCircle, 
  Filter, 
  CheckSquare, 
  Square, 
  ArrowRight, 
  Sparkles,
  MessageSquare,
  Bot,
  Microscope,
  Code,
  Target,
  Briefcase,
  PenTool,
  FileText,
  GraduationCap,
  Landmark,
  Brain,
  Flame,
  Zap,
  HelpCircle,
  Lightbulb,
  Library,
  Laptop,
  ClipboardList,
  Globe,
  Music,
  Wand2,
  Beaker
} from 'lucide-react';
import { useModeStore, type AssistantMode } from '@/stores/model/modeStore';
import { useThemeStore } from '@/stores/theme/themeStore';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Function to map emoji icons to Lucide icons
const getLucideIcon = (iconString: string, size: "sm" | "md" | "lg" = "md") => {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };
  
  const className = sizeMap[size];
  
  const iconMap: Record<string, React.ReactNode> = {
    // Chat and messaging
    '💬': <MessageSquare className={className} />,
    
    // Search and research
    '🔍': <Search className={className} />,
    
    // Legal 
    '⚖️': <Landmark className={className} />,
    
    // Education
    '👨‍🏫': <GraduationCap className={className} />,
    
    // Goals and targeting
    '🎯': <Target className={className} />,
    
    // Business
    '💼': <Briefcase className={className} />,
    
    // Writing
    '✍️': <PenTool className={className} />,
    
    // Code and development
    '💻': <Code className={className} />,
    
    // AI and brain
    '🧠': <Brain className={className} />,
    
    // Science
    '🔬': <Microscope className={className} />,
    
    // Documents
    '📝': <FileText className={className} />,
    
    // Robots and AI
    '🤖': <Bot className={className} />,
    
    // Energy and power
    '⚡': <Zap className={className} />,
    
    // Knowledge and books
    '📚': <Library className={className} />,
    
    // Global and world
    '🌎': <Globe className={className} />,
    
    // Science experiments
    '🧪': <Beaker className={className} />,
    
    // Ideas
    '💡': <Lightbulb className={className} />,
    
    // Magic and special effects
    '✨': <Sparkles className={className} />,
    
    // Art
    '🎨': <PenTool className={className} />,
    
    // Data and analytics
    '📊': <ClipboardList className={className} />,
    
    // Hot, trending
    '🔥': <Flame className={className} />,
    
    // Storage
    '💾': <Laptop className={className} />,
    
    // Music and audio
    '🎵': <Music className={className} />,
    
    // Help and questions
    '❓': <HelpCircle className={className} />
  };

  return iconMap[iconString] || <Bot className={className} />;
};

export default function ModeDropdown() {
  const { modes, activeMode, setActiveMode, customModes, addCustomMode, updateMode, deleteCustomMode, recentlyUsedModes, reorderModes, toggleFavorite, favoriteModesIds, resetToDefaultModes } = useModeStore();
  const { profile } = useThemeStore();
  const [showMenu, setShowMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModeDialog, setShowModeDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCompareDialog, setShowCompareDialog] = useState(false);
  const [showAIHelperDialog, setShowAIHelperDialog] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AssistantMode | null>(null);
  const [editedMode, setEditedMode] = useState<AssistantMode | null>(null);
  const [modesToCompare, setModesToCompare] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [aiHelperOptions, setAIHelperOptions] = useState({
    purpose: 'general',
    style: 'balanced',
    length: 'medium',
    includeExamples: true,
    customGoal: ''
  });
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const isSpiralStyle = profile === 'spiral';
  
  // Get the current mode
  const currentMode = modes.find(mode => mode.id === activeMode);
  
  // Group modes by category
  const groupedModes = modes.reduce((acc, mode) => {
    const category = mode.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(mode);
    return acc;
  }, {} as Record<string, typeof modes>);
  
  // Filter modes based on search query
  const filterModes = (modesList: typeof modes) => {
    if (!searchQuery) return modesList;
    return modesList.filter(mode => 
      mode.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mode.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (mode.tags && mode.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
  };
  
  // Handle mode selection
  const handleSelectMode = (modeId: string) => {
    setActiveMode(modeId);
    setShowMenu(false);
  };
  
  // Handle create mode
  const handleCreateMode = () => {
    setShowMenu(false);
    setShowTemplateDialog(true);
  };
  
  // Handle template selection
  const handleTemplateSelect = (templateType: string) => {
    let newMode: AssistantMode;
    
    // Define templates
    switch(templateType) {
      case 'blank':
        newMode = {
          id: `custom_${Date.now()}`,
          name: 'New Custom Mode',
          description: 'Custom assistant mode',
          systemPrompt: 'You are a helpful assistant specialized in the following area...',
          temperature: 0.7,
          icon: '✨',
          category: 'Custom',
          tags: ['custom'],
          maxTokens: 2048,
          topP: 0.9
        };
        break;
      case 'creative':
        newMode = {
          id: `custom_${Date.now()}`,
          name: 'Creative Assistant',
          description: 'Helps with creative writing and brainstorming',
          systemPrompt: 'You are a creative assistant who helps users with writing, brainstorming, and generating original ideas. Be imaginative, engaging, and inspiring in your responses.',
          temperature: 0.9,
          icon: '🎨',
          category: 'Creative',
          tags: ['creative', 'writing', 'ideas'],
          maxTokens: 2048,
          topP: 0.95
        };
        break;
      case 'professional':
        newMode = {
          id: `custom_${Date.now()}`,
          name: 'Professional Assistant',
          description: 'Helps with business writing and communication',
          systemPrompt: 'You are a professional assistant who helps users with business communication, professional writing, and workplace tasks. Maintain a formal, clear, and concise tone.',
          temperature: 0.5,
          icon: '💼',
          category: 'Professional',
          tags: ['business', 'professional', 'formal'],
          maxTokens: 2048,
          topP: 0.8
        };
        break;
      case 'technical':
        newMode = {
          id: `custom_${Date.now()}`,
          name: 'Technical Expert',
          description: 'Helps with technical explanations and problem-solving',
          systemPrompt: 'You are a technical expert who helps users understand complex concepts, troubleshoot problems, and implement solutions. Be precise, informative, and focus on providing accurate technical details.',
          temperature: 0.3,
          icon: '💻',
          category: 'Technical',
          tags: ['technical', 'expert', 'technology'],
          maxTokens: 2048,
          topP: 0.8
        };
        break;
      default:
        newMode = {
          id: `custom_${Date.now()}`,
          name: 'New Custom Mode',
          description: 'Custom assistant mode',
          systemPrompt: 'You are a helpful assistant specialized in the following area...',
          temperature: 0.7,
          icon: '✨',
          category: 'Custom',
          tags: ['custom'],
          maxTokens: 2048,
          topP: 0.9
        };
    }
    
    setEditedMode(newMode);
    setShowTemplateDialog(false);
    setShowEditDialog(true);
  };
  
  // Handle edit mode
  const handleEditMode = (mode: AssistantMode) => {
    setSelectedMode(mode);
    setEditedMode({...mode});
    setShowEditDialog(true);
  };
  
  // Handle save mode
  const handleSaveMode = () => {
    if (!editedMode) return;
    
    if (editedMode.id.startsWith('custom_')) {
      // Add new custom mode
      if (!customModes.some(m => m.id === editedMode.id)) {
        addCustomMode(editedMode);
      } else {
        // Update existing custom mode
        updateMode(editedMode.id, editedMode);
      }
    } else {
      // Update an existing preset mode
      updateMode(editedMode.id, editedMode);
    }
    
    setShowEditDialog(false);
    setEditedMode(null);
    setSelectedMode(null);
  };
  
  // Handle duplicate mode
  const handleDuplicateMode = (mode: AssistantMode) => {
    const duplicatedMode: AssistantMode = {
      ...mode,
      id: `custom_${Date.now()}`,
      name: `${mode.name} (Copy)`,
    };
    
    addCustomMode(duplicatedMode);
    setShowModeDialog(false);
  };
  
  // Handle delete mode
  const handleDeleteMode = (modeId: string) => {
    if (modeId.startsWith('custom_')) {
      deleteCustomMode(modeId);
    }
  };
  
  // Handle favorite toggle
  const handleToggleFavorite = (e: React.MouseEvent, modeId: string) => {
    e.stopPropagation();
    toggleFavorite(modeId);
  };
  
  // Export custom modes
  const handleExportCustomModes = () => {
    if (customModes.length === 0) {
      alert("You don't have any custom modes to export.");
      return;
    }
    
    const exportData = JSON.stringify(customModes, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genieagent-custom-modes-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Import custom modes
  const handleImportCustomModes = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedModes = JSON.parse(event.target?.result as string);
          
          if (!Array.isArray(importedModes)) {
            alert('Invalid file format. Expected an array of modes.');
            return;
          }
          
          // Validate each mode has required properties
          const validModes = importedModes.filter(mode => 
            mode.id && mode.name && mode.systemPrompt && typeof mode.temperature === 'number'
          );
          
          if (validModes.length === 0) {
            alert('No valid modes found in the imported file.');
            return;
          }
          
          // Add timestamp to IDs to ensure uniqueness
          const timestamp = Date.now();
          const modesToImport = validModes.map((mode, index) => ({
            ...mode,
            id: `custom_import_${timestamp}_${index}`,
          }));
          
          // Ask for confirmation
          const confirmImport = confirm(`Import ${modesToImport.length} custom mode(s)?`);
          if (confirmImport) {
            modesToImport.forEach(mode => {
              addCustomMode(mode);
            });
            alert(`Successfully imported ${modesToImport.length} mode(s).`);
          }
        } catch (error) {
          console.error('Error importing modes:', error);
          alert('Error importing modes. Please check the file format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  // Handle export single mode
  const handleExportMode = (e: React.MouseEvent, mode: AssistantMode) => {
    e.stopPropagation();
    
    // Clone the mode and remove any internal fields that shouldn't be shared
    const modeToExport = { ...mode };
    // Strip custom_ prefix from id for better portability
    if (modeToExport.id.startsWith('custom_')) {
      modeToExport.id = modeToExport.id.replace(/^custom_\d+_?/, 'shared_');
    }
    
    // Create a JSON file to download
    const exportData = JSON.stringify(modeToExport, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mode.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Sort modes by category and then name
  const sortedGroupedModes = Object.entries(groupedModes).sort((a, b) => {
    // Sort categories in custom order
    const categoryOrder = ['Favorites', 'Recently Used', 'General', 'Professional', 'Academic', 'Technical', 'Creative', 'Research', 'Personal', 'Custom', 'Other'];
    const aIndex = categoryOrder.indexOf(a[0]);
    const bIndex = categoryOrder.indexOf(b[0]);
    
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    } else if (aIndex !== -1) {
      return -1;
    } else if (bIndex !== -1) {
      return 1;
    }
    
    return a[0].localeCompare(b[0]);
  });
  
  // Handle click outside menu to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Keyboard navigation support
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Alt+m to toggle mode dropdown
    if (e.altKey && e.key === 'm') {
      e.preventDefault();
      setShowMenu(prev => !prev);
    }
    
    // Close dialogs with Escape
    if (e.key === 'Escape') {
      if (showEditDialog) {
        setShowEditDialog(false);
      } else if (showModeDialog) {
        setShowModeDialog(false);
      } else if (showMenu) {
        setShowMenu(false);
      }
    }
  }, [showMenu, showModeDialog, showEditDialog]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  // Import a single mode from file
  const handleImportSingleMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedMode = JSON.parse(event.target?.result as string);
          
          // Validate mode has required properties
          if (!importedMode.name || !importedMode.systemPrompt || typeof importedMode.temperature !== 'number') {
            alert('Invalid mode format. Missing required properties.');
            return;
          }
          
          // Create new ID to ensure uniqueness
          const newMode = {
            ...importedMode,
            id: `custom_import_${Date.now()}`
          };
          
          // Open edit dialog with the imported mode
          setEditedMode(newMode);
          setShowTemplateDialog(false);
          setShowModeDialog(false);
          setShowEditDialog(true);
        } catch (error) {
          console.error('Error importing mode:', error);
          alert('Error importing mode. Please check the file format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  // Backup all modes (both preset and custom)
  const handleBackupAllModes = () => {
    const allModes = {
      modes: modes,
      activeMode: activeMode,
      favorites: favoriteModesIds,
      recentlyUsed: recentlyUsedModes
    };
    
    const exportData = JSON.stringify(allModes, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `genieagent-all-modes-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Restore all modes from backup
  const handleRestoreAllModes = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const backup = JSON.parse(event.target?.result as string);
          
          // Validate backup has required properties
          if (!Array.isArray(backup.modes) || !backup.activeMode) {
            alert('Invalid backup format. Missing required properties.');
            return;
          }
          
          // Confirm restore
          const message = 'This will replace all your current modes with the backup. Continue?';
          if (confirm(message)) {
            // Reset to defaults then restore from backup
            resetToDefaultModes();
            
            // Process each mode in the backup
            backup.modes.forEach((mode: AssistantMode) => {
              if (mode.id.startsWith('custom_')) {
                addCustomMode(mode);
              } else {
                // Update preset mode
                updateMode(mode.id, mode);
              }
            });
            
            // Restore active mode
            setActiveMode(backup.activeMode);
            
            alert('Backup restored successfully!');
          }
        } catch (error) {
          console.error('Error restoring backup:', error);
          alert('Error restoring backup. Please check the file format.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };
  
  // Add toggle mode selection for comparison
  const toggleModeForComparison = (modeId: string) => {
    if (modesToCompare.includes(modeId)) {
      setModesToCompare(modesToCompare.filter(id => id !== modeId));
    } else {
      // Limit to max 3 modes for comparison
      if (modesToCompare.length < 3) {
        setModesToCompare([...modesToCompare, modeId]);
      }
    }
  };
  
  // Add handleCompare function
  const handleCompare = () => {
    if (modesToCompare.length < 2) {
      alert("Please select at least 2 modes to compare.");
      return;
    }
    setShowCompareDialog(true);
  };
  
  // Get available categories from modes
  const availableCategories = React.useMemo(() => {
    const categories = new Set<string>();
    modes.forEach(mode => {
      if (mode.category) {
        categories.add(mode.category);
      }
    });
    return Array.from(categories).sort();
  }, [modes]);
  
  // Filter modes by selected categories
  const filterModesByCategory = (modesList: typeof modes) => {
    if (categoryFilter.length === 0) return modesList;
    return modesList.filter(mode => 
      mode.category && categoryFilter.includes(mode.category)
    );
  };
  
  // Toggle category selection
  const toggleCategoryFilter = (category: string) => {
    if (categoryFilter.includes(category)) {
      setCategoryFilter(categoryFilter.filter(c => c !== category));
    } else {
      setCategoryFilter([...categoryFilter, category]);
    }
  };
  
  // Add the AI prompt helper examples and templates
  const promptTemplates = {
    general: "You are a helpful assistant specialized in [area]. You provide clear, accurate information and respond to user queries in a helpful manner.",
    
    creative: "You are a creative assistant with expertise in [area]. Bring imaginative thinking and originality to every conversation, generating novel ideas and content.",
    
    educational: "You are an educational assistant focused on [subject]. Explain concepts clearly, provide examples, and help users develop a deep understanding of topics.",
    
    professional: "You are a professional consultant with expertise in [field]. Provide formal, accurate, and practical advice while maintaining professional language and tone.",
    
    technical: "You are a technical expert in [technology/field]. Offer precise technical information, troubleshooting advice, and implementation guidance with accuracy.",
    
    conversational: "You are a friendly, conversational assistant. Engage in natural-feeling dialogue, respond with personality, and make interactions feel human and approachable."
  };
  
  // Add AI helper function
  const generateAIPrompt = () => {
    if (!editedMode) return;
    
    setIsGeneratingPrompt(true);
    
    // This would normally connect to an AI service, but we'll simulate it
    setTimeout(() => {
      const { purpose, style, length, includeExamples, customGoal } = aiHelperOptions;
      
      // Start with the template based on purpose
      let generatedPrompt = promptTemplates[purpose as keyof typeof promptTemplates] || promptTemplates.general;
      
      // Replace placeholder with mode name or category
      generatedPrompt = generatedPrompt.replace('[area]', editedMode.category || 'general assistance');
      generatedPrompt = generatedPrompt.replace('[field]', editedMode.category || 'your field');
      generatedPrompt = generatedPrompt.replace('[subject]', editedMode.category || 'various subjects');
      generatedPrompt = generatedPrompt.replace('[technology/field]', editedMode.category || 'technology');
      
      // Add style adjustments
      if (style === 'formal') {
        generatedPrompt += "\n\nMaintain a formal, professional tone in all communications. Use precise language, avoid colloquialisms, and structure responses with clarity and directness.";
      } else if (style === 'casual') {
        generatedPrompt += "\n\nUse a casual, approachable tone. Feel free to use conversational language, be friendly, and engage in a relaxed manner while still being helpful and informative.";
      } else if (style === 'technical') {
        generatedPrompt += "\n\nEmphasize technical accuracy and detail in your responses. Use domain-specific terminology appropriately and provide in-depth explanations when necessary.";
      }
      
      // Add examples if requested
      if (includeExamples) {
        generatedPrompt += "\n\n## Examples of Good Responses:\n";
        generatedPrompt += "1. When asked a factual question: Provide a clear, accurate answer followed by additional context or related information.\n";
        generatedPrompt += "2. When asked for an opinion: Offer a balanced perspective that considers different viewpoints and clarify that this represents a range of thinking on the topic.\n";
        generatedPrompt += "3. When receiving ambiguous queries: Ask clarifying questions to better understand the user's needs before providing a comprehensive response.";
      }
      
      // Add length guidance
      if (length === 'concise') {
        generatedPrompt += "\n\nProvide concise, direct responses that address the core question efficiently. Avoid unnecessary elaboration unless specifically requested.";
      } else if (length === 'detailed') {
        generatedPrompt += "\n\nOffer comprehensive, detailed responses with thorough explanations, relevant examples, and supporting information to provide complete understanding.";
      }
      
      // Add custom goal if provided
      if (customGoal) {
        generatedPrompt += `\n\n## Special Focus:\n${customGoal}`;
      }
      
      // Add standard conclusion with tags
      generatedPrompt += "\n\n## Guidelines:\n";
      generatedPrompt += "- Always prioritize accuracy and helpfulness\n";
      generatedPrompt += "- Respect user privacy and maintain confidentiality\n";
      generatedPrompt += "- Acknowledge limitations when uncertain\n";
      generatedPrompt += "- Adapt tone and detail level based on user needs";
      
      // Update the edited mode
      setEditedMode({
        ...editedMode,
        systemPrompt: generatedPrompt
      });
      
      setIsGeneratingPrompt(false);
      setShowAIHelperDialog(false);
    }, 1500); // Simulate AI processing time
  };
  
  return (
    <>
      <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
              isSpiralStyle && "hover:bg-blue-50 dark:hover:bg-blue-900/20"
            )}
            title="Select mode (Alt+M)"
          >
            <span className="text-sm font-medium flex items-center">
              {currentMode?.icon && <span className="mr-1">{getLucideIcon(currentMode.icon, "sm")}</span>}
              <span className="max-w-[120px] truncate hidden sm:block">{currentMode?.name || 'Standard Chat'}</span>
              <span className="sm:hidden">Mode</span>
            </span>
            <ChevronDown className={cn(
              "h-4 w-4 opacity-70",
              isSpiralStyle ? "text-blue-500" : "text-gray-500"
            )} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          ref={menuRef} 
          className="w-64 max-h-[70vh] overflow-y-auto bg-background border border-border shadow-lg" 
          align="start"
        >
          <div className="p-2">
            <Input
              type="text"
              placeholder="Search modes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mb-2"
              prefix={<Search className="h-4 w-4 text-gray-500" />}
            />
          </div>
          
          <DropdownMenuSeparator />
          
          {/* Categorized Modes */}
          {!searchQuery ? (
            <>
              {/* Favorite modes */}
              {favoriteModesIds.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Favorites
                  </div>
                  {modes
                    .filter(mode => favoriteModesIds.includes(mode.id))
                    .map(mode => (
                      <DropdownMenuItem 
                        key={`favorite-${mode.id}`}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          mode.id === activeMode && "bg-gray-100 dark:bg-gray-800",
                          isSpiralStyle && mode.id === activeMode && "bg-blue-50 dark:bg-blue-900/20"
                        )}
                        onClick={() => handleSelectMode(mode.id)}
                      >
                        <span className="text-lg">{getLucideIcon(mode.icon, "md")}</span>
                        <div className="flex-1">
                          <span className="font-medium">{mode.name}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{mode.description}</span>
                        </div>
                        <button 
                          onClick={(e) => handleToggleFavorite(e, mode.id)}
                          className="text-yellow-400"
                          title="Remove from favorites"
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </button>
                      </DropdownMenuItem>
                    ))
                  }
                  <DropdownMenuSeparator />
                </div>
              )}
              
              {/* Recently used modes */}
              {recentlyUsedModes.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    Recently Used
                  </div>
                  {recentlyUsedModes
                    .filter(modeId => modeId !== activeMode)
                    .slice(0, 3)
                    .map(modeId => {
                      const mode = modes.find(m => m.id === modeId);
                      if (!mode) return null;
                      return (
                        <DropdownMenuItem 
                          key={`recent-${mode.id}`}
                          className={cn(
                            "flex items-center gap-2 cursor-pointer",
                            "bg-gray-50 dark:bg-gray-800/50"
                          )}
                          onClick={() => handleSelectMode(mode.id)}
                        >
                          <span className="text-lg">{getLucideIcon(mode.icon, "md")}</span>
                          <div className="flex flex-col">
                            <span className="font-medium">{mode.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{mode.description}</span>
                          </div>
                        </DropdownMenuItem>
                      );
                    })
                  }
                  <DropdownMenuSeparator />
                </div>
              )}
              
              {/* Categorized modes */}
              {Object.entries(groupedModes).map(([category, categoryModes]) => (
                <div key={category}>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {category}
                  </div>
                  {categoryModes.map(mode => (
                    <DropdownMenuItem 
                      key={mode.id}
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        mode.id === activeMode && "bg-gray-100 dark:bg-gray-800",
                        isSpiralStyle && mode.id === activeMode && "bg-blue-50 dark:bg-blue-900/20"
                      )}
                      onClick={() => handleSelectMode(mode.id)}
                    >
                      <span className="text-lg">{getLucideIcon(mode.icon, "md")}</span>
                      <div className="flex-1">
                        <span className="font-medium">{mode.name}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{mode.description}</span>
                      </div>
                      <button 
                        onClick={(e) => handleToggleFavorite(e, mode.id)}
                        className={cn(
                          "opacity-50 hover:opacity-100",
                          favoriteModesIds.includes(mode.id) ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                        )}
                        title={favoriteModesIds.includes(mode.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star className={cn(
                          "h-4 w-4",
                          favoriteModesIds.includes(mode.id) && "fill-current"
                        )} />
                      </button>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                </div>
              ))}
            </>
          ) : (
            // Search Results
            filterModes(modes).length > 0 ? (
              filterModes(modes).map(mode => (
                <DropdownMenuItem 
                  key={mode.id}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer",
                    mode.id === activeMode && "bg-gray-100 dark:bg-gray-800",
                    isSpiralStyle && mode.id === activeMode && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                  onClick={() => handleSelectMode(mode.id)}
                >
                  <span className="text-lg">{getLucideIcon(mode.icon, "md")}</span>
                  <div className="flex-1">
                    <span className="font-medium">{mode.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{mode.description}</span>
                  </div>
                  <button 
                    onClick={(e) => handleToggleFavorite(e, mode.id)}
                    className={cn(
                      "opacity-50 hover:opacity-100",
                      favoriteModesIds.includes(mode.id) ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400"
                    )}
                    title={favoriteModesIds.includes(mode.id) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star className={cn(
                      "h-4 w-4",
                      favoriteModesIds.includes(mode.id) && "fill-current"
                    )} />
                  </button>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="px-2 py-4 text-center text-gray-500 dark:text-gray-400">
                No modes found
              </div>
            )
          )}
          
          <DropdownMenuSeparator />
          
          {/* Actions */}
          <div className="p-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                setShowMenu(false);
                setShowModeDialog(true);
              }}
            >
              <PlusCircle className="h-4 w-4" />
              <span>Manage Modes</span>
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Mode Management Dialog */}
      <Dialog open={showModeDialog} onOpenChange={setShowModeDialog}>
        <DialogContent className="sm:max-w-[525px] bg-background border border-border">
          <DialogHeader>
            <DialogTitle>Manage Assistant Modes</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="preset">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preset">Preset Modes</TabsTrigger>
              <TabsTrigger value="custom">Custom Modes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="preset" className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1" 
                      onClick={() => document.getElementById('categoryFilterDropdown')?.classList.toggle('hidden')}
                    >
                      <Filter className="h-3 w-3" />
                      <span className="text-xs">Filter</span>
                      {categoryFilter.length > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full w-4 h-4 flex items-center justify-center">
                          {categoryFilter.length}
                        </span>
                      )}
                    </Button>
                    <div 
                      id="categoryFilterDropdown" 
                      className="absolute left-0 top-full mt-1 z-50 bg-background border rounded-md shadow-md p-2 hidden"
                    >
                      <div className="text-xs font-medium mb-1">Categories</div>
                      {availableCategories.map(category => (
                        <div key={category} className="flex items-center gap-2 py-1">
                          <button
                            className="flex items-center"
                            onClick={() => toggleCategoryFilter(category)}
                          >
                            {categoryFilter.includes(category) ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </button>
                          <span className="text-xs">{category}</span>
                        </div>
                      ))}
                      <div className="border-t mt-1 pt-1 flex justify-between">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs" 
                          onClick={() => setCategoryFilter([])}
                        >
                          Clear
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs" 
                          onClick={() => document.getElementById('categoryFilterDropdown')?.classList.add('hidden')}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {modesToCompare.length > 0 && (
                    <div className="text-xs flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                      <span>{modesToCompare.length} selected</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-5 w-5 p-0" 
                        onClick={() => setModesToCompare([])}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                
                {modesToCompare.length >= 2 && (
                  <Button 
                    size="sm" 
                    onClick={handleCompare}
                  >
                    Compare
                  </Button>
                )}
              </div>
              
              <div className="grid gap-4">
                {filterModesByCategory(modes.filter(mode => !mode.id.startsWith('custom_'))).map((mode, index) => (
                  <div 
                    key={mode.id} 
                    className={cn(
                      "flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
                      modesToCompare.includes(mode.id) && "border-primary bg-blue-50 dark:bg-blue-900/20"
                    )}
                    onClick={() => {
                      setActiveMode(mode.id);
                      setShowModeDialog(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModeForComparison(mode.id);
                        }}
                        className="flex-shrink-0"
                      >
                        {modesToCompare.includes(mode.id) ? (
                          <CheckSquare className="h-4 w-4 text-primary" />
                        ) : (
                          <Square className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                      <span className="text-2xl">{getLucideIcon(mode.icon, "lg")}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{mode.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{mode.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleExportMode(e, mode);
                      }} title="Share mode">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateMode(mode);
                      }} title="Duplicate">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleEditMode(mode);
                      }} title="Customize">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="mt-4">
              <div className="grid gap-4">
                {customModes.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <select
                          className="text-xs px-2 py-1 rounded border bg-background"
                          onChange={(e) => {
                            const sortBy = e.target.value;
                            // Implementation would go here
                          }}
                        >
                          <option value="default">Sort: Default</option>
                          <option value="name">Sort: By Name</option>
                          <option value="recent">Sort: Most Recent</option>
                        </select>
                        
                        {modesToCompare.length > 0 && (
                          <div className="text-xs flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
                            <span>{modesToCompare.length} selected</span>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-5 w-5 p-0" 
                              onClick={() => setModesToCompare([])}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        {modesToCompare.length >= 2 && (
                          <Button 
                            size="sm" 
                            onClick={handleCompare}
                          >
                            Compare
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs flex items-center gap-1"
                          onClick={handleImportCustomModes}
                          title="Import custom modes"
                        >
                          <Upload className="h-3 w-3" />
                          Import
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs flex items-center gap-1"
                          onClick={handleExportCustomModes}
                          title="Export custom modes"
                        >
                          <Download className="h-3 w-3" />
                          Export
                        </Button>
                      </div>
                    </div>
                    
                    {customModes.map((mode, index) => (
                      <div 
                        key={mode.id} 
                        className={cn(
                          "flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer",
                          modesToCompare.includes(mode.id) && "border-primary bg-blue-50 dark:bg-blue-900/20"
                        )}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', mode.id);
                          e.currentTarget.classList.add('opacity-50');
                        }}
                        onDragEnd={(e) => {
                          e.currentTarget.classList.remove('opacity-50');
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.add('bg-blue-50');
                        }}
                        onDragLeave={(e) => {
                          e.currentTarget.classList.remove('bg-blue-50');
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.classList.remove('bg-blue-50');
                          const draggedId = e.dataTransfer.getData('text/plain');
                          const allModeIds = modes.map(m => m.id);
                          const draggedIndex = allModeIds.indexOf(draggedId);
                          const targetIndex = allModeIds.indexOf(mode.id);
                          
                          if (draggedIndex !== -1 && targetIndex !== -1) {
                            const newOrderedIds = [...allModeIds];
                            newOrderedIds.splice(draggedIndex, 1);
                            newOrderedIds.splice(targetIndex, 0, draggedId);
                            reorderModes(newOrderedIds);
                          }
                        }}
                        onClick={() => {
                          setActiveMode(mode.id);
                          setShowModeDialog(false);
                        }}
                      >
                        <div className="cursor-grab text-gray-400 hover:text-gray-600">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModeForComparison(mode.id);
                            }}
                            className="flex-shrink-0"
                          >
                            {modesToCompare.includes(mode.id) ? (
                              <CheckSquare className="h-4 w-4 text-primary" />
                            ) : (
                              <Square className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <span className="text-2xl">{getLucideIcon(mode.icon, "lg")}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{mode.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{mode.description}</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleExportMode(e, mode);
                          }} title="Share mode">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            handleEditMode(mode);
                          }} title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete "${mode.name}"?`)) {
                              handleDeleteMode(mode.id);
                            }
                          }} title="Delete">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p>You haven't created any custom modes yet.</p>
                    <div className="flex flex-col gap-2 items-center mt-2">
                      <Button onClick={handleCreateMode}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Create a Mode
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleImportCustomModes}
                        className="mt-2"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Modes
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              
              {customModes.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={handleCreateMode}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Mode
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Backup & Restore</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-background border border-border">
                      <DialogHeader>
                        <DialogTitle>Backup & Restore</DialogTitle>
                      </DialogHeader>
                      
                      <div className="grid gap-4 py-4">
                        <div className="border p-4 rounded-lg">
                          <h3 className="font-medium text-sm mb-2">Backup All Modes</h3>
                          <p className="text-xs text-gray-500 mb-3">
                            Create a complete backup of all your modes, including presets, custom modes, favorites, and settings.
                          </p>
                          <Button 
                            onClick={handleBackupAllModes}
                            className="w-full"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Create Backup
                          </Button>
                        </div>
                        
                        <div className="border p-4 rounded-lg">
                          <h3 className="font-medium text-sm mb-2">Restore From Backup</h3>
                          <p className="text-xs text-gray-500 mb-3">
                            Restore all modes and settings from a previously created backup file.
                            <span className="block mt-1 text-amber-500 font-medium">Warning: This will replace all your current modes!</span>
                          </p>
                          <Button 
                            onClick={handleRestoreAllModes}
                            variant="outline"
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Restore Backup
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      
      {/* Mode Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[600px] lg:max-w-[800px] bg-background border border-border">
          <DialogHeader>
            <DialogTitle>{editedMode?.id.startsWith('custom_') ? 'Edit Custom Mode' : 'Customize Mode'}</DialogTitle>
          </DialogHeader>
          
          {editedMode && (
            <div className="max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-1">
                    <label className="text-sm font-medium">Icon</label>
                    <div className="mt-1 p-2 border rounded-md text-center">
                      <span className="text-3xl">{getLucideIcon(editedMode.icon, "lg")}</span>
                    </div>
                    <div className="mt-2 relative">
                      <Input
                        className="pr-8"
                        value={editedMode.icon}
                        onChange={(e) => setEditedMode({...editedMode, icon: e.target.value})}
                        maxLength={2}
                        placeholder="Emoji"
                      />
                      <button 
                        type="button"
                        onClick={() => {
                          const commonEmojis = ["💬", "🔍", "⚖️", "📝", "👨‍🏫", "🎯", "💼", "✍️", "💻", "📊", "🧠", "🗣️", "📈", "🎨", "📋", "🤖", "🔧", "📚", "💡", "🔬"];
                          const emoji = commonEmojis[Math.floor(Math.random() * commonEmojis.length)];
                          setEditedMode({...editedMode, icon: emoji});
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title="Pick random emoji"
                      >
                        🎲
                      </button>
                    </div>
                    <div className="mt-2 grid grid-cols-7 gap-1">
                      {["💬", "🔍", "⚖️", "📝", "👨‍🏫", "🎯", "💼", "✍️", "💻", "📊", "🧠", "🗣️", "📈", "🎨", "📋", "🤖", "🔧", "📚", "💡", "🔬", "⭐"].map(emoji => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setEditedMode({...editedMode, icon: emoji})}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                      className="mt-1"
                      value={editedMode.name}
                      onChange={(e) => setEditedMode({...editedMode, name: e.target.value})}
                      placeholder="Mode name"
                    />
                    
                    <label className="text-sm font-medium block mt-4">Description</label>
                    <Input
                      className="mt-1"
                      value={editedMode.description}
                      onChange={(e) => setEditedMode({...editedMode, description: e.target.value})}
                      placeholder="Short description"
                    />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="text-sm font-medium block">Category</label>
                        <select
                          className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
                          value={editedMode.category || 'General'}
                          onChange={(e) => setEditedMode({...editedMode, category: e.target.value})}
                        >
                          {['General', 'Professional', 'Academic', 'Technical', 'Personal', 'Creative', 'Research', 'Custom'].map(
                            category => (
                              <option key={category} value={category}>{category}</option>
                            )
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium flex items-center gap-2">
                          <Thermometer className="h-4 w-4" />
                          Temperature: {editedMode.temperature.toFixed(1)}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={editedMode.temperature}
                          onChange={(e) => setEditedMode({...editedMode, temperature: parseFloat(e.target.value)})}
                          className="w-full mt-1"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Precise</span>
                          <span>Creative</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </label>
                  <Input
                    className="mt-1"
                    value={editedMode.tags ? editedMode.tags.join(', ') : ''}
                    onChange={(e) => setEditedMode({
                      ...editedMode, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    Advanced Settings
                  </label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <label className="text-xs">Max Tokens</label>
                      <Input
                        className="mt-1"
                        type="number"
                        value={editedMode.maxTokens || 2048}
                        onChange={(e) => setEditedMode({
                          ...editedMode, 
                          maxTokens: parseInt(e.target.value)
                        })}
                      />
                    </div>
                    <div>
                      <label className="text-xs">Top P</label>
                      <Input
                        className="mt-1"
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={editedMode.topP || 0.9}
                        onChange={(e) => setEditedMode({
                          ...editedMode, 
                          topP: parseFloat(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">System Prompt</label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs flex items-center gap-1"
                        onClick={() => setShowAIHelperDialog(true)}
                      >
                        <Sparkles className="h-3 w-3" />
                        AI Helper
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs flex items-center gap-1"
                        onClick={() => {
                          // Import from file
                          handleImportSingleMode({
                            stopPropagation: () => {},
                          } as React.MouseEvent);
                        }}
                      >
                        <ArrowDownCircle className="h-3 w-3" />
                        Import
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs flex items-center gap-1"
                        onClick={() => {
                          // Show a simplified preview of how the AI might respond with this prompt
                          alert(`System prompt preview:\n\n${editedMode.systemPrompt.substring(0, 200)}...\n\nThis sets the initial instructions for the AI assistant.`);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 border rounded-md overflow-hidden">
                    <div className="flex items-center px-2 py-1 bg-gray-50 dark:bg-gray-800 border-b">
                      <span className="text-xs text-gray-600 dark:text-gray-300">Write the AI system instructions below</span>
                    </div>
                    <textarea
                      className="w-full h-40 p-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      value={editedMode.systemPrompt}
                      onChange={(e) => setEditedMode({...editedMode, systemPrompt: e.target.value})}
                      placeholder="You are a helpful assistant specialized in..."
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>Tips for effective system prompts:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Start with a clear role definition (e.g., "You are a legal expert...")</li>
                      <li>Include specific instructions on tone, style, and format</li>
                      <li>Define boundaries and limitations</li>
                      <li>Use sections with clear headings for complex instructions</li>
                      <li>Keep instructions concise and unambiguous</li>
                    </ul>
                    
                    <details className="mt-2">
                      <summary className="cursor-pointer font-medium">Advanced Prompt Techniques</summary>
                      <div className="pl-2 mt-1 space-y-2 border-l-2 border-gray-200">
                        <div>
                          <p className="font-medium">Chain of Thought</p>
                          <p className="text-xs">Example: "Think step-by-step to solve this problem."</p>
                        </div>
                        <div>
                          <p className="font-medium">Few-Shot Learning</p>
                          <p className="text-xs">Example: "Here are examples of [task]: 1. Input: X, Output: Y, 2. Input: A, Output: B"</p>
                        </div>
                        <div>
                          <p className="font-medium">Persona Definition</p>
                          <p className="text-xs">Example: "You are an expert [profession] with 20 years of experience in..."</p>
                        </div>
                        <div>
                          <p className="font-medium">Output Structure</p>
                          <p className="text-xs">Example: "Format your response as: 1. Summary, 2. Analysis, 3. Recommendation"</p>
                        </div>
                      </div>
                    </details>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditedMode(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveMode}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Mode
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Template Selection Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="sm:max-w-[450px] bg-background border border-border">
          <DialogHeader>
            <DialogTitle>Choose a Template</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex justify-between">
              <p className="text-sm text-gray-500">Select a template to start with or create a blank mode:</p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs flex items-center gap-1"
                onClick={(e) => handleImportSingleMode(e)}
              >
                <ArrowDownCircle className="h-3 w-3 mr-1" />
                Import Mode
              </Button>
            </div>
            
            <div 
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => handleTemplateSelect('blank')}
            >
              <span className="text-2xl">✨</span>
              <div className="flex-1">
                <h3 className="font-medium">Blank Mode</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Start from scratch with an empty template</p>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => handleTemplateSelect('creative')}
            >
              <span className="text-2xl">🎨</span>
              <div className="flex-1">
                <h3 className="font-medium">Creative Assistant</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">For creative writing and brainstorming</p>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => handleTemplateSelect('professional')}
            >
              <span className="text-2xl">💼</span>
              <div className="flex-1">
                <h3 className="font-medium">Professional Assistant</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">For business writing and communication</p>
              </div>
            </div>
            
            <div 
              className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => handleTemplateSelect('technical')}
            >
              <span className="text-2xl">💻</span>
              <div className="flex-1">
                <h3 className="font-medium">Technical Expert</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">For technical explanations and problem-solving</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Mode Comparison Dialog */}
      <Dialog open={showCompareDialog} onOpenChange={setShowCompareDialog}>
        <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] bg-background border border-border">
          <DialogHeader>
            <DialogTitle>Compare Assistant Modes</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto py-4">
            <div className="grid" style={{ gridTemplateColumns: `150px repeat(${modesToCompare.length}, 1fr)` }}>
              {/* Header row */}
              <div className="p-2 font-medium"></div>
              {modesToCompare.map(modeId => {
                const mode = modes.find(m => m.id === modeId);
                if (!mode) return null;
                return (
                  <div key={mode.id} className="p-2 text-center border-l">
                    <div className="flex flex-col items-center mb-2">
                      <span className="text-2xl mb-1">{getLucideIcon(mode.icon, "lg")}</span>
                      <h3 className="font-medium">{mode.name}</h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{mode.description}</p>
                  </div>
                );
              })}
              
              {/* Properties rows */}
              <div className="p-2 font-medium bg-gray-50 dark:bg-gray-800">Category</div>
              {modesToCompare.map(modeId => {
                const mode = modes.find(m => m.id === modeId);
                if (!mode) return null;
                return (
                  <div key={`category-${mode.id}`} className="p-2 border-l bg-gray-50 dark:bg-gray-800">
                    {mode.category || 'General'}
                  </div>
                );
              })}
              
              <div className="p-2 font-medium">Temperature</div>
              {modesToCompare.map(modeId => {
                const mode = modes.find(m => m.id === modeId);
                if (!mode) return null;
                return (
                  <div key={`temp-${mode.id}`} className="p-2 border-l">
                    <div className="flex flex-col items-center">
                      <span className="font-medium">{mode.temperature.toFixed(1)}</span>
                      <span className="text-xs text-gray-500">
                        {mode.temperature <= 0.3 ? 'Precise' : 
                         mode.temperature <= 0.7 ? 'Balanced' : 'Creative'}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              <div className="p-2 font-medium bg-gray-50 dark:bg-gray-800">Tags</div>
              {modesToCompare.map(modeId => {
                const mode = modes.find(m => m.id === modeId);
                if (!mode) return null;
                return (
                  <div key={`tags-${mode.id}`} className="p-2 border-l bg-gray-50 dark:bg-gray-800">
                    <div className="flex flex-wrap gap-1">
                      {mode.tags?.map(tag => (
                        <span 
                          key={tag} 
                          className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              <div className="p-2 font-medium">System Prompt</div>
              {modesToCompare.map(modeId => {
                const mode = modes.find(m => m.id === modeId);
                if (!mode) return null;
                return (
                  <div key={`prompt-${mode.id}`} className="p-2 border-l">
                    <details>
                      <summary className="cursor-pointer text-sm text-blue-500">View prompt</summary>
                      <div className="mt-2 p-2 text-xs bg-gray-50 dark:bg-gray-800 rounded border max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                        {mode.systemPrompt}
                      </div>
                    </details>
                  </div>
                );
              })}
              
              <div className="p-2 font-medium bg-gray-50 dark:bg-gray-800">Advanced Settings</div>
              {modesToCompare.map(modeId => {
                const mode = modes.find(m => m.id === modeId);
                if (!mode) return null;
                return (
                  <div key={`advanced-${mode.id}`} className="p-2 border-l bg-gray-50 dark:bg-gray-800">
                    <div className="space-y-1 text-xs">
                      <div><span className="font-medium">Max Tokens:</span> {mode.maxTokens || 2048}</div>
                      <div><span className="font-medium">Top P:</span> {mode.topP || 0.9}</div>
                      {mode.frequencyPenalty !== undefined && 
                        <div><span className="font-medium">Frequency Penalty:</span> {mode.frequencyPenalty}</div>}
                      {mode.presencePenalty !== undefined && 
                        <div><span className="font-medium">Presence Penalty:</span> {mode.presencePenalty}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button 
                variant="outline" 
                onClick={() => setShowCompareDialog(false)}
              >
                Close
              </Button>
              <div className="space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    if (modesToCompare.length > 0) {
                      setActiveMode(modesToCompare[0]);
                      setShowCompareDialog(false);
                      setShowModeDialog(false);
                    }
                  }}
                  disabled={modesToCompare.length === 0}
                >
                  Use {modesToCompare.length > 0 ? modes.find(m => m.id === modesToCompare[0])?.name : 'Selected'}
                </Button>
                <Button
                  onClick={() => {
                    if (modesToCompare.length > 0) {
                      const baseMode = modes.find(m => m.id === modesToCompare[0]);
                      if (baseMode) {
                        handleDuplicateMode(baseMode);
                        setShowCompareDialog(false);
                      }
                    }
                  }}
                  disabled={modesToCompare.length === 0}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Selected
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* AI Prompt Helper Dialog */}
      <Dialog open={showAIHelperDialog} onOpenChange={setShowAIHelperDialog}>
        <DialogContent className="sm:max-w-[525px] bg-background border border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              AI Prompt Helper
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              Let our AI help you create an effective system prompt for your assistant mode. Customize the options below to get a tailored prompt.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Assistant Purpose</label>
                <select
                  className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
                  value={aiHelperOptions.purpose}
                  onChange={(e) => setAIHelperOptions({...aiHelperOptions, purpose: e.target.value})}
                >
                  <option value="general">General Assistant</option>
                  <option value="creative">Creative Assistant</option>
                  <option value="educational">Educational Assistant</option>
                  <option value="professional">Professional Consultant</option>
                  <option value="technical">Technical Expert</option>
                  <option value="conversational">Conversational Companion</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Communication Style</label>
                <select
                  className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
                  value={aiHelperOptions.style}
                  onChange={(e) => setAIHelperOptions({...aiHelperOptions, style: e.target.value})}
                >
                  <option value="balanced">Balanced</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Response Length</label>
                <select
                  className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
                  value={aiHelperOptions.length}
                  onChange={(e) => setAIHelperOptions({...aiHelperOptions, length: e.target.value})}
                >
                  <option value="medium">Balanced Length</option>
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeExamples"
                  checked={aiHelperOptions.includeExamples}
                  onChange={(e) => setAIHelperOptions({...aiHelperOptions, includeExamples: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <label htmlFor="includeExamples" className="text-sm">Include response examples</label>
              </div>
              
              <div>
                <label className="text-sm font-medium">Additional Goal (Optional)</label>
                <input
                  type="text"
                  value={aiHelperOptions.customGoal}
                  onChange={(e) => setAIHelperOptions({...aiHelperOptions, customGoal: e.target.value})}
                  placeholder="e.g., Focus on explaining concepts using analogies"
                  className="w-full mt-1 px-3 py-2 bg-background border border-input rounded-md"
                />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAIHelperDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={generateAIPrompt}
                disabled={isGeneratingPrompt}
                className="gap-2"
              >
                {isGeneratingPrompt ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-30 border-t-white rounded-full"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Generate Prompt
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 