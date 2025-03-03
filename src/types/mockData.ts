import { User } from './auth';
import { WorkflowTemplate } from './workflow';

export interface MockDatabase {
  users: User[];
  profiles: {
    id: string;
    full_name: string;
    avatar_url?: string;
    email: string;
    created_at: string;
    updated_at: string;
  }[];
  agents: {
    id: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    config: Record<string, any>;
  }[];
  workflows: WorkflowTemplate[];
  knowledge_bases: {
    id: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    documents: {
      id: string;
      name: string;
      content: string;
      metadata: Record<string, any>;
    }[];
  }[];
} 