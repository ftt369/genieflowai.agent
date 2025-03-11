import React, { useState } from 'react';
import { useModeStore, type AssistantMode } from '@stores/model/modeStore';
import { cn } from '@utils/cn';
import { 
  Save,
  Trash2,
  Plus,
  MessageSquare,
  Settings2,
  Database,
  Sliders,
  Tags
} from 'lucide-react';

interface ModeCustomizerProps {
  mode: AssistantMode;
  onClose: () => void;
}

const ModeCustomizer: React.FC<ModeCustomizerProps> = ({ mode, onClose }) => {
  const { updateMode, deleteCustomMode } = useModeStore();
  const [activeTab, setActiveTab] = useState<'prompts' | 'settings' | 'knowledge' | 'advanced'>('prompts');
  const [editedMode, setEditedMode] = useState<AssistantMode>({ ...mode });

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

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-x-0 top-0 h-[90vh] mt-16 bg-background border rounded-t-lg shadow-lg">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Customize Mode: {editedMode.name}</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Knowledge Base IDs</label>
                    <button
                      onClick={() => setEditedMode({
                        ...editedMode,
                        knowledgeBaseIds: [...(editedMode.knowledgeBaseIds || []), '']
                      })}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/90"
                    >
                      <Plus className="h-3 w-3" />
                      Add Knowledge Base
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editedMode.knowledgeBaseIds?.map((id, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={id}
                          onChange={(e) => {
                            const newIds = [...(editedMode.knowledgeBaseIds || [])];
                            newIds[index] = e.target.value;
                            setEditedMode({ ...editedMode, knowledgeBaseIds: newIds });
                          }}
                          className="flex-1 px-3 py-2 rounded-lg border bg-background"
                          placeholder="Enter knowledge base ID..."
                        />
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