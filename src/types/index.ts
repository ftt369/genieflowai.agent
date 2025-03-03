export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Source {
  id: string;
  name: string;
  url: string;
  avatar: string;
}

export interface AgentStep {
  id: string;
  type: 'research' | 'summarize' | 'extract' | 'analyze' | 'custom';
  name: string;
  description: string;
  prompt?: string;
  order: number;
}

export interface AgentFlow {
  id: string;
  name: string;
  description: string;
  steps: AgentStep[];
  createdAt: Date;
  updatedAt: Date;
  isRunning?: boolean;
}

export interface ResearchTopic {
  id: string;
  title: string;
  content: string;
  sources: Source[];
  createdAt: Date;
}

export interface ResearchResult {
  id: string;
  query: string;
  content: string;
  sources: Source[];
  timestamp: Date;
}

export interface ResearchAgent {
  id: string;
  name: string;
  description: string;
  queries: string[];
  results: ResearchResult[];
  isActive: boolean;
}