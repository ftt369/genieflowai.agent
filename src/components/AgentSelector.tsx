import { useState } from 'react';
import { useAgentStore } from '../store/agentStore';
import { useThreadStore } from '../store/threadStore';

export default function AgentSelector({ threadId }: { threadId: string }) {
  const { agents } = useAgentStore();
  const { threads, assignAgentToThread, removeAgentFromThread } = useThreadStore();
  const [isOpen, setIsOpen] = useState(false);

  const thread = threads.find((t) => t.id === threadId);
  const assignedAgents = thread?.metadata?.assignedAgents || [];

  const handleAgentToggle = (agentId: string) => {
    if (assignedAgents.includes(agentId)) {
      removeAgentFromThread(threadId, agentId);
    } else {
      assignAgentToThread(threadId, agentId);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Manage Agents
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-64 bg-white rounded-md shadow-lg">
          <div className="p-2">
            <div className="text-sm font-medium text-gray-900 mb-2">
              Available Agents
            </div>
            <div className="space-y-2">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-md"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {agent.name}
                    </div>
                    <div className="text-xs text-gray-500">{agent.type}</div>
                  </div>
                  <button
                    onClick={() => handleAgentToggle(agent.id)}
                    className={`px-2 py-1 text-xs font-medium rounded-md ${
                      assignedAgents.includes(agent.id)
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {assignedAgents.includes(agent.id) ? 'Remove' : 'Add'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 