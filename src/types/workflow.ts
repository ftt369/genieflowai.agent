export type WorkflowStepType = 
  | 'document_input'
  | 'summarize'
  | 'research'
  | 'analyze'
  | 'write'
  | 'verify'
  | 'proofread'
  | 'export'
  | 'custom';

export interface WorkflowStep {
  id: string;
  type: WorkflowStepType;
  name: string;
  description: string;
  config: Record<string, any>;
  order: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  result?: any;
  error?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean;
}

export interface WorkflowExecution {
  id: string;
  templateId: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  currentStepId: string | null;
  results: Record<string, any>;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  content: string;
  metadata: Record<string, any>;
}

export interface WorkflowContext {
  documents: Document[];
  variables: Record<string, any>;
  history: {
    stepId: string;
    action: string;
    timestamp: string;
    data?: any;
  }[];
} 