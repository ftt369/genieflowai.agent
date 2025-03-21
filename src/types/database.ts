export type UUID = string;

export interface Profile {
  id: UUID;
  user_id: UUID;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  company: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: UUID;
  user_id: UUID;
  theme: string;
  language: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Mode {
  id: UUID;
  user_id: UUID;
  name: string;
  description: string | null;
  config: Record<string, any>;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeBase {
  id: UUID;
  user_id: UUID;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeDocument {
  id: UUID;
  knowledge_base_id: UUID;
  title: string;
  content: string;
  metadata: Record<string, any> | null;
  file_path: string | null;
  embeddings_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkersCompDocument {
  id: UUID;
  user_id: UUID;
  document_type: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: 'pending' | 'approved' | 'rejected';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseChangePayload<T> {
  new: T | null;
  old: T | null;
  schema: string;
  table: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
} 