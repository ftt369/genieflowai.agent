import React, { useState, useEffect } from 'react';
import { useModeStore, type AssistantMode } from '@/stores/model/modeStore';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import { cn } from '@/utils/cn';
import { 
  Save,
  Trash2,
  Plus,
  MessageSquare,
  Settings2,
  Database,
  Sliders,
  Tags,
  X,
  Search,
  Book,
  Globe,
  FileText
} from 'lucide-react';

interface ModeCustomizerProps {
  mode: AssistantMode;
  onClose: () => void;
}

interface KnowledgeBaseItem {
  id: string;
  name: string;
  description: string;
  category?: string;
  sourceType?: 'web' | 'document' | 'knowledgeBase';
}

const ModeCustomizer: React.FC<ModeCustomizerProps> = ({ mode, onClose }) => {
  const { updateMode, deleteCustomMode } = useModeStore();
  const { knowledgeBases, getActiveKnowledgeBase } = useKnowledgeBaseStore();
  const [activeTab, setActiveTab] = useState<'prompts' | 'settings' | 'knowledge' | 'advanced'>('prompts');
  const [editedMode, setEditedMode] = useState<AssistantMode>({ ...mode });
  const [kbSearchTerm, setKbSearchTerm] = useState('');
  const [showKbDropdown, setShowKbDropdown] = useState(false);

  const handleSave = () => {
    updateMode(mode.id, editedMode);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this mode?')) {
      deleteCustomMode(mode.id);
      onClose();
    }
  };

  const tabs = [
    { id: 'prompts', label: 'Prompts', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings2 },
    { id: 'knowledge', label: 'Knowledge', icon: Database },
    { id: 'advanced', label: 'Advanced', icon: Sliders }
  ];

  // Filter knowledge bases based on search term
  const filteredKnowledgeBases = knowledgeBases.filter((kb: KnowledgeBaseItem) => 
    kb.name.toLowerCase().includes(kbSearchTerm.toLowerCase()) ||
    kb.description.toLowerCase().includes(kbSearchTerm.toLowerCase())
  );

  // Check if a knowledge base is already attached
  const isKnowledgeBaseAttached = (kbId: string) => {
    return editedMode.knowledgeBaseIds?.includes(kbId) || false;
  };

  // Get KB display name by ID
  const getKnowledgeBaseName = (kbId: string) => {
    const kb = knowledgeBases.find((kb: KnowledgeBaseItem) => kb.id === kbId);
    return kb ? kb.name : kbId;
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="w-[95%] max-w-4xl h-[85vh] bg-background border rounded-lg shadow-lg overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Customize Mode: {editedMode.name}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                title="Delete mode"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent/80 transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 p-4 border-b">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  activeTab === id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'prompts' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">System Prompt</label>
                  <textarea
                    value={editedMode.systemPrompt}
                    onChange={(e) => setEditedMode({ ...editedMode, systemPrompt: e.target.value })}
                    className="w-full h-32 px-3 py-2 rounded-lg border bg-background resize-none"
                    placeholder="Enter system instructions..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Custom Instructions</label>
                    <button
                      onClick={() => setEditedMode({
                        ...editedMode,
                        customInstructions: [...(editedMode.customInstructions || []), '']
                      })}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/90"
                    >
                      <Plus className="h-3 w-3" />
                      Add Instruction
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editedMode.customInstructions?.map((instruction, index) => (
                      <div key={index} className="flex gap-2">
                        <textarea
                          value={instruction}
                          onChange={(e) => {
                            const newInstructions = [...(editedMode.customInstructions || [])];
                            newInstructions[index] = e.target.value;
                            setEditedMode({ ...editedMode, customInstructions: newInstructions });
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border bg-background resize-none"
                          placeholder="Enter custom instruction..."
                        />
                        <button
                          onClick={() => {
                            const newInstructions = [...(editedMode.customInstructions || [])];
                            newInstructions.splice(index, 1);
                            setEditedMode({ ...editedMode, customInstructions: newInstructions });
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={editedMode.name}
                    onChange={(e) => setEditedMode({ ...editedMode, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={editedMode.description}
                    onChange={(e) => setEditedMode({ ...editedMode, description: e.target.value })}
                    className="w-full h-20 px-3 py-2 rounded-lg border bg-background resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <input
                    type="text"
                    value={editedMode.category}
                    onChange={(e) => setEditedMode({ ...editedMode, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Tags</label>
                    <button
                      onClick={() => setEditedMode({
                        ...editedMode,
                        tags: [...(editedMode.tags || []), '']
                      })}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/90"
                    >
                      <Plus className="h-3 w-3" />
                      Add Tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editedMode.tags?.map((tag, index) => (
                      <div key={index} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-lg">
                        <input
                          type="text"
                          value={tag}
                          onChange={(e) => {
                            const newTags = [...(editedMode.tags || [])];
                            newTags[index] = e.target.value;
                            setEditedMode({ ...editedMode, tags: newTags });
                          }}
                          className="w-20 bg-transparent border-none focus:outline-none text-sm"
                        />
                        <button
                          onClick={() => {
                            const newTags = [...(editedMode.tags || [])];
                            newTags.splice(index, 1);
                            setEditedMode({ ...editedMode, tags: newTags });
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Knowledge Bases</h3>
                    <div className="text-sm text-muted-foreground">
                      {editedMode.knowledgeBaseIds?.length || 0} attached
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Attach knowledge bases to this mode to allow the AI to access their information during conversations.
                  </p>

                  {/* Attached Knowledge Bases */}
                  <div className="space-y-3 my-4">
                    <h4 className="text-sm font-medium">Attached Knowledge Bases</h4>
                    {editedMode.knowledgeBaseIds && editedMode.knowledgeBaseIds.length > 0 ? (
                      <div className="space-y-2">
                        {editedMode.knowledgeBaseIds.map((kbId, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-muted/40">
                            <div className="flex items-start gap-3">
                              <Database className="h-5 w-5 mt-0.5 text-primary" />
                              <div>
                                <div className="font-medium">{getKnowledgeBaseName(kbId)}</div>
                                <div className="text-xs text-muted-foreground">{kbId}</div>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newIds = [...(editedMode.knowledgeBaseIds || [])];
                                newIds.splice(index, 1);
                                setEditedMode({ ...editedMode, knowledgeBaseIds: newIds });
                              }}
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                        <Database className="h-10 w-10 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          No knowledge bases attached
                        </p>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          Attach knowledge bases to improve this mode's capabilities
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Add Knowledge Base */}
                  <div className="space-y-2 relative">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">Add Knowledge Base</h4>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={kbSearchTerm}
                          onChange={(e) => {
                            setKbSearchTerm(e.target.value);
                            setShowKbDropdown(true);
                          }}
                          onFocus={() => setShowKbDropdown(true)}
                          className="w-full px-3 py-2 pl-9 rounded-lg border bg-background"
                          placeholder="Search knowledge bases..."
                        />
                        <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                        
                        {showKbDropdown && (
                          <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg bg-background shadow-lg max-h-60 overflow-y-auto z-10">
                            {filteredKnowledgeBases.length > 0 ? (
                              filteredKnowledgeBases.map((kb: KnowledgeBaseItem) => (
                                <button
                                  key={kb.id}
                                  className={cn(
                                    "w-full flex items-center gap-3 p-3 text-left hover:bg-muted/60 transition-colors",
                                    isKnowledgeBaseAttached(kb.id) && "bg-primary/10"
                                  )}
                                  onClick={() => {
                                    if (isKnowledgeBaseAttached(kb.id)) {
                                      // Remove if already attached
                                      setEditedMode({
                                        ...editedMode,
                                        knowledgeBaseIds: editedMode.knowledgeBaseIds?.filter(id => id !== kb.id)
                                      });
                                    } else {
                                      // Add if not attached
                                      setEditedMode({
                                        ...editedMode,
                                        knowledgeBaseIds: [...(editedMode.knowledgeBaseIds || []), kb.id]
                                      });
                                    }
                                    setKbSearchTerm('');
                                  }}
                                >
                                  <div className="flex-shrink-0">
                                    {kb.sourceType === 'web' && <Globe className="h-5 w-5 text-blue-500" />}
                                    {kb.sourceType === 'document' && <FileText className="h-5 w-5 text-emerald-500" />}
                                    {(!kb.sourceType || kb.sourceType === 'knowledgeBase') && <Database className="h-5 w-5 text-primary" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium">{kb.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{kb.description}</div>
                                  </div>
                                  {isKnowledgeBaseAttached(kb.id) && (
                                    <div className="flex-shrink-0 bg-primary/20 text-primary text-xs py-1 px-2 rounded-full">
                                      Attached
                                    </div>
                                  )}
                                </button>
                              ))
                            ) : (
                              <div className="p-3 text-sm text-muted-foreground text-center">
                                No knowledge bases found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setShowKbDropdown(!showKbDropdown)}
                        className="p-2 rounded-lg border bg-muted hover:bg-muted/80 transition-colors"
                      >
                        <Book className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      You can also directly enter a knowledge base ID
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                      <input
                        type="text"
                        placeholder="Enter knowledge base ID manually..."
                        className="flex-1 px-3 py-2 rounded-lg border bg-background"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.target as HTMLInputElement).value) {
                            const value = (e.target as HTMLInputElement).value;
                            if (!editedMode.knowledgeBaseIds?.includes(value)) {
                              setEditedMode({
                                ...editedMode,
                                knowledgeBaseIds: [...(editedMode.knowledgeBaseIds || []), value]
                              });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <button
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="Enter knowledge base ID manually..."]') as HTMLInputElement;
                          if (input && input.value && !editedMode.knowledgeBaseIds?.includes(input.value)) {
                            setEditedMode({
                              ...editedMode,
                              knowledgeBaseIds: [...(editedMode.knowledgeBaseIds || []), input.value]
                            });
                            input.value = '';
                          }
                        }}
                        className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Workflow Suggestions based on Knowledge Base */}
                <div className="space-y-3 mt-6 pt-6 border-t">
                  <h3 className="text-lg font-medium">Workflow Suggestions</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your selected knowledge bases, here are recommended workflows you can add to this mode.
                  </p>

                  <div className="space-y-2 mt-4">
                    {editedMode.knowledgeBaseIds && editedMode.knowledgeBaseIds.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        <button 
                          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/40 transition-colors text-left"
                          onClick={() => {
                            const newInstructions = [
                              ...(editedMode.customInstructions || []),
                              `Always check the knowledge base first when answering questions.`,
                              `Cite the specific knowledge base source when providing information.`
                            ];
                            setEditedMode({ ...editedMode, customInstructions: newInstructions });
                          }}
                        >
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Database className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Knowledge Base Reference</h4>
                            <p className="text-sm text-muted-foreground">
                              Add instructions to check knowledge bases first and cite sources when answering.
                            </p>
                          </div>
                        </button>

                        <button 
                          className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/40 transition-colors text-left"
                          onClick={() => {
                            const newInstructions = [
                              ...(editedMode.customInstructions || []),
                              `When the user asks a question, always search the knowledge base first.`,
                              `If the answer isn't in the knowledge base, then use your general knowledge but make it clear that this information is not from the knowledge base.`
                            ];
                            setEditedMode({ ...editedMode, customInstructions: newInstructions });
                          }}
                        >
                          <div className="p-2 bg-primary/10 rounded-full">
                            <Search className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">Priority Search</h4>
                            <p className="text-sm text-muted-foreground">
                              Add instructions to prioritize knowledge base search over general knowledge.
                            </p>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg">
                        <p className="text-sm text-muted-foreground text-center">
                          Attach knowledge bases to see workflow suggestions
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Temperature</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={editedMode.temperature}
                      onChange={(e) => setEditedMode({ ...editedMode, temperature: Number(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      {editedMode.temperature}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Tokens</label>
                    <input
                      type="number"
                      value={editedMode.maxTokens}
                      onChange={(e) => setEditedMode({ ...editedMode, maxTokens: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Top P</label>
                    <input
                      type="number"
                      min="0"
                      max="1"
                      step="0.1"
                      value={editedMode.topP}
                      onChange={(e) => setEditedMode({ ...editedMode, topP: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Context Window</label>
                    <input
                      type="number"
                      value={editedMode.contextWindow}
                      onChange={(e) => setEditedMode({ ...editedMode, contextWindow: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border bg-background"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeCustomizer; 