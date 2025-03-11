import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Book, 
  GraduationCap, 
  Target, 
  Briefcase, 
  Pen, 
  Code, 
  BarChart2, 
  Heart, 
  MessageSquare, 
  FileText, 
  Layout, 
  TrendingUp, 
  Globe,
  Beaker,
  Database,
  BookOpen,
  Brain,
  Microscope,
  Bot,
  Sparkles,
  ChevronDown,
  Check
} from 'lucide-react';
import { useModeStore } from '../stores/modeStore';
import type { AssistantMode } from '../stores/modeStore';
import { useKnowledgeBaseStore } from '../store/knowledgeBaseStore';
import { cn } from '../lib/utils';

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'chat': <MessageSquare className="h-5 w-5" />,
    'assistant': <Bot className="h-5 w-5" />,
    'research': <Search className="h-5 w-5" />,
    'code': <Code className="h-5 w-5" />,
    'data': <Database className="h-5 w-5" />,
    'document': <FileText className="h-5 w-5" />,
    'ai': <Brain className="h-5 w-5" />,
    'custom': <Sparkles className="h-5 w-5" />
  };

  return iconMap[iconName] || <Bot className="h-5 w-5" />;
};

export default function ModeSelector() {
  const { 
    modes, 
    customModes, 
    activeMode, 
    setActiveMode, 
    addCustomMode, 
    updateMode,
    updatePresetMode,
    resetPresetMode,
    deleteCustomMode 
  } = useModeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMode, setEditingMode] = useState<AssistantMode | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState('modes');
  const [isOpen, setIsOpen] = useState(false);

  const allModes = [...modes, ...customModes];
  const currentMode = allModes.find(m => m.id === activeMode);

  const handleModeChange = (modeId: string) => {
    setActiveMode(modeId);
    setIsModalOpen(false);
  };

  const handleEditMode = (mode: AssistantMode) => {
    setEditingMode(mode);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const handleDeleteMode = (modeId: string) => {
    if (window.confirm('Are you sure you want to delete this mode?')) {
      deleteCustomMode(modeId);
    }
  };

  const handleResetMode = (modeId: string) => {
    setShowResetConfirm(false);
    resetPresetMode(modeId);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
          "bg-[var(--muted)] hover:bg-[var(--muted)]/80",
          "text-[var(--foreground)]"
        )}
      >
        <div className="flex items-center gap-2">
          {getIconComponent(currentMode?.id || 'chat')}
          <span>{currentMode?.name || 'Standard Chat'}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-[var(--muted-foreground)]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-lg z-50">
          <div className="p-2">
            <div className="mb-2 px-2 py-1.5 text-sm font-medium text-[var(--muted-foreground)]">
              Select Mode
            </div>
            <div className="space-y-1">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setActiveMode(mode.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-2 py-2 rounded-md transition-colors text-left",
                    activeMode === mode.id
                      ? "bg-[var(--primary)] text-white"
                      : "hover:bg-[var(--muted)] text-[var(--foreground)]"
                  )}
                >
                  <div className="flex-shrink-0">
                    {getIconComponent(mode.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{mode.name}</div>
                    <div className="text-sm truncate text-[var(--muted-foreground)]">
                      {mode.description}
                    </div>
                  </div>
                  {activeMode === mode.id && (
                    <Check className="h-4 w-4 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="mt-2 pt-2 border-t border-[var(--border)]">
              <button
                onClick={() => {
                  // Handle custom mode creation
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors",
                  "hover:bg-[var(--muted)] text-[var(--foreground)]"
                )}
              >
                <Plus className="h-4 w-4" />
                <span>Create Custom Mode</span>
              </button>
              <button
                onClick={() => {
                  // Handle mode settings
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors",
                  "hover:bg-[var(--muted)] text-[var(--foreground)]"
                )}
              >
                <Settings className="h-4 w-4" />
                <span>Mode Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-out Mode Selection Screen */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
              setIsEditing(false);
              setEditingMode(null);
            }
          }}
        >
          <div className="w-[480px] max-h-[85vh] bg-card text-card-foreground shadow-lg rounded-lg overflow-hidden border border-border">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-medium text-foreground">
                  {isEditing ? 'Edit Mode' : 'Select Assistant Mode'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditing(false);
                    setEditingMode(null);
                  }}
                  className="p-1 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {!isEditing ? (
                  <div className="p-4 space-y-4">
                    {/* Standard Chat Mode */}
                    <div>
                      <div
                        className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors ${
                          activeMode === 'chat' ? 'bg-accent' : ''
                        }`}
                        onClick={() => handleModeChange('chat')}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${
                            activeMode === 'chat' ? 'text-primary' : 'text-muted-foreground'
                          }`}>
                            {getIconComponent('chat')}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">Standard Chat</div>
                            <div className="text-sm text-muted-foreground">General-purpose chat assistant for everyday conversations</div>
                          </div>
                        </div>
                        {activeMode === 'chat' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1"></div>
                        )}
                      </div>
                    </div>

                    {/* Create New Mode Button */}
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setEditingMode({
                          id: `custom_${Date.now()}`,
                          name: '',
                          description: '',
                          systemPrompt: '',
                          temperature: 0.7,
                          icon: '🔬',
                          category: 'Research',
                          tags: [],
                          maxTokens: 2048,
                          topP: 0.9,
                          frequencyPenalty: 0,
                          presencePenalty: 0,
                          stopSequences: [],
                          customInstructions: [],
                          knowledgeBaseIds: []
                        });
                      }}
                      className="flex items-center gap-3 w-full p-3 rounded-lg border border-dashed border-border hover:border-primary hover:bg-accent/50 transition-all group"
                    >
                      <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                        <Plus className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-foreground">Create Custom Mode</div>
                        <div className="text-sm text-muted-foreground">Build a new assistant mode from scratch</div>
                      </div>
                    </button>

                    {/* Mode Categories */}
                    <div className="space-y-4">
                      {/* Preset Modes */}
                      <div>
                        <h3 className="px-1 text-xs font-medium text-muted-foreground mb-2">SPECIALIZED MODES</h3>
                        <div className="space-y-1">
                          {modes.filter(mode => mode.id !== 'chat').map((mode) => (
                            <div
                              key={mode.id}
                              className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors ${
                                activeMode === mode.id ? 'bg-accent' : ''
                              }`}
                              onClick={() => handleModeChange(mode.id)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-lg ${
                                  activeMode === mode.id ? 'text-primary' : 'text-muted-foreground'
                                }`}>
                                  {getIconComponent(mode.id)}
                                </div>
                                <div>
                                  <div className="font-medium text-foreground">{mode.name}</div>
                                  <div className="text-sm text-muted-foreground">{mode.description}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditMode(mode);
                                  }}
                                  className="p-1.5 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowResetConfirm(true);
                                    setEditingMode(mode);
                                  }}
                                  className="p-1.5 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                  title="Reset to default settings"
                                >
                                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                                {activeMode === mode.id && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Custom Modes */}
                      {customModes.length > 0 && (
                        <div>
                          <h3 className="px-1 text-xs font-medium text-muted-foreground mb-2">CUSTOM MODES</h3>
                          <div className="space-y-1">
                            {customModes.map((mode) => (
                              <div
                                key={mode.id}
                                className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors ${
                                  activeMode === mode.id ? 'bg-accent' : ''
                                }`}
                                onClick={() => handleModeChange(mode.id)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded-lg ${
                                    activeMode === mode.id ? 'text-primary' : 'text-muted-foreground'
                                  }`}>
                                    {getIconComponent(mode.id)}
                                  </div>
                                  <div>
                                    <div className="font-medium text-foreground">{mode.name}</div>
                                    <div className="text-sm text-muted-foreground">{mode.description}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditMode(mode);
                                    }}
                                    className="p-1.5 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteMode(mode.id);
                                    }}
                                    className="p-1.5 hover:bg-destructive/10 rounded-full transition-colors text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                  {activeMode === mode.id && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary ml-1"></div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <ModeEditor
                    mode={editingMode}
                    onSave={(mode) => {
                      if (editingMode) {
                        if (editingMode.id.startsWith('custom_')) {
                          updateMode(editingMode.id, mode);
                        } else {
                          updatePresetMode(editingMode.id, mode);
                        }
                      } else {
                        addCustomMode(mode);
                      }
                      setIsEditing(false);
                      setEditingMode(null);
                      setIsModalOpen(false);
                    }}
                    onCancel={() => {
                      setIsEditing(false);
                      setEditingMode(null);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && editingMode && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-card text-card-foreground rounded-lg p-6 w-full max-w-sm shadow-lg border border-border">
            <h2 className="text-lg font-medium text-foreground mb-3">Reset Mode</h2>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to reset "{editingMode.name}" to its default settings? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg hover:bg-accent text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResetMode(editingMode.id)}
                className="px-4 py-2 rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ModeEditorProps {
  mode: AssistantMode | null;
  onSave: (mode: Omit<AssistantMode, 'id'>) => void;
  onCancel: () => void;
}

