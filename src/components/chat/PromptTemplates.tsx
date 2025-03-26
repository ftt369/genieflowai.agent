import React, { useState, useEffect } from 'react';
import { cn } from '@/utils/cn';
import { useThemeStore } from '@/stores/theme/themeStore';
import { 
  X, 
  Search, 
  Code, 
  Bug, 
  Sparkles, 
  BookOpen, 
  Scale, 
  FileCode, 
  TestTube, 
  Lightbulb,
  Wand2,
  Zap,
  Pencil,
  Braces,
  Layers,
  Workflow,
  Plus,
  Heart,
  Edit,
  Trash,
  Copy,
  Save,
  MoreHorizontal,
  Star,
  Filter,
  Clock
} from 'lucide-react';
import { generateUUID } from '@/utils/uuid';

interface PromptTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  prompt: string;
  variables: string[];
  category: 'code' | 'writing' | 'research' | 'creative' | 'utility' | 'custom';
  isCustom?: boolean;
  isFavorite?: boolean;
  lastUsed?: Date;
}

interface PromptTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (prompt: string) => void;
}

// Pre-defined templates
const DEFAULT_PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'explain-code',
    name: 'Explain Code',
    icon: <Code />,
    description: 'Get a detailed explanation of code',
    prompt: 'Explain the following code in detail:\n\n```{{language}}\n{{code}}\n```\n\nFocus on:\n- What the code does\n- Key functions and their purpose\n- Any patterns or techniques used\n- Potential improvements',
    variables: ['language', 'code'],
    category: 'code'
  },
  {
    id: 'debug-code',
    name: 'Debug Code',
    icon: <Bug />,
    description: 'Find and fix issues in code',
    prompt: 'Debug the following code and explain the issues:\n\n```{{language}}\n{{code}}\n```\n\nError/Issue: {{error}}\n\nPlease:\n1. Identify the root cause\n2. Explain the problem\n3. Provide a fixed version\n4. Suggest best practices to avoid similar issues',
    variables: ['language', 'code', 'error'],
    category: 'code'
  },
  {
    id: 'improve-code',
    name: 'Improve Code',
    icon: <Sparkles />,
    description: 'Enhance code quality and performance',
    prompt: 'Improve the following code:\n\n```{{language}}\n{{code}}\n```\n\nFocus on:\n- Performance optimization\n- Readability\n- Best practices\n- Error handling\n\nPlease explain your improvements.',
    variables: ['language', 'code'],
    category: 'code'
  },
  {
    id: 'research',
    name: 'Research Topic',
    icon: <BookOpen />,
    description: 'Get comprehensive information on a topic',
    prompt: 'I need detailed information about {{topic}}.\n\nPlease cover:\n- Key concepts and definitions\n- Historical context if relevant\n- Current state of knowledge\n- Major debates or open questions\n- Practical applications\n- Recent developments\n\nOrganize the information in a structured way with headings.',
    variables: ['topic'],
    category: 'research'
  },
  {
    id: 'compare',
    name: 'Compare Items',
    icon: <Scale />,
    description: 'Compare two or more items objectively',
    prompt: 'Compare {{item1}} and {{item2}} in detail.\n\nPlease include:\n- Key similarities\n- Important differences\n- Strengths and weaknesses of each\n- Use cases where one might be preferred over the other\n- A balanced conclusion\n\nPresent the comparison in a structured format.',
    variables: ['item1', 'item2'],
    category: 'research'
  },
  {
    id: 'convert-format',
    name: 'Convert Format',
    icon: <FileCode />,
    description: 'Convert content between different formats',
    prompt: 'Convert the following {{sourceFormat}} to {{targetFormat}}:\n\n{{content}}\n\nPlease ensure the conversion preserves all important information and follows best practices for the target format.',
    variables: ['sourceFormat', 'targetFormat', 'content'],
    category: 'utility'
  },
  {
    id: 'generate-tests',
    name: 'Generate Tests',
    icon: <TestTube />,
    description: 'Create test cases for code',
    prompt: 'Generate comprehensive test cases for the following code:\n\n```{{language}}\n{{code}}\n```\n\nPlease include:\n- Unit tests covering main functionality\n- Edge case tests\n- Error handling tests\n- Any necessary mocks or fixtures\n\nUse {{testFramework}} for the tests.',
    variables: ['language', 'code', 'testFramework'],
    category: 'code'
  },
  {
    id: 'brainstorm',
    name: 'Brainstorm Ideas',
    icon: <Lightbulb />,
    description: 'Generate creative ideas on a topic',
    prompt: 'Brainstorm {{number}} creative ideas about {{topic}}.\n\nFor each idea, please provide:\n- A concise title\n- A brief description\n- Potential benefits or applications\n- Any challenges to consider\n\nAim for a diverse range of approaches.',
    variables: ['number', 'topic'],
    category: 'creative'
  },
  {
    id: 'write-function',
    name: 'Write Function',
    icon: <Braces />,
    description: 'Create a specific function in code',
    prompt: 'Write a {{language}} function that {{functionality}}.\n\nRequirements:\n- Function name: {{functionName}}\n- Input parameters: {{parameters}}\n- Return value: {{returnValue}}\n- Edge cases to handle: {{edgeCases}}\n\nPlease include comments and examples of usage.',
    variables: ['language', 'functionality', 'functionName', 'parameters', 'returnValue', 'edgeCases'],
    category: 'code'
  },
  {
    id: 'refactor-code',
    name: 'Refactor Code',
    icon: <Workflow />,
    description: 'Restructure code without changing behavior',
    prompt: 'Refactor the following code while maintaining the same functionality:\n\n```{{language}}\n{{code}}\n```\n\nGoals for refactoring:\n- {{goals}}\n\nPlease explain your refactoring decisions and how they improve the code.',
    variables: ['language', 'code', 'goals'],
    category: 'code'
  },
  {
    id: 'explain-concept',
    name: 'Explain Concept',
    icon: <Zap />,
    description: 'Get a clear explanation of a complex concept',
    prompt: 'Explain {{concept}} in detail.\n\nPlease structure your explanation with:\n- A simple definition\n- Key principles or components\n- Real-world examples or analogies\n- Common misconceptions\n- Practical applications\n- Related concepts\n\nMake the explanation accessible to someone with {{knowledgeLevel}} knowledge of the subject.',
    variables: ['concept', 'knowledgeLevel'],
    category: 'research'
  },
  {
    id: 'improve-writing',
    name: 'Improve Writing',
    icon: <Pencil />,
    description: 'Enhance the quality of written content',
    prompt: 'Improve the following text while maintaining its core message:\n\n{{text}}\n\nFocus on:\n- Clarity and conciseness\n- Grammar and punctuation\n- Sentence structure and flow\n- Word choice and tone\n- Organization of ideas\n\nPlease provide the improved version followed by a brief explanation of key changes.',
    variables: ['text'],
    category: 'writing'
  },
  {
    id: 'api-request',
    name: 'Create API Request',
    icon: <Braces />,
    description: 'Generate code for an API request',
    prompt: 'Create a {{language}} code snippet for making an API request to {{endpoint}}.\n\nDetails:\n- Request type: {{method}}\n- Headers: {{headers}}\n- Body data (if applicable): {{body}}\n- Authentication: {{auth}}\n\nPlease include error handling, proper comments, and an example of how to process the response.',
    variables: ['language', 'endpoint', 'method', 'headers', 'body', 'auth'],
    category: 'code'
  },
  {
    id: 'data-analysis',
    name: 'Data Analysis Plan',
    icon: <Layers />,
    description: 'Create a plan for analyzing data',
    prompt: 'Develop a step-by-step plan for analyzing {{dataType}} data to answer the question: "{{question}}"\n\nPlease include:\n- Data preparation steps\n- Appropriate analysis methods\n- Visualization techniques\n- Potential statistical tests\n- How to interpret results\n- Potential limitations or biases to consider',
    variables: ['dataType', 'question'],
    category: 'research'
  }
];

