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
  Workflow
} from 'lucide-react';

interface PromptTemplate {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  prompt: string;
  variables: string[];
  category: 'code' | 'writing' | 'research' | 'creative' | 'utility';
}

interface PromptTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (prompt: string) => void;
}

// Pre-defined templates
const PROMPT_TEMPLATES: PromptTemplate[] = [
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
  }
];

export default function PromptTemplates({ isOpen, onClose, onSelectTemplate }: PromptTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [templateValues, setTemplateValues] = useState<Record<string, string>>({});
  const [filledPrompt, setFilledPrompt] = useState('');
  
  const { profile } = useThemeStore();
  const isSpiralStyle = profile === 'spiral';
  
  // Filter templates based on search and category
  const filteredTemplates = PROMPT_TEMPLATES.filter(template => {
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === null || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
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
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className={cn(
        "bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden",
        "border border-border",
        isSpiralStyle ? "p-6" : "p-4"
      )}>
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <h2 className={cn(
            "font-semibold",
            isSpiralStyle ? "text-2xl" : "text-xl"
          )}>
            Prompt Templates
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-muted/80 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex h-[70vh]">
          {/* Left sidebar - Template list */}
          <div className="w-1/3 border-r border-border p-4 overflow-y-auto">
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              />
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
              {Array.from(new Set(PROMPT_TEMPLATES.map(t => t.category))).map(category => (
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
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    selectedTemplate?.id === template.id
                      ? isSpiralStyle
                        ? "bg-blue-50 border-amber-400 dark:bg-blue-900/30 dark:border-amber-400/50"
                        : "bg-primary/10 border-primary/50"
                      : "border-border hover:border-primary/30 hover:bg-primary/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSpiralStyle
                        ? "text-amber-500 bg-amber-50 dark:bg-amber-900/30"
                        : "text-primary bg-primary/10"
                    )}>
                      {React.cloneElement(template.icon as React.ReactElement, { className: "h-4 w-4" })}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                </button>
              ))}
              
              {filteredTemplates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No templates found</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Template configuration */}
          <div className="w-2/3 p-4 overflow-y-auto">
            {selectedTemplate ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">{selectedTemplate.name}</h3>
                  <p className="text-muted-foreground">{selectedTemplate.description}</p>
                </div>
                
                {/* Variables */}
                <div className="space-y-3">
                  <h4 className="font-medium">Fill in the details:</h4>
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable} className="space-y-1">
                      <label className="text-sm font-medium capitalize">
                        {variable.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <input
                        type="text"
                        value={templateValues[variable] || ''}
                        onChange={(e) => setTemplateValues({
                          ...templateValues,
                          [variable]: e.target.value
                        })}
                        placeholder={`Enter ${variable.replace(/([A-Z])/g, ' $1').trim().toLowerCase()}`}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Preview */}
                <div className="space-y-2">
                  <h4 className="font-medium">Preview:</h4>
                  <div className="p-4 rounded-lg border border-border bg-muted/30 whitespace-pre-wrap">
                    {filledPrompt}
                  </div>
                </div>
                
                {/* Use template button */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      onSelectTemplate(filledPrompt);
                      onClose();
                    }}
                    className={cn(
                      "px-4 py-2 rounded-lg",
                      isSpiralStyle
                        ? "bg-primary text-white"
                        : "bg-primary text-primary-foreground"
                    )}
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">Select a template</h3>
                  <p className="mt-1">Choose a template from the list to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 