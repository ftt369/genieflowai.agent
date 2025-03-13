import { useState, useEffect } from 'react';
import { Bot, Code, Search, Brain, Plus, Settings, ChevronRight, Loader2, Check, FileText, X, ArrowLeft } from 'lucide-react';
import { ReportService } from '../services/reportService';

type Tab = 'builder' | 'research';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';
type ReportStyle = 'formal' | 'casual' | 'technical';
type ReportFormat = 'detailed' | 'summary' | 'bullet-points';

interface FormData {
  name: string;
  description: string;
  capabilities: Set<string>;
  style: ReportStyle;
  format: ReportFormat;
  sections: string[];
}

interface Template {
  id: string;
  type: 'chat' | 'research' | 'report';
  name: string;
  description: string;
  icon: React.ReactNode;
  features?: string[];
}

interface Agent {
  id: string;
  type: 'chat' | 'research' | 'report';
  name: string;
  description: string;
  settings: {
    style?: ReportStyle;
    format?: ReportFormat;
    sections?: string[];
    capabilities: string[];
  };
  createdAt: string;
}

// Add UUID generation function for browser compatibility
function generateUUID() {
  // Simple UUID generation that doesn't rely on crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function GenieAgentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('builder');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    capabilities: new Set<string>(),
    style: 'formal',
    format: 'detailed',
    sections: []
  });
  const [agents, setAgents] = useState<Agent[]>([]);

  const templates: Template[] = [
    {
      id: 'report-generator',
      type: 'report',
      name: 'Report Generator',
      description: 'Create professional reports with customizable sections and formatting',
      icon: <FileText className="w-6 h-6" />,
      features: [
        'Multiple report styles (formal, casual, technical)',
        'Flexible formatting options',
        'Customizable sections',
        'Export to various formats'
      ]
    },
    {
      id: 'code-assistant',
      type: 'chat',
      name: 'Code Assistant',
      description: 'Get help with coding tasks and technical questions',
      icon: <Code className="w-6 h-6" />,
      features: [
        'Code completion',
        'Bug fixing',
        'Code review',
        'Best practices'
      ]
    },
    {
      id: 'research-assistant',
      type: 'research',
      name: 'Research Assistant',
      description: 'Analyze data and generate insights',
      icon: <Brain className="w-6 h-6" />,
      features: [
        'Data visualization',
        'Statistical analysis',
        'Pattern recognition',
        'Report generation'
      ]
    }
  ];

  useEffect(() => {
    const savedAgents = JSON.parse(localStorage.getItem('agents') || '[]');
    setAgents(savedAgents);
  }, []);

  const handleTemplateClick = (templateId: string) => {
    setLoadingState('loading');
    setSelectedTemplate(templates.find(t => t.id === templateId) || null);
    
    // Simulate loading state
    setTimeout(() => {
      setLoadingState('success');
      setTimeout(() => {
        setIsConfiguring(true);
        setLoadingState('idle');
      }, 500);
    }, 800);
  };

  const handleCreateAgent = async () => {
    if (!selectedTemplate || !formData.name.trim()) return;

    setLoadingState('loading');
    try {
      const agent = {
        id: generateUUID(),
        type: selectedTemplate.type,
        name: formData.name.trim(),
        description: formData.description.trim(),
        settings: {
          style: formData.style,
          format: formData.format,
          sections: formData.sections.filter(section => section.trim()),
          capabilities: Array.from(formData.capabilities)
        },
        createdAt: new Date().toISOString()
      };

      // Save agent to local storage
      const existingAgents = JSON.parse(localStorage.getItem('agents') || '[]');
      localStorage.setItem('agents', JSON.stringify([...existingAgents, agent]));

      setLoadingState('success');
      setTimeout(() => {
        setIsConfiguring(false);
        setFormData({
          name: '',
          description: '',
          capabilities: new Set<string>(),
          style: 'formal',
          format: 'detailed',
          sections: []
        });
      }, 1000);
    } catch (error) {
      console.error('Error creating agent:', error);
      setLoadingState('error');
    }
  };

  const handleStyleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStyle = e.target.value as ReportStyle;
    setFormData(prev => ({ ...prev, style: newStyle }));
  };

  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value as ReportFormat;
    setFormData(prev => ({ ...prev, format: newFormat }));
  };

  const handleDeleteAgent = (agentId: string) => {
    const updatedAgents = agents.filter(agent => agent.id !== agentId);
    localStorage.setItem('agents', JSON.stringify(updatedAgents));
    setAgents(updatedAgents);
  };

  const renderConfigurationForm = () => {
    return (
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter agent name"
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your agent's purpose"
              rows={3}
              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
        </div>

        {/* Template-specific Configuration */}
        {selectedTemplate?.type === 'report' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Report Style</label>
              <select
                value={formData.style}
                onChange={handleStyleChange}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <option value="formal">Formal</option>
                <option value="casual">Casual</option>
                <option value="technical">Technical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Report Format</label>
              <select
                value={formData.format}
                onChange={handleFormatChange}
                className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <option value="detailed">Detailed</option>
                <option value="summary">Summary</option>
                <option value="bullet-points">Bullet Points</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Report Sections</label>
              <div className="space-y-2">
                {formData.sections.map((section, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => {
                        const newSections = [...formData.sections];
                        newSections[index] = e.target.value;
                        setFormData(prev => ({ ...prev, sections: newSections }));
                      }}
                      className="flex-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                    <button
                      onClick={() => {
                        const newSections = formData.sections.filter((_, i) => i !== index);
                        setFormData(prev => ({ ...prev, sections: newSections }));
                      }}
                      className="p-2 text-red-500 hover:text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      sections: [...prev.sections, '']
                    }));
                  }}
                  className="w-full p-2 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
                >
                  Add Section
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={() => setIsConfiguring(false)}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            disabled={loadingState === 'loading'}
          >
            Cancel
          </button>
          <button
            onClick={handleCreateAgent}
            disabled={loadingState !== 'idle' || !formData.name.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
          >
            {loadingState === 'loading' && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {loadingState === 'success' && (
              <Check className="w-4 h-4 animate-scale-in" />
            )}
            Create Agent
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 animate-fade-in">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold text-gradient">GenieAgent</h1>
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover-float animate-glow-pulse">
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 px-4">
          <button
            onClick={() => setActiveTab('builder')}
            className={`pb-2 px-1 text-sm font-medium transition-colors relative hover-highlight ${
              activeTab === 'builder'
                ? 'text-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Agent Builder
            {activeTab === 'builder' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 animate-scale-in" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('research')}
            className={`pb-2 px-1 text-sm font-medium transition-colors relative hover-highlight ${
              activeTab === 'research'
                ? 'text-blue-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
            }`}
          >
            Research
            {activeTab === 'research' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 animate-scale-in" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Existing Agents */}
          {agents.length > 0 && !isConfiguring && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Your Agents</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {agents.map(agent => (
                  <div
                    key={agent.id}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold">{agent.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {agent.description}
                        </p>
                        {agent.type === 'report' && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500">
                              Style: {agent.settings.style}
                            </p>
                            <p className="text-xs text-gray-500">
                              Format: {agent.settings.format}
                            </p>
                            {agent.settings.sections && agent.settings.sections.length > 0 && (
                              <div className="text-xs text-gray-500">
                                Sections: {agent.settings.sections.join(', ')}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {agent.settings.capabilities.map((capability, index) => (
                            <span
                              key={index}
                              className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full"
                            >
                              {capability}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Create New Agent */}
          {!isConfiguring ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template.id)}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-left"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg text-primary">
                      {template.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {template.description}
                      </p>
                    </div>
                  </div>
                  {template.features && (
                    <div className="flex flex-wrap gap-2">
                      {template.features.map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setIsConfiguring(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-semibold animate-fade-right">
                  Configure {selectedTemplate?.name}
                </h2>
                <div className="w-8" /> {/* Spacer for alignment */}
              </div>
              
              <div className="space-y-6">
                {renderConfigurationForm()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 