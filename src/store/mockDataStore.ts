import { MockDatabase } from '../types/mockData';
import { User } from '../types/auth';
import { WorkflowTemplate } from '../types/workflow';

// Initial mock data
const mockData: MockDatabase = {
  users: [
    {
      id: '1',
      email: 'demo@example.com',
      full_name: 'Demo User',
      created_at: new Date().toISOString(),
      subscription: {
        plan: 'pro' as const,
        status: 'active' as const,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      preferences: {
        theme: 'system' as const,
        notifications: {
          email: true,
          push: true,
        },
      },
    },
  ],
  profiles: [
    {
      id: '1',
      full_name: 'Demo User',
      email: 'demo@example.com',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  agents: [
    {
      id: '1',
      name: 'Research Assistant',
      description: 'AI agent for research and analysis',
      created_by: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      config: {
        capabilities: ['research', 'summarize', 'analyze'],
        language_model: 'gpt-4',
      },
    },
  ],
  workflows: [
    {
      id: '1',
      name: 'Legal Document Analysis',
      description: 'Analyze legal documents and generate summaries',
      category: 'Legal',
      steps: [
        {
          id: '1',
          type: 'document_input',
          name: 'Upload Documents',
          description: 'Upload legal documents for analysis',
          config: {},
          order: 1,
          status: 'pending',
        },
        {
          id: '2',
          type: 'summarize',
          name: 'Generate Summary',
          description: 'Create a comprehensive summary of the documents',
          config: {},
          order: 2,
          status: 'pending',
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  knowledge_bases: [
    {
      id: '1',
      name: 'Legal Resources',
      description: 'Collection of legal documents and references',
      created_by: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents: [
        {
          id: '1',
          name: 'Contract Templates',
          content: 'Sample contract templates and guidelines',
          metadata: {
            type: 'template',
            category: 'contracts',
            tags: ['legal', 'template', 'contract'],
          },
        },
      ],
    },
  ],
};

// Mock data service functions
export const mockDataService = {
  // Authentication
  signIn: async (email: string, password: string) => {
    const user = mockData.users.find(u => u.email === email);
    if (user && password === 'demo') { // In real app, we'll use proper password hashing
      return { user, error: null };
    }
    return { user: null, error: 'Invalid credentials' };
  },

  signUp: async (email: string, password: string, fullName: string) => {
    const newUser: User = {
      id: String(mockData.users.length + 1),
      email,
      full_name: fullName,
      created_at: new Date().toISOString(),
      subscription: {
        plan: 'free' as const,
        status: 'active' as const,
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    };
    mockData.users.push(newUser);
    return { user: newUser, error: null };
  },

  // Agents
  getAgents: async (userId: string) => {
    return mockData.agents.filter(agent => agent.created_by === userId);
  },

  createAgent: async (userId: string, name: string, description: string) => {
    const newAgent = {
      id: String(mockData.agents.length + 1),
      name,
      description,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      config: {
        capabilities: ['research', 'summarize', 'analyze'],
        language_model: 'gpt-4',
      },
    };
    mockData.agents.push(newAgent);
    return { agent: newAgent, error: null };
  },

  // Workflows
  getWorkflows: async (userId: string) => {
    return mockData.workflows;
  },

  createWorkflow: async (userId: string, data: Omit<WorkflowTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newWorkflow: WorkflowTemplate = {
      ...data,
      id: String(mockData.workflows.length + 1),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockData.workflows.push(newWorkflow);
    return { workflow: newWorkflow, error: null };
  },

  // Knowledge Bases
  getKnowledgeBases: async (userId: string) => {
    return mockData.knowledge_bases.filter(kb => kb.created_by === userId);
  },

  createKnowledgeBase: async (userId: string, name: string, description: string) => {
    const newKB = {
      id: String(mockData.knowledge_bases.length + 1),
      name,
      description,
      created_by: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      documents: [],
    };
    mockData.knowledge_bases.push(newKB);
    return { knowledgeBase: newKB, error: null };
  },
}; 