import { Timestamp } from 'firebase/firestore';

export interface FirebaseUser {
  uid: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin?: Timestamp;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'admin' | 'moderator';
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'trialing' | 'past_due' | 'canceled';
    currentPeriodEnd: Timestamp;
  };
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    notifications?: {
      email: boolean;
      push: boolean;
    };
  };
}

export interface Agent {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  type: 'research' | 'writing' | 'analysis' | 'custom';
  capabilities: string[];
  config: Record<string, any>;
  isPublic: boolean;
  version: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AgentTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  agentId: string;
  config: Record<string, any>;
  isFeatured: boolean;
  usageCount: number;
  rating: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  category: string;
  isTemplate: boolean;
  isPublic: boolean;
  version: string;
  metadata: Record<string, any>;
  steps: WorkflowStep[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description?: string;
  type: 'document_input' | 'summarize' | 'research' | 'analyze' | 'write' | 'verify' | 'proofread' | 'export' | 'custom';
  orderIndex: number;
  config: Record<string, any>;
  requiredInputs: string[];
  expectedOutputs: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  userId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'canceled';
  startedAt?: Timestamp;
  completedAt?: Timestamp;
  results: Record<string, any>;
  error?: string;
  metrics: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  category: string;
  isPublic: boolean;
  metadata: Record<string, any>;
  documents: Document[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  metadata: Record<string, any>;
  embedding?: number[];
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  settings: Record<string, any>;
  members: TeamMember[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface TeamMember {
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Timestamp;
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  parentId?: string;
  resourceType: string;
  resourceId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  category?: string;
  createdAt: Timestamp;
}

export interface ResourceTag {
  tagId: string;
  resourceType: string;
  resourceId: string;
  createdAt: Timestamp;
}

export interface UsageMetric {
  id: string;
  userId: string;
  resourceType: string;
  resourceId: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: Timestamp;
}

export interface PerformanceMetric {
  id: string;
  resourceType: string;
  resourceId: string;
  metricType: string;
  value: number;
  metadata: Record<string, any>;
  measuredAt: Timestamp;
}

export interface SEOMetadata {
  id: string;
  resourceType: string;
  resourceId: string;
  title?: string;
  description?: string;
  keywords: string[];
  ogImageUrl?: string;
  canonicalUrl?: string;
  structuredData: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
} 