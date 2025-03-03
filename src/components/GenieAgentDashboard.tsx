import { useState, useEffect } from 'react';
import { Bot, Code, Search, Brain, Plus, Settings, ChevronRight, Loader2, Check } from 'lucide-react';

type Tab = 'builder' | 'research';
type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export default function GenieAgentDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('builder');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capabilities: new Set<string>()
  });

  const templates = [
    {
      id: 'code-assistant',
      name: 'Code Assistant',
      description: 'Create an AI agent specialized in code review and development',
      icon: <Code className="w-6 h-6" />,
      features: ['Code review', 'Bug detection', 'Best practices', 'Documentation'],
    },
    {
      id: 'research-assistant',
      name: 'Research Assistant',
      description: 'Build an AI agent for academic research and literature review',
      icon: <Search className="w-6 h-6" />,
      features: ['Literature review', 'Data analysis', 'Citation management', 'Summary generation'],
    },
    {
      id: 'analysis-assistant',
      name: 'Analysis Assistant',
      description: 'Design an AI agent for data analysis and insights',
      icon: <Brain className="w-6 h-6" />,
      features: ['Data visualization', 'Statistical analysis', 'Pattern recognition', 'Report generation'],
    },
  ];

  const handleTemplateClick = (templateId: string) => {
    setLoadingState('loading');
    setSelectedTemplate(templateId);
    
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
    setLoadingState('loading');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoadingState('success');
    setTimeout(() => {
      setIsConfiguring(false);
      setLoadingState('idle');
    }, 1000);
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
        {activeTab === 'builder' ? (
          <div className="space-y-6 animate-fade-in">
            {!isConfiguring ? (
              <>
                {/* Empty State */}
                <div className="text-center py-12 animate-float-in">
                  <Brain className="w-16 h-16 mx-auto text-blue-500 animate-wave" />
                  <h2 className="mt-4 text-xl font-semibold animate-fade-up">Create Your First Agent</h2>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto animate-fade-up delay-100">
                    Start by selecting a template below or create a custom agent from scratch.
                  </p>
                </div>

                {/* Templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template, idx) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateClick(template.id)}
                      className="group p-6 text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] hover:border-blue-500/50 transition-all duration-300 animate-fade-up"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        {template.icon}
                      </div>
                      <h3 className="text-lg font-medium mb-2 group-hover:text-blue-500 transition-colors">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {template.features.map((feature, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}

                  {/* Custom Agent */}
                  <button className="group p-6 text-left bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 animate-fade-up" style={{ animationDelay: `${templates.length * 100}ms` }}>
                    <div className="w-12 h-12 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                      <Plus className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-medium mb-2 group-hover:text-blue-500 transition-colors">
                      Custom Agent
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-300 transition-colors">
                      Create a custom agent with specific capabilities and knowledge
                    </p>
                  </button>
                </div>
              </>
            ) : (
              <div className="animate-float-in">
                <div className="flex items-center gap-4 mb-8">
                  <button
                    onClick={() => setIsConfiguring(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:scale-110 transition-transform"
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                  <h2 className="text-xl font-semibold animate-fade-right">
                    Configure {templates.find(t => t.id === selectedTemplate)?.name}
                  </h2>
                </div>

                <div className="max-w-2xl animate-slide-up-fade">
                  <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Agent Settings</h3>
                      <Settings className="w-5 h-5 text-gray-500 animate-spin-slow" />
                    </div>

                    <div className="space-y-4">
                      <div className="animate-fade-up" style={{ animationDelay: '100ms' }}>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                          placeholder="Enter agent name..."
                        />
                      </div>

                      <div className="animate-fade-up" style={{ animationDelay: '200ms' }}>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full p-2 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300"
                          placeholder="Describe your agent's purpose..."
                          rows={3}
                        />
                      </div>

                      <div className="animate-fade-up" style={{ animationDelay: '300ms' }}>
                        <label className="block text-sm font-medium mb-1">Capabilities</label>
                        <div className="space-y-2">
                          {templates
                            .find(t => t.id === selectedTemplate)
                            ?.features.map((feature, index) => (
                              <label
                                key={index}
                                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-colors duration-300"
                                style={{ animationDelay: `${index * 100}ms` }}
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.capabilities.has(feature)}
                                  onChange={(e) => {
                                    const newCapabilities = new Set(formData.capabilities);
                                    if (e.target.checked) {
                                      newCapabilities.add(feature);
                                    } else {
                                      newCapabilities.delete(feature);
                                    }
                                    setFormData(prev => ({ ...prev, capabilities: newCapabilities }));
                                  }}
                                  className="text-blue-500 focus:ring-blue-500/20"
                                />
                                <span>{feature}</span>
                              </label>
                            ))}
                        </div>
                      </div>
                    </div>

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
                        disabled={loadingState !== 'idle'}
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
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            {/* Research Tab Content */}
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto text-blue-500 animate-float" />
              <h2 className="mt-4 text-xl font-semibold animate-fade-up">Research Hub</h2>
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-md mx-auto animate-fade-up delay-100">
                Coming soon! Explore and analyze agent performance, share insights, and discover new possibilities.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 