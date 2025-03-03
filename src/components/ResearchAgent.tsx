import React, { useState } from 'react';
import { Search, Plus, X, Play, Save, Clock, Share2, Bot } from 'lucide-react';
import { useAgentStore } from '../store/agentStore';
import { ResearchResult } from '../types';

export default function ResearchAgent() {
  const { 
    researchAgents, 
    activeResearchAgentId,
    createResearchAgent,
    setActiveResearchAgent,
    getActiveResearchAgent,
    addQuery,
    removeQuery,
    executeQuery,
    quickResearch,
    createFlow
  } = useAgentStore();
  
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDescription, setNewAgentDescription] = useState('');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [quickSearchResult, setQuickSearchResult] = useState<ResearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [newQuery, setNewQuery] = useState('');
  const [showCreateFlowModal, setShowCreateFlowModal] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowDescription, setNewFlowDescription] = useState('');
  
  const activeAgent = getActiveResearchAgent();
  
  const handleCreateAgent = () => {
    if (newAgentName.trim()) {
      createResearchAgent(newAgentName, newAgentDescription);
      setIsCreatingAgent(false);
      setNewAgentName('');
      setNewAgentDescription('');
    }
  };
  
  const handleQuickSearch = async () => {
    if (!quickSearchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await quickResearch(quickSearchQuery);
      setQuickSearchResult(result);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddQuery = () => {
    if (activeAgent && newQuery.trim()) {
      addQuery(activeAgent.id, newQuery);
      setNewQuery('');
    }
  };
  
  const handleExecuteQuery = async (query: string) => {
    if (activeAgent) {
      setIsSearching(true);
      try {
        await executeQuery(activeAgent.id, query);
      } finally {
        setIsSearching(false);
      }
    }
  };
  
  const handleCreateFlow = () => {
    if (newFlowName.trim() && quickSearchResult) {
      const flow = createFlow(newFlowName, newFlowDescription);
      // Add research step with the current query
      flow.steps.push({
        id: crypto.randomUUID(),
        type: 'research',
        name: 'Research',
        description: quickSearchResult.query,
        prompt: quickSearchResult.query,
        order: 0
      });
      setShowCreateFlowModal(false);
      setNewFlowName('');
      setNewFlowDescription('');
    }
  };
  
  if (!activeAgent && !isCreatingAgent) {
    return (
      <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-xl p-6 transition-colors">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Research Agent</h2>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Research</h3>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                placeholder="Enter a research query..."
                className="w-full px-4 py-2 bg-white dark:bg-[#3C3C3C] border border-gray-200 dark:border-[#4C4C4C] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
            <button
              onClick={handleQuickSearch}
              disabled={isSearching || !quickSearchQuery.trim()}
              className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2 ${
                isSearching || !quickSearchQuery.trim()
                  ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isSearching ? (
                <>
                  <Clock className="animate-spin h-4 w-4" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>
          
          {quickSearchResult && (
            <div className="mt-4 bg-white dark:bg-[#3C3C3C] p-4 rounded-lg border border-gray-200 dark:border-[#4C4C4C]">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Results for: {quickSearchResult.query}</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{quickSearchResult.content}</p>
              
              {quickSearchResult.sources.length > 0 && (
                <div className="mt-3">
                  <h5 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Sources:</h5>
                  <div className="flex flex-wrap gap-2">
                    {quickSearchResult.sources.map(source => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-gray-100 dark:bg-[#2C2C2C] px-2 py-1 rounded flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <img src={source.avatar} alt={source.name} className="w-3 h-3 rounded-full" />
                        {source.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateFlowModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
                >
                  <Bot size={14} />
                  <span>Create Agent Flow</span>
                </button>
              </div>
            </div>
          )}
        </div>
        
        {researchAgents.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Research Agents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {researchAgents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => setActiveResearchAgent(agent.id)}
                  className="bg-white dark:bg-[#3C3C3C] p-4 rounded-lg hover:shadow-md transition-shadow text-left"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white">{agent.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{agent.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400">{agent.queries.length} queries</span>
                    <span className="text-xs text-gray-400">{agent.results.length} results</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-200 dark:bg-[#3C3C3C] rounded-full p-4 inline-flex mb-4">
              <Search className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No research agents yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Create your first research agent to automate information gathering
            </p>
          </div>
        )}
        
        <button
          onClick={() => setIsCreatingAgent(true)}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={18} />
          <span>Create Research Agent</span>
        </button>
      </div>
    );
  }
  
  if (isCreatingAgent) {
    return (
      <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-xl p-6 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create Research Agent</h2>
          <button 
            onClick={() => setIsCreatingAgent(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Agent Name
            </label>
            <input
              id="agentName"
              type="text"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#3C3C3C] border border-gray-200 dark:border-[#4C4C4C] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="e.g., Market Research Assistant"
            />
          </div>
          
          <div>
            <label htmlFor="agentDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="agentDescription"
              value={newAgentDescription}
              onChange={(e) => setNewAgentDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-[#3C3C3C] border border-gray-200 dark:border-[#4C4C4C] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              placeholder="What does this agent research?"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsCreatingAgent(false)}
              className="px-4 py-2 border border-gray-300 dark:border-[#4C4C4C] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#3C3C3C] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateAgent}
              disabled={!newAgentName.trim()}
              className={`px-4 py-2 rounded-lg text-white transition-colors ${
                newAgentName.trim() 
                  ? 'bg-blue-500 hover:bg-blue-600' 
                  : 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
              }`}
            >
              Create Agent
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (showCreateFlowModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-[#2C2C2C] rounded-xl p-6 w-96">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create Agent Flow</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Flow Name
              </label>
              <input
                type="text"
                value={newFlowName}
                onChange={(e) => setNewFlowName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                placeholder="Enter flow name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={newFlowDescription}
                onChange={(e) => setNewFlowDescription(e.target.value)}
                className="w-full px-3 py-2 bg-gray-100 dark:bg-[#3C3C3C] rounded-lg"
                placeholder="Enter flow description"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateFlowModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#3C3C3C] rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFlow}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-xl p-6 transition-colors">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{activeAgent?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{activeAgent?.description}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveResearchAgent(null)}
            className="p-2 bg-gray-200 dark:bg-[#3C3C3C] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#4C4C4C] transition-colors"
          >
            <X size={18} />
          </button>
          <button className="p-2 bg-gray-200 dark:bg-[#3C3C3C] rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#4C4C4C] transition-colors">
            <Save size={18} />
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Research Queries</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newQuery}
            onChange={(e) => setNewQuery(e.target.value)}
            placeholder="Add a new query..."
            className="flex-1 px-4 py-2 bg-white dark:bg-[#3C3C3C] border border-gray-200 dark:border-[#4C4C4C] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          <button
            onClick={handleAddQuery}
            disabled={!newQuery.trim()}
            className={`px-4 py-2 rounded-lg text-white transition-colors ${
              newQuery.trim() 
                ? 'bg-blue-500 hover:bg-blue-600' 
                : 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
            }`}
          >
            <Plus size={18} />
          </button>
        </div>
        
        {activeAgent?.queries.length === 0 ? (
          <div className="bg-white dark:bg-[#3C3C3C] border border-dashed border-gray-300 dark:border-[#4C4C4C] rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No queries added yet. Add queries to start researching.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeAgent?.queries.map((query, index) => (
              <div 
                key={index}
                className="flex items-center justify-between bg-white dark:bg-[#3C3C3C] p-3 rounded-lg border border-gray-200 dark:border-[#4C4C4C]"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">{query}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleExecuteQuery(query)}
                    disabled={isSearching}
                    className={`p-1.5 rounded text-white ${
                      isSearching 
                        ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    <Play size={14} />
                  </button>
                  <button
                    onClick={() => removeQuery(activeAgent.id, index)}
                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Research Results</h3>
        
        {activeAgent?.results.length === 0 ? (
          <div className="bg-white dark:bg-[#3C3C3C] border border-dashed border-gray-300 dark:border-[#4C4C4C] rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No results yet. Run queries to see research results.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeAgent?.results.map((result) => (
              <div 
                key={result.id}
                className="bg-white dark:bg-[#3C3C3C] p-4 rounded-lg border border-gray-200 dark:border-[#4C4C4C]"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Query: {result.query}</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line mb-3">{result.content}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    {result.sources.map((source) => (
                      <a
                        key={source.id}
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gray-100 dark:bg-[#2C2C2C] px-2 py-1 rounded flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <img src={source.avatar} alt={source.name} className="w-3 h-3 rounded-full" />
                        {source.name}
                      </a>
                    ))}
                  </div>
                  <span>{new Date(result.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}