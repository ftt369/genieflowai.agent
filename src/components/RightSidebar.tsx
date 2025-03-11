import React, { useState } from 'react';
import { useOverlayStore } from '../stores/theme/overlayStore';
import { X, MessageSquare, Bot, Plus, Settings, Layers } from 'lucide-react';
import { cn } from '../lib/utils';
import ThemeCustomizer from './ThemeCustomizer';
import MaterialToggle from './MaterialToggle';
import { ReportAgent } from './agent/ReportAgent';

interface RightSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  mainChatMessages?: Array<{ id: string; role: 'user' | 'assistant'; content: string }>;
  onMainChatInteraction?: (action: 'copy' | 'workflow', content: string) => void;
}

export default function RightSidebar({ 
  isOpen, 
  onClose,
  mainChatMessages,
  onMainChatInteraction 
}: RightSidebarProps) {
  const { material } = useOverlayStore();
  const [activeTab, setActiveTab] = useState<'customize' | 'chats' | 'agents'>('customize');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const tabs = [
    { id: 'customize', label: 'Customize', icon: Settings },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'agents', label: 'Agents', icon: Bot }
  ] as const;

  const presetAgents = [
    { id: 'research', name: 'Research Assistant', type: 'research', description: 'Analyze research papers and documents' },
    { id: 'code', name: 'Code Assistant', type: 'code', description: 'Write and review code' },
    { id: 'data', name: 'Data Analyst', type: 'data', description: 'Process and analyze data' },
    { id: 'creative', name: 'Creative Assistant', type: 'creative', description: 'Generate creative content' },
    { id: 'report', name: 'Report Generator', type: 'report', description: 'Generate and export professional reports' }
  ];

  const renderAgentContent = () => {
    switch (selectedAgent) {
      case 'report':
        return <ReportAgent />;
      default:
        return (
          <div className="text-sm text-[var(--muted-foreground)] text-center py-4">
            Select an agent to get started
          </div>
        );
    }
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 right-0 w-80 z-50",
      "transform transition-transform duration-300 ease-in-out",
      "bg-[var(--background)] border-l border-[var(--border)]",
      "material-base",
      material.type !== 'none' && `material-${material.type}`,
      material.animation?.enabled && 'material-animated',
      material.responsive && 'material-interactive',
      isOpen ? 'translate-x-0' : 'translate-x-full'
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex gap-2">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "p-2 rounded-lg transition-colors flex items-center gap-2",
                  activeTab === id 
                    ? "bg-[var(--primary)] text-white" 
                    : "hover:bg-[var(--muted)]"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'customize' && (
            <div className="p-4 space-y-6">
              {/* Theme Customization */}
              <section className="space-y-4">
                <h3 className="text-base font-medium">Theme</h3>
                <ThemeCustomizer />
              </section>

              {/* Material Effects */}
              <section className="space-y-4">
                <h3 className="text-base font-medium">Material Effects</h3>
                <MaterialToggle />
              </section>
            </div>
          )}

          {activeTab === 'chats' && (
            <div className="p-4 space-y-6">
              {/* Quick Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  New Chat
                </button>
              </div>

              {/* Recent Chats */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Recent</h3>
                <div className="space-y-2">
                  {mainChatMessages && mainChatMessages.map((msg) => (
                    <div 
                      key={msg.id}
                      className={cn(
                        "p-3 rounded-lg",
                        "material-base material-glass material-interactive",
                        msg.role === 'assistant' ? 'bg-[var(--primary)]/10' : 'bg-[var(--muted)]'
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{msg.role}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => onMainChatInteraction?.('copy', msg.content)}
                            className="text-xs hover:text-[var(--primary)]"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => onMainChatInteraction?.('workflow', msg.content)}
                            className="text-xs hover:text-[var(--primary)]"
                          >
                            Add to Workflow
                          </button>
                        </div>
                      </div>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Saved Chats */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Saved</h3>
                <div className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  No saved chats yet
                </div>
              </section>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="p-4 space-y-6">
              {/* Quick Actions */}
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 p-2 bg-[var(--primary)] text-white rounded-lg hover:opacity-90">
                  <Plus className="h-4 w-4" />
                  New Agent
                </button>
              </div>

              {/* Preset Agents */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Preset Agents</h3>
                <div className="grid grid-cols-1 gap-2">
                  {presetAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent.id)}
                      className={cn(
                        "p-3 rounded-lg text-left w-full",
                        "material-base material-glass material-interactive",
                        selectedAgent === agent.id ? "bg-[var(--primary)]/10" : "hover:bg-[var(--muted)]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-md bg-[var(--primary)]/10">
                          <Bot className="h-4 w-4 text-[var(--primary)]" />
                        </div>
                        <div>
                          <div className="font-medium">{agent.name}</div>
                          <div className="text-sm text-[var(--muted-foreground)]">{agent.description}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Custom Agents */}
              <section className="space-y-4">
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Custom Agents</h3>
                <div className="text-sm text-[var(--muted-foreground)] text-center py-4">
                  No custom agents yet
                </div>
              </section>

              {/* Selected Agent Content */}
              {selectedAgent && (
                <section className="mt-6">
                  <div className="border-t border-[var(--border)] pt-6">
                    {renderAgentContent()}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
} 