const ModeEditor = ({ mode, onSave, onCancel }: ModeEditorProps) => {
  const [name, setName] = useState(mode?.name || '');
  const [description, setDescription] = useState(mode?.description || '');
  const [systemPrompt, setSystemPrompt] = useState(mode?.systemPrompt || '');
  const [temperature, setTemperature] = useState(mode?.temperature || 0.7);
  const [icon, setIcon] = useState(mode?.icon || '🤖');
  const [category, setCategory] = useState(mode?.category || '');
  const [tags, setTags] = useState(mode?.tags?.join(', ') || '');
  const [maxTokens, setMaxTokens] = useState(mode?.maxTokens || 2048);
  const [topP, setTopP] = useState(mode?.topP || 0.9);
  const [frequencyPenalty, setFrequencyPenalty] = useState(mode?.frequencyPenalty || 0);
  const [presencePenalty, setPresencePenalty] = useState(mode?.presencePenalty || 0);
  const [stopSequences, setStopSequences] = useState(mode?.stopSequences?.join('\n') || '');
  const [customInstructions, setCustomInstructions] = useState(mode?.customInstructions?.join('\n') || '');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showNewKbModal, setShowNewKbModal] = useState(false);
  
  const { knowledgeBases, createKnowledgeBase } = useKnowledgeBaseStore();
  const [selectedKnowledgeBases, setSelectedKnowledgeBases] = useState<string[]>(mode?.knowledgeBaseIds || []);
  const [researchFields, setResearchFields] = useState<string[]>(mode?.researchFields || []);
  const [methodology, setMethodology] = useState<string>(mode?.methodology || '');
  const [citationStyle, setCitationStyle] = useState<string>(mode?.citationStyle || 'APA');
  const [dataAnalysisTools, setDataAnalysisTools] = useState<string[]>(mode?.dataAnalysisTools || []);
  const [newKbName, setNewKbName] = useState('');
  const [newKbDescription, setNewKbDescription] = useState('');
  const [newKbCategory, setNewKbCategory] = useState('');

  const handleCreateKnowledgeBase = () => {
    if (newKbName.trim()) {
      const newKb = createKnowledgeBase(newKbName, newKbDescription, newKbCategory);
      setShowNewKbModal(false);
      setNewKbName('');
      setNewKbDescription('');
      setNewKbCategory('');
      // Automatically select the newly created knowledge base
      setSelectedKnowledgeBases([...selectedKnowledgeBases, newKb.id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...mode,
      name,
      description,
      systemPrompt,
      temperature,
      icon,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      maxTokens,
      topP,
      frequencyPenalty,
      presencePenalty,
      stopSequences: stopSequences.split('\n').map(s => s.trim()).filter(Boolean),
      customInstructions: customInstructions.split('\n').map(s => s.trim()).filter(Boolean),
      knowledgeBaseIds: selectedKnowledgeBases,
      researchFields,
      methodology,
      citationStyle,
      dataAnalysisTools
    });
  };

  const citationStyles = ['APA', 'MLA', 'Chicago', 'Harvard', 'IEEE', 'Vancouver'];
  const commonResearchFields = [
    'Computer Science',
    'Data Science',
    'Artificial Intelligence',
    'Machine Learning',
    'Natural Language Processing',
    'Cognitive Science',
    'Psychology',
    'Neuroscience',
    'Biology',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Social Sciences',
    'Economics',
    'Business',
    'Medicine'
  ];

  const commonDataAnalysisTools = [
    'Python',
    'R',
    'SPSS',
    'MATLAB',
    'Julia',
    'Stata',
    'SAS',
    'Excel',
    'Tableau',
    'Power BI'
  ];

  const tooltips = {
    temperature: 'Controls randomness in responses. Higher values (e.g., 0.8) make the output more creative and varied, while lower values (e.g., 0.2) make it more focused and deterministic.',
    maxTokens: 'The maximum length of the generated response. One token is roughly 4 characters or 0.75 words.',
    topP: 'An alternative to temperature, using nucleus sampling. Lower values (e.g., 0.1) make the output more focused.',
    frequencyPenalty: 'Reduces repetition by lowering the likelihood of using tokens that have already appeared. Higher values (e.g., 1.0) make the output more diverse.',
    presencePenalty: 'Encourages the model to talk about new topics by penalizing tokens that have appeared in the context.',
    stopSequences: 'Sequences that will cause the model to stop generating further text. Useful for controlling output format.',
    customInstructions: 'Additional instructions that guide the AI\'s behavior. Each line is treated as a separate instruction.',
  };

  const renderTooltip = (text: string) => (
    <div className="group relative inline-block">
      <span className="cursor-help text-gray-400 hover:text-gray-300">ⓘ</span>
      <div className="hidden group-hover:block absolute left-full ml-2 top-1/2 -translate-y-1/2 w-64 p-2 bg-gray-700 rounded-lg text-xs text-white z-10">
        {text}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Icon</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
          >
            <option value="">Select Category</option>
            {['Research', 'Academic', 'Professional', 'Technical', 'Creative'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
          required
        />
      </div>

      {category === 'Research' && (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Research Fields</label>
            <div className="grid grid-cols-2 gap-2 p-2 border border-input rounded-lg bg-background">
              {commonResearchFields.map(field => (
                <label key={field} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                  <input
                    type="checkbox"
                    checked={researchFields.includes(field)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setResearchFields([...researchFields, field]);
                      } else {
                        setResearchFields(researchFields.filter(f => f !== field));
                      }
                    }}
                    className="rounded border-input bg-background"
                  />
                  <span className="text-sm text-foreground">{field}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Research Methodology</label>
            <select
              value={methodology}
              onChange={(e) => setMethodology(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
            >
              <option value="">Select Methodology</option>
              <option value="Quantitative">Quantitative</option>
              <option value="Qualitative">Qualitative</option>
              <option value="Mixed Methods">Mixed Methods</option>
              <option value="Literature Review">Literature Review</option>
              <option value="Meta-Analysis">Meta-Analysis</option>
              <option value="Case Study">Case Study</option>
              <option value="Experimental">Experimental</option>
              <option value="Observational">Observational</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Citation Style</label>
            <select
              value={citationStyle}
              onChange={(e) => setCitationStyle(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring"
            >
              {citationStyles.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Data Analysis Tools</label>
            <div className="grid grid-cols-2 gap-2 p-2 border border-input rounded-lg bg-background">
              {commonDataAnalysisTools.map(tool => (
                <label key={tool} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                  <input
                    type="checkbox"
                    checked={dataAnalysisTools.includes(tool)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDataAnalysisTools([...dataAnalysisTools, tool]);
                      } else {
                        setDataAnalysisTools(dataAnalysisTools.filter(t => t !== tool));
                      }
                    }}
                    className="rounded border-input bg-background"
                  />
                  <span className="text-sm text-foreground">{tool}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">System Prompt</label>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring h-32"
          required
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-sm font-medium text-foreground">
            Temperature ({temperature})
          </label>
          {renderTooltip(tooltips.temperature)}
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="flex-1"
          />
          <span className="text-sm text-gray-500 w-12">{temperature}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Focused</span>
          <span>Balanced</span>
          <span>Creative</span>
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
        >
          {showAdvanced ? '- Hide' : '+ Show'} Advanced Settings
        </button>
      </div>

      {showAdvanced && (
        <div className="space-y-4 border border-gray-200 rounded-lg p-4 mt-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-foreground">
                Max Tokens ({maxTokens})
              </label>
              {renderTooltip(tooltips.maxTokens)}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="256"
                max="4096"
                step="256"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-16">{maxTokens}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-foreground">
                Top P ({topP})
              </label>
              {renderTooltip(tooltips.topP)}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={topP}
                onChange={(e) => setTopP(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-12">{topP}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-foreground">
                Frequency Penalty ({frequencyPenalty})
              </label>
              {renderTooltip(tooltips.frequencyPenalty)}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={frequencyPenalty}
                onChange={(e) => setFrequencyPenalty(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-12">{frequencyPenalty}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-foreground">
                Presence Penalty ({presencePenalty})
              </label>
              {renderTooltip(tooltips.presencePenalty)}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={presencePenalty}
                onChange={(e) => setPresencePenalty(parseFloat(e.target.value))}
                className="flex-1"
              />
              <span className="text-sm text-gray-500 w-12">{presencePenalty}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium text-foreground">Stop Sequences (one per line)</label>
              {renderTooltip(tooltips.stopSequences)}
            </div>
            <textarea
              value={stopSequences}
              onChange={(e) => setStopSequences(e.target.value)}
              className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring h-24"
              placeholder="Enter sequences that will stop generation..."
            />
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-1">
          <label className="block text-sm font-medium text-foreground">Custom Instructions (one per line)</label>
          {renderTooltip(tooltips.customInstructions)}
        </div>
        <textarea
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.target.value)}
          className="w-full bg-background border border-input rounded-lg px-3 py-2 text-foreground focus:ring-2 focus:ring-ring focus:border-ring h-24"
          placeholder="Additional instructions to guide the AI's behavior..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Knowledge Bases</label>
        <div className="space-y-2 max-h-40 overflow-y-auto border border-input rounded-lg p-2 bg-background">
          {knowledgeBases.length > 0 ? (
            knowledgeBases.map((kb) => (
              <label key={kb.id} className="flex items-center gap-2 p-2 hover:bg-accent rounded">
                <input
                  type="checkbox"
                  checked={selectedKnowledgeBases.includes(kb.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedKnowledgeBases([...selectedKnowledgeBases, kb.id]);
                    } else {
                      setSelectedKnowledgeBases(selectedKnowledgeBases.filter(id => id !== kb.id));
                    }
                  }}
                  className="rounded border-input bg-background"
                />
                <div>
                  <div className="font-medium text-foreground">{kb.name}</div>
                  {kb.description && (
                    <div className="text-sm text-muted-foreground">{kb.description}</div>
                  )}
                </div>
              </label>
            ))
          ) : (
            <div className="text-center p-4">
              <p className="text-sm text-muted-foreground mb-2">No knowledge bases available</p>
              <button
                type="button"
                onClick={() => setShowNewKbModal(true)}
                className="text-primary hover:text-primary/90 text-sm"
              >
                + Create Knowledge Base
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-foreground hover:bg-accent transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
        >
          Save
        </button>
      </div>
    </form>
  );
} 