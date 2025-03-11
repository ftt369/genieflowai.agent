import React, { useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { ArrowRight, Link, Plus, X } from 'lucide-react';

export default function AgentIntegration() {
  const { 
    flows, 
    researchAgents,
    getActiveFlow,
    getActiveResearchAgent
  } = useAgentStore();
  
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [integrations, setIntegrations] = useState<Array<{flowId: string, agentId: string}>>([]);
  
  const handleAddIntegration = () => {
    if (selectedFlow && selectedAgent) {
      setIntegrations([...integrations, { flowId: selectedFlow, agentId: selectedAgent }]);
      setSelectedFlow(null);
      setSelectedAgent(null);
    }
  };
  
  const handleRemoveIntegration = (index: number) => {
    setIntegrations(integrations.filter((_, i) => i !== index));
  };
  
  const getFlowName = (id: string) => {
    return flows.find(flow => flow.id === id)?.name || 'Unknown Flow';
  };
  
  const getAgentName = (id: string) => {
    return researchAgents.find(agent => agent.id === id)?.name || 'Unknown Agent';
  };
  
  return (
    <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-xl p-6 transition-colors">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent Integration</h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Connect your agent flows with research agents to automate complex research tasks.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Flow
            </label>
            <select
              value={selectedFlow || ''}
              onChange={(e) => setSelectedFlow(e.target.value || null)}
              className="w-full px-3 py-2 bg-white dark:bg-[#3C3C3C] border border-gray-200 dark:border-[#4C4C4C] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Select a flow...</option>
              {flows.map(flow => (
                <option key={flow.id} value={flow.id}>{flow.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select Research Agent
            </label>
            <select
              value={selectedAgent || ''}
              onChange={(e) => setSelectedAgent(e.target.value || null)}
              className="w-full px-3 py-2 bg-white dark:bg-[#3C3C3C] border border-gray-200 dark:border-[#4C4C4C] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Select an agent...</option>
              {researchAgents.map(agent => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={handleAddIntegration}
          disabled={!selectedFlow || !selectedAgent}
          className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-white transition-colors ${
            selectedFlow && selectedAgent
              ? 'bg-blue-500 hover:bg-blue-600'
              : 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
          }`}
        >
          <Plus size={16} />
          <span>Add Integration</span>
        </button>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Active Integrations</h3>
        
        {integrations.length === 0 ? (
          <div className="bg-white dark:bg-[#3C3C3C] border border-dashed border-gray-300 dark:border-[#4C4C4C] rounded-lg p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No integrations yet. Connect flows and agents to create powerful research workflows.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {integrations.map((integration, index) => (
              <div 
                key={index}
                className="bg-white dark:bg-[#3C3C3C] p-4 rounded-lg border border-gray-200 dark:border-[#4C4C4C] flex items-center"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {getFlowName(integration.flowId)}
                    </span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {getAgentName(integration.agentId)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <Link size={12} className="text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Integration will use research agent results in flow steps
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveIntegration(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}