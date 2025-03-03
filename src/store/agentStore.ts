import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AgentFlow, AgentStep, ResearchAgent, ResearchResult, Source } from '../types';

interface AgentCapability {
  id: string;
  name: string;
  description: string;
  type: 'research' | 'analysis' | 'verification' | 'writing' | 'custom';
  parameters?: Record<string, unknown>;
}

interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'available' | 'busy' | 'offline';
  type: 'specialist' | 'generalist';
  capabilities: AgentCapability[];
  metadata?: {
    expertise?: string[];
    performance?: {
      successRate: number;
      averageResponseTime: number;
      tasksCompleted: number;
    };
    settings?: Record<string, unknown>;
  };
}

interface AgentState {
  agents: Agent[];
  activeAgents: string[];
  addAgent: (agent: Omit<Agent, 'id'>) => Agent;
  removeAgent: (id: string) => void;
  updateAgentStatus: (id: string, status: Agent['status']) => void;
  updateAgentCapabilities: (id: string, capabilities: AgentCapability[]) => void;
  updateAgentMetadata: (id: string, metadata: Partial<Agent['metadata']>) => void;
  assignAgentToActive: (id: string) => void;
  removeAgentFromActive: (id: string) => void;
}

// Mock function to simulate research results
const simulateResearch = async (query: string): Promise<ResearchResult> => {
  // In a real app, this would call an API or perform actual research
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  const mockSources: Source[] = [
    {
      id: uuidv4(),
      name: 'Research Source 1',
      url: 'https://example.com/1',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=faces'
    },
    {
      id: uuidv4(),
      name: 'Research Source 2',
      url: 'https://example.com/2',
      avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=32&h=32&fit=crop&crop=faces'
    }
  ];
  
  return {
    id: uuidv4(),
    query,
    content: `Research results for: ${query}\n\nThis is a simulated research result that would contain information gathered from various sources about "${query}". In a production environment, this would contain actual research data.`,
    sources: mockSources,
    timestamp: new Date()
  };
};

export const useAgentStore = create<AgentState>((set, get) => ({
  agents: [
    {
      id: 'default-assistant',
      name: 'General Assistant',
      description: 'A general-purpose AI assistant capable of handling various tasks',
      status: 'available',
      type: 'generalist',
      capabilities: [
        {
          id: 'general-chat',
          name: 'General Chat',
          description: 'Engage in general conversation and answer questions',
          type: 'custom',
        },
        {
          id: 'research',
          name: 'Research',
          description: 'Conduct research and gather information',
          type: 'research',
        },
        {
          id: 'writing',
          name: 'Content Writing',
          description: 'Generate and edit written content',
          type: 'writing',
        },
      ],
      metadata: {
        expertise: ['general knowledge', 'conversation', 'task management'],
        performance: {
          successRate: 0.95,
          averageResponseTime: 1000,
          tasksCompleted: 0,
        },
      },
    },
  ],
  activeAgents: ['default-assistant'],

  addAgent: (agentData) => {
    const newAgent: Agent = {
      ...agentData,
      id: Date.now().toString(),
    };

    set((state) => ({
      agents: [...state.agents, newAgent],
    }));

    return newAgent;
  },

  removeAgent: (id) => {
    set((state) => ({
      agents: state.agents.filter((agent) => agent.id !== id),
      activeAgents: state.activeAgents.filter((agentId) => agentId !== id),
    }));
  },

  updateAgentStatus: (id, status) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, status } : agent
      ),
    }));
  },

  updateAgentCapabilities: (id, capabilities) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id ? { ...agent, capabilities } : agent
      ),
    }));
  },

  updateAgentMetadata: (id, metadata) => {
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === id
          ? {
              ...agent,
              metadata: { ...agent.metadata, ...metadata },
            }
          : agent
      ),
    }));
  },

  assignAgentToActive: (id) => {
    set((state) => ({
      activeAgents: [...new Set([...state.activeAgents, id])],
    }));
  },

  removeAgentFromActive: (id) => {
    set((state) => ({
      activeAgents: state.activeAgents.filter((agentId) => agentId !== id),
    }));
  },
}));