// Local storage key for saved templates
const STORAGE_KEY = 'prompt-templates-custom';
const FAVORITES_KEY = 'prompt-templates-favorites';
const RECENT_KEY = 'prompt-templates-recent';

export default function PromptTemplates({ isOpen, onClose, onSelectTemplate }: PromptTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [filledPrompt, setFilledPrompt] = useState('');
  
  // Add state for custom templates
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyUsed, setRecentlyUsed] = useState<string[]>([]);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<PromptTemplate>>({
    name: '',
    description: '',
    prompt: '',
    variables: [],
    category: 'custom',
    isCustom: true
  });
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'recent'>('all');
  
  const { profile } = useThemeStore();
  const isSpiralStyle = profile === 'spiral';
  
  // Load templates, favorites, and recently used from localStorage on mount
  useEffect(() => {
    try {
      const savedTemplates = localStorage.getItem(STORAGE_KEY);
      const savedFavorites = localStorage.getItem(FAVORITES_KEY);
      const savedRecent = localStorage.getItem(RECENT_KEY);
      
      if (savedTemplates) {
        setTemplates([...DEFAULT_PROMPT_TEMPLATES, ...JSON.parse(savedTemplates)]);
      } else {
        setTemplates(DEFAULT_PROMPT_TEMPLATES);
      }
      
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      
      if (savedRecent) {
        setRecentlyUsed(JSON.parse(savedRecent));
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      setTemplates(DEFAULT_PROMPT_TEMPLATES);
    }
  }, []);
  
  // Save templates to localStorage when they change
  useEffect(() => {
    try {
      const customTemplates = templates.filter(t => t.isCustom);
      if (customTemplates.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customTemplates));
      }
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  }, [templates]);
  
  // Save favorites to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, [favorites]);
  
  // Save recently used to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyUsed));
    } catch (error) {
      console.error('Error saving recently used:', error);
    }
  }, [recentlyUsed]);
  
  // Filter templates based on search, category, and filter mode
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || template.category === selectedCategory;
    
    const matchesFilterMode = 
      filterMode === 'all' || 
      (filterMode === 'favorites' && favorites.includes(template.id)) ||
      (filterMode === 'recent' && recentlyUsed.includes(template.id));
    
    return matchesSearch && matchesCategory && matchesFilterMode;
  });
  
  // Get all available categories
  const categories = Array.from(new Set([
    ...DEFAULT_PROMPT_TEMPLATES.map(t => t.category),
    ...templates.filter(t => t.isCustom).map(t => t.category)
  ]));
  
  // Update filled prompt when template or values change
  useEffect(() => {
    if (selectedTemplate) {
      let prompt = selectedTemplate.prompt;
      
      // Replace variables with values
      selectedTemplate.variables.forEach(variable => {
        const value = templateValues[variable] || `{{${variable}}}`;
        prompt = prompt.replace(new RegExp(`{{${variable}}}`, 'g'), value);
      });
      
      setFilledPrompt(prompt);
    }
  }, [selectedTemplate, templateValues]);
  
  // Reset values when template changes
  useEffect(() => {
    setTemplateValues({});
  }, [selectedTemplate]);

  // Handle choosing a template
  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    
    // Add to recently used
    if (!recentlyUsed.includes(template.id)) {
      const updatedRecent = [template.id, ...recentlyUsed.slice(0, 9)]; // Keep only 10 most recent
      setRecentlyUsed(updatedRecent);
    } else {
      // Move to top if already exists
      const updatedRecent = [
        template.id,
        ...recentlyUsed.filter(id => id !== template.id).slice(0, 9)
      ];
      setRecentlyUsed(updatedRecent);
    }
  };

  // Handle applying the template
  const handleApplyTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(filledPrompt);
      onClose();
    }
  };

  // Handle variable input change
  const handleVariableChange = (variable: string, value: string) => {
    setTemplateValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };
  
  // Handle toggling favorite status
  const handleToggleFavorite = (templateId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (favorites.includes(templateId)) {
      setFavorites(favorites.filter(id => id !== templateId));
    } else {
      setFavorites([...favorites, templateId]);
    }
  };
  
  // Handle deleting a custom template
  const handleDeleteTemplate = (templateId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTemplates(templates.filter(t => t.id !== templateId));
    
    // If the deleted template was selected, clear selection
    if (selectedTemplate?.id === templateId) {
      setSelectedTemplate(null);
    }
    
    // Remove from favorites and recently used if present
    if (favorites.includes(templateId)) {
      setFavorites(favorites.filter(id => id !== templateId));
    }
    if (recentlyUsed.includes(templateId)) {
      setRecentlyUsed(recentlyUsed.filter(id => id !== templateId));
    }
  };
  
  // Handle creating a new template
  const handleCreateTemplate = () => {
    setIsCreatingTemplate(true);
    setIsEditingTemplate(false);
    setNewTemplate({
      name: '',
      description: '',
      prompt: '',
      variables: [],
      category: 'custom',
      isCustom: true
    });
  };
  
  // Handle editing a template
  const handleEditTemplate = (template: PromptTemplate, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsCreatingTemplate(false);
    setIsEditingTemplate(true);
    setNewTemplate({
      ...template
    });
  };
  
  // Handle duplicating a template
  const handleDuplicateTemplate = (template: PromptTemplate, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const duplicatedTemplate: PromptTemplate = {
      ...template,
      id: generateUUID(),
      name: `${template.name} (Copy)`,
      isCustom: true
    };
    
    setTemplates([...templates, duplicatedTemplate]);
  };
  
  // Handle saving a new or edited template
  const handleSaveTemplate = () => {
    if (!newTemplate.name || !newTemplate.prompt) return;
    
    // Extract variables from prompt
    const variableRegex = /{{(.*?)}}/g;
    const variables = new Set<string>();
    let match;
    
    while ((match = variableRegex.exec(newTemplate.prompt || '')) !== null) {
      variables.add(match[1]);
    }
    
    const updatedTemplate: PromptTemplate = {
      id: isEditingTemplate ? (newTemplate.id || generateUUID()) : generateUUID(),
      name: newTemplate.name || 'Untitled Template',
      icon: newTemplate.icon || <Pencil />,
      description: newTemplate.description || 'Custom template',
      prompt: newTemplate.prompt || '',
      variables: Array.from(variables),
      category: newTemplate.category || 'custom',
      isCustom: true
    };
    
    if (isEditingTemplate) {
      setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    } else {
      setTemplates([...templates, updatedTemplate]);
    }
    
    setIsCreatingTemplate(false);
    setIsEditingTemplate(false);
  };
  
  // Render the form for creating/editing templates
  const renderTemplateForm = () => {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">
          {isEditingTemplate ? 'Edit Template' : 'Create New Template'}
        </h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={newTemplate.name || ''}
              onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
              placeholder="Template name"
              className="w-full px-3 py-2 rounded-md border border-border bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={newTemplate.category}
              onChange={e => setNewTemplate({...newTemplate, category: e.target.value as any})}
              className="w-full px-3 py-2 rounded-md border border-border bg-background"
            >
              <option value="code">Code</option>
              <option value="writing">Writing</option>
              <option value="research">Research</option>
              <option value="creative">Creative</option>
              <option value="utility">Utility</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              value={newTemplate.description || ''}
              onChange={e => setNewTemplate({...newTemplate, description: e.target.value})}
              placeholder="Brief description of what this template does"
              className="w-full px-3 py-2 rounded-md border border-border bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Prompt Template
              <span className="text-xs text-muted-foreground ml-2">
                (Use {'{'}{'{'} variableName {'}'}{'}'} for variables)
              </span>
            </label>
            <textarea
              value={newTemplate.prompt || ''}
              onChange={e => setNewTemplate({...newTemplate, prompt: e.target.value})}
              placeholder="Enter your prompt template with {{variables}}"
              className="w-full px-3 py-2 rounded-md border border-border bg-background min-h-[150px]"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              setIsCreatingTemplate(false);
              setIsEditingTemplate(false);
            }}
            className="px-4 py-2 rounded-md border border-border hover:bg-muted/80"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveTemplate}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Save Template
          </button>
        </div>
      </div>
    );
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className={cn(
        "bg-background rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-hidden",
        "border border-border",
        "shadow-xl shadow-primary/10",
        isSpiralStyle ? "p-6" : "p-4"
      )}>
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className={cn(
            "font-semibold",
            isSpiralStyle ? "text-2xl" : "text-xl"
          )}>
            Prompt Templates
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setFilterMode('all')}
                className={cn(
                  "px-3 py-1.5 text-sm",
                  filterMode === 'all' ? "bg-primary text-primary-foreground" : "hover:bg-muted/80"
                )}
              >
                All
              </button>
              <button
                onClick={() => setFilterMode('favorites')}
                className={cn(
                  "px-3 py-1.5 text-sm flex items-center gap-1",
                  filterMode === 'favorites' ? "bg-primary text-primary-foreground" : "hover:bg-muted/80"
                )}
              >
                <Star className="h-3 w-3" /> Favorites
              </button>
              <button
                onClick={() => setFilterMode('recent')}
                className={cn(
                  "px-3 py-1.5 text-sm flex items-center gap-1",
                  filterMode === 'recent' ? "bg-primary text-primary-foreground" : "hover:bg-muted/80"
                )}
              >
                <Clock className="h-3 w-3" /> Recent
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted/80 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex h-[70vh]">
          {/* Left sidebar - Template list */}
          <div className="w-1/3 border-r border-border p-4 overflow-y-auto">
            {/* Search and create */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                onClick={handleCreateTemplate}
                className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New</span>
              </button>
            </div>
            
            {/* Categories */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-medium",
                  selectedCategory === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-medium capitalize",
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
            
            {/* Template list */}
            <div className="space-y-2">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors relative group",
                    selectedTemplate?.id === template.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-muted/80 hover:shadow-sm"
                  )}
                >
                  <div className={cn(
                    "flex-shrink-0 rounded-full p-2",
                    selectedTemplate?.id === template.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {template.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{template.name}</h3>
                      {template.isCustom && (
                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-1.5 py-0.5 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-sm line-clamp-2",
                      selectedTemplate?.id === template.id
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}>
                      {template.description}
                    </p>
                  </div>
                  
                  {/* Action buttons - star, edit, delete */}
                  <div className={cn(
                    "absolute right-3 top-3 flex items-center gap-1",
                    (selectedTemplate?.id === template.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  )}>
                    <button
                      onClick={(e) => handleToggleFavorite(template.id, e)}
                      className={cn(
                        "p-1 rounded-full hover:bg-muted/80",
                        favorites.includes(template.id) ? "text-yellow-500" : "text-muted-foreground"
                      )}
                      title={favorites.includes(template.id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star className="h-4 w-4" fill={favorites.includes(template.id) ? "currentColor" : "none"} />
                    </button>
                    
                    {template.isCustom && (
                      <>
                        <button
                          onClick={(e) => handleEditTemplate(template, e)}
                          className="p-1 rounded-full hover:bg-muted/80 text-muted-foreground"
                          title="Edit template"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteTemplate(template.id, e)}
                          className="p-1 rounded-full hover:bg-muted/80 text-muted-foreground"
                          title="Delete template"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={(e) => handleDuplicateTemplate(template, e)}
                      className="p-1 rounded-full hover:bg-muted/80 text-muted-foreground"
                      title="Duplicate template"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No templates found
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Template details or create/edit form */}
          <div className="w-2/3 p-4 overflow-y-auto">
            {isCreatingTemplate || isEditingTemplate ? (
              renderTemplateForm()
            ) : selectedTemplate ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-semibold">{selectedTemplate.name}</h3>
                      <button
                        onClick={() => handleToggleFavorite(selectedTemplate.id)}
                        className={cn(
                          "p-1 rounded-full",
                          favorites.includes(selectedTemplate.id) ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500"
                        )}
                      >
                        <Star className="h-4 w-4" fill={favorites.includes(selectedTemplate.id) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <p className="text-muted-foreground">{selectedTemplate.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {selectedTemplate.isCustom && (
                      <button
                        onClick={() => handleEditTemplate(selectedTemplate)}
                        className="p-1.5 rounded-lg border border-border hover:bg-muted/80 text-muted-foreground"
                        title="Edit template"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDuplicateTemplate(selectedTemplate)}
                      className="p-1.5 rounded-lg border border-border hover:bg-muted/80 text-muted-foreground"
                      title="Duplicate template"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {/* Variables */}
                {selectedTemplate.variables.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Template Variables</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedTemplate.variables.map(variable => (
                        <div key={variable} className="space-y-1">
                          <label className="text-sm font-medium capitalize">
                            {variable.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </label>
                          <input
                            type="text"
                            value={templateValues[variable] || ''}
                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                            placeholder={`Enter ${variable.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                            className="w-full px-3 py-2 rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium">Preview</h4>
                  <div className="p-3 rounded-md border border-border bg-muted/30 whitespace-pre-wrap">
                    {filledPrompt}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-md border border-border hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyTemplate}
                    className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                <Sparkles className="h-12 w-12 mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Select a template</h3>
                <p className="max-w-sm text-sm">
                  Choose a template from the list to get started or create your own custom template
                </p>
                <button
                  onClick={handleCreateTemplate}
                  className="mt-6 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New Template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 