import { useState, useEffect } from 'react';
import { X, Save, Bot, Cpu, Zap, Clock, Activity, BarChart2, LineChart } from 'lucide-react';
import { Agent, AgentType } from '../types/agent';
import { ReportService, ReportConfig } from '../../services/reportService';
import { modelServiceFactory } from '../../services/modelService';

interface AgentConfigModalProps {
  agent: Agent | null;
  onClose: () => void;
  onSave: (updatedAgent: Agent) => void;
}

const agentTypes: AgentType[] = [
  { id: 'research', label: 'Research', description: 'Analyze research papers and documents' },
  { id: 'code', label: 'Code', description: 'Write and review code' },
  { id: 'data', label: 'Data', description: 'Process and analyze data' },
  { id: 'creative', label: 'Creative', description: 'Generate creative content' },
  { id: 'analysis', label: 'Analysis', description: 'Analyze trends and patterns' }
];

export interface AgentConfig {
  name: string;
  description?: string;
  type: 'chat' | 'research' | 'report';
  prompt: string;
  settings?: {
    style?: 'formal' | 'casual' | 'technical';
    format?: 'detailed' | 'summary' | 'bullet-points';
    sections?: string[];
  };
}

export function AgentConfigModal({ agent, onClose, onSave }: AgentConfigModalProps) {
  const [editedAgent, setEditedAgent] = useState<Agent | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'advanced' | 'metrics'>('general');
  const [agentConfig, setAgentConfig] = useState<AgentConfig>({
    name: '',
    description: '',
    type: 'chat',
    prompt: '',
    settings: {
      style: 'formal',
      format: 'detailed',
      sections: ['Executive Summary', 'Introduction', 'Findings', 'Conclusion']
    }
  });
  const [newSection, setNewSection] = useState('');

  useEffect(() => {
    if (agent) {
      setEditedAgent({
        ...agent,
        config: agent.config || {
          memory: 512,
          speed: 50,
          accuracy: 75,
          interval: 5
        },
        metrics: agent.metrics || {
          tasksCompleted: 247,
          averageResponseTime: 1.2,
          successRate: 98.3,
          memoryUsage: 384
        }
      });
    }
  }, [agent]);

  if (!editedAgent) return null;

  const handleSave = async () => {
    if (editedAgent) {
      if (agentConfig.type === 'report') {
        const reportService = new ReportService(modelServiceFactory.getService('gemini'));
        // Save report agent configuration
        // You can add specific handling for report agents here
      }
      onSave(editedAgent);
      onClose();
    }
  };

  const handleTypeChange = (type: 'chat' | 'research' | 'report') => {
    setAgentConfig(prev => ({
      ...prev,
      type,
      settings: type === 'report' ? {
        style: 'formal',
        format: 'detailed',
        sections: ['Executive Summary', 'Introduction', 'Findings', 'Conclusion']
      } : undefined
    }));
  };

  const handleAddSection = () => {
    if (newSection.trim() && agentConfig.settings?.sections) {
      setAgentConfig(prev => ({
        ...prev,
        settings: {
          ...prev.settings!,
          sections: [...prev.settings!.sections!, newSection.trim()]
        }
      }));
      setNewSection('');
    }
  };

  const handleRemoveSection = (index: number) => {
    if (agentConfig.settings?.sections) {
      setAgentConfig(prev => ({
        ...prev,
        settings: {
          ...prev.settings!,
          sections: prev.settings!.sections!.filter((_, i) => i !== index)
        }
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed left-1/2 top-1/2 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2">
        <div className="bg-card border border-input rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-input">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-md bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Configure Agent</h2>
                <p className="text-sm text-muted-foreground">Customize agent settings and behavior</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-input">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative
                        ${activeTab === 'general' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              General
              {activeTab === 'general' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('advanced')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative
                        ${activeTab === 'advanced' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Advanced
              {activeTab === 'advanced' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-6 py-3 text-sm font-medium transition-colors relative
                        ${activeTab === 'metrics' ? 'text-primary' : 'text-muted-foreground'}`}
            >
              Metrics
              {activeTab === 'metrics' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={agentConfig.name}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full mt-1 p-2 rounded-md border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={agentConfig.description || ''}
                    onChange={(e) => setAgentConfig(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full mt-1 p-2 rounded-md border border-input bg-background resize-none h-20"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleTypeChange('chat')}
                      className={`flex-1 p-2 rounded-lg ${agentConfig.type === 'chat' ? 'bg-primary text-white' : 'bg-muted'}`}
                    >
                      Chat Agent
                    </button>
                    <button
                      onClick={() => handleTypeChange('research')}
                      className={`flex-1 p-2 rounded-lg ${agentConfig.type === 'research' ? 'bg-primary text-white' : 'bg-muted'}`}
                    >
                      Research Agent
                    </button>
                    <button
                      onClick={() => handleTypeChange('report')}
                      className={`flex-1 p-2 rounded-lg ${agentConfig.type === 'report' ? 'bg-primary text-white' : 'bg-muted'}`}
                    >
                      Report Agent
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium">Memory (MB)</label>
                    </div>
                    <span className="text-sm text-muted-foreground">{editedAgent.config?.memory}MB</span>
                  </div>
                  <input
                    type="range"
                    min="128"
                    max="2048"
                    step="128"
                    value={editedAgent.config?.memory}
                    onChange={(e) => setEditedAgent({
                      ...editedAgent,
                      config: { ...editedAgent.config!, memory: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium">Processing Speed</label>
                    </div>
                    <span className="text-sm text-muted-foreground">{editedAgent.config?.speed}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={editedAgent.config?.speed}
                    onChange={(e) => setEditedAgent({
                      ...editedAgent,
                      config: { ...editedAgent.config!, speed: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium">Accuracy Level</label>
                    </div>
                    <span className="text-sm text-muted-foreground">{editedAgent.config?.accuracy}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={editedAgent.config?.accuracy}
                    onChange={(e) => setEditedAgent({
                      ...editedAgent,
                      config: { ...editedAgent.config!, accuracy: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <label className="text-sm font-medium">Update Interval (seconds)</label>
                    </div>
                    <span className="text-sm text-muted-foreground">{editedAgent.config?.interval}s</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="60"
                    value={editedAgent.config?.interval}
                    onChange={(e) => setEditedAgent({
                      ...editedAgent,
                      config: { ...editedAgent.config!, interval: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-input">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Tasks Completed</div>
                        <div className="mt-1 text-2xl font-semibold">
                          {editedAgent.metrics?.tasksCompleted}
                        </div>
                      </div>
                      <BarChart2 className="h-8 w-8 text-primary/20" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Last 7 days</div>
                    <div className="mt-3 h-2 bg-primary/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: '75%' }}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-input">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Response Time</div>
                        <div className="mt-1 text-2xl font-semibold">
                          {editedAgent.metrics?.averageResponseTime}s
                        </div>
                      </div>
                      <Clock className="h-8 w-8 text-primary/20" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Average</div>
                    <div className="mt-3 h-2 bg-primary/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: '60%' }}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-input">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Success Rate</div>
                        <div className="mt-1 text-2xl font-semibold">
                          {editedAgent.metrics?.successRate}%
                        </div>
                      </div>
                      <Activity className="h-8 w-8 text-primary/20" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">All time</div>
                    <div className="mt-3 h-2 bg-primary/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: '98%' }}
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-input">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Memory Usage</div>
                        <div className="mt-1 text-2xl font-semibold">
                          {editedAgent.metrics?.memoryUsage}MB
                        </div>
                      </div>
                      <Cpu className="h-8 w-8 text-primary/20" />
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">Current</div>
                    <div className="mt-3 h-2 bg-primary/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: '45%' }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-lg border border-input">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm font-medium">Performance History</div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>Last 30 days</span>
                      <LineChart className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="h-48 w-full">
                    <div className="h-full w-full flex items-end space-x-1">
                      {Array.from({ length: 30 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/20 rounded-t transition-all duration-500 hover:bg-primary"
                          style={{ height: `${Math.random() * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 p-6 border-t border-input">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 