export interface Agent {
  id: number;
  name: string;
  task: string;
  isActive: boolean;
  status: 'idle' | 'running' | 'error';
  type: 'research' | 'code' | 'data' | 'creative' | 'analysis';
  linkedTo?: number[];
  config?: {
    memory: number;
    speed: number;
    accuracy: number;
    interval: number;
  };
  metrics?: {
    tasksCompleted: number;
    averageResponseTime: number;
    successRate: number;
    memoryUsage: number;
  };
}

export interface AgentType {
  id: Agent['type'];
  label: string;
  description: string;
  icon?: JSX.Element;
}

export interface AgentLink {
  sourceId: number;
  targetId: number;
  type: 'data' | 'control' | 'trigger';
  status: 'active' | 'inactive' | 'error';
} 