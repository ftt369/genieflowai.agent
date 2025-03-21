import { supabase } from '../config/services';
import { KnowledgeBase, KnowledgeDocument } from '../types/knowledgeBase';
import { AssistantMode } from '../stores/model/modeStore';
import { User, UserProfile } from '../types/user';
import { UUID } from '../types/common';

// User profiles
export const getUserProfile = async (userId: UUID): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
};

export const updateUserProfile = async (userId: UUID, updates: Partial<UserProfile>): Promise<boolean> => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  
  if (error) {
    console.error('Error updating user profile:', error);
    return false;
  }
  
  return true;
};

// Modes
export const getModes = async (userId: UUID): Promise<AssistantMode[]> => {
  const { data, error } = await supabase
    .from('modes')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching modes:', error);
    return [];
  }
  
  return data || [];
};

export const getMode = async (modeId: UUID): Promise<AssistantMode | null> => {
  const { data, error } = await supabase
    .from('modes')
    .select('*')
    .eq('id', modeId)
    .single();
  
  if (error) {
    console.error('Error fetching mode:', error);
    return null;
  }
  
  return data;
};

export const createMode = async (mode: Omit<AssistantMode, 'id'>): Promise<AssistantMode | null> => {
  const { data, error } = await supabase
    .from('modes')
    .insert(mode)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating mode:', error);
    return null;
  }
  
  return data;
};

export const updateMode = async (modeId: UUID, updates: Partial<AssistantMode>): Promise<boolean> => {
  const { error } = await supabase
    .from('modes')
    .update(updates)
    .eq('id', modeId);
  
  if (error) {
    console.error('Error updating mode:', error);
    return false;
  }
  
  return true;
};

export const deleteMode = async (modeId: UUID): Promise<boolean> => {
  const { error } = await supabase
    .from('modes')
    .delete()
    .eq('id', modeId);
  
  if (error) {
    console.error('Error deleting mode:', error);
    return false;
  }
  
  return true;
};

// Knowledge Bases
export const getKnowledgeBases = async (userId: UUID): Promise<KnowledgeBase[]> => {
  const { data, error } = await supabase
    .from('knowledge_bases')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching knowledge bases:', error);
    return [];
  }
  
  return data || [];
};

export const getKnowledgeBase = async (knowledgeBaseId: UUID): Promise<KnowledgeBase | null> => {
  const { data, error } = await supabase
    .from('knowledge_bases')
    .select('*')
    .eq('id', knowledgeBaseId)
    .single();
  
  if (error) {
    console.error('Error fetching knowledge base:', error);
    return null;
  }
  
  return data;
};

export const createKnowledgeBase = async (knowledgeBase: Omit<KnowledgeBase, 'id'>): Promise<KnowledgeBase | null> => {
  const { data, error } = await supabase
    .from('knowledge_bases')
    .insert(knowledgeBase)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating knowledge base:', error);
    return null;
  }
  
  return data;
};

export const updateKnowledgeBase = async (knowledgeBaseId: UUID, updates: Partial<KnowledgeBase>): Promise<boolean> => {
  const { error } = await supabase
    .from('knowledge_bases')
    .update(updates)
    .eq('id', knowledgeBaseId);
  
  if (error) {
    console.error('Error updating knowledge base:', error);
    return false;
  }
  
  return true;
};

export const deleteKnowledgeBase = async (knowledgeBaseId: UUID): Promise<boolean> => {
  const { error } = await supabase
    .from('knowledge_bases')
    .delete()
    .eq('id', knowledgeBaseId);
  
  if (error) {
    console.error('Error deleting knowledge base:', error);
    return false;
  }
  
  return true;
};

// Knowledge Documents
export const getKnowledgeDocuments = async (knowledgeBaseId: UUID): Promise<KnowledgeDocument[]> => {
  const { data, error } = await supabase
    .from('knowledge_documents')
    .select('*')
    .eq('knowledge_base_id', knowledgeBaseId);
  
  if (error) {
    console.error('Error fetching knowledge documents:', error);
    return [];
  }
  
  return data || [];
};

export const getKnowledgeDocument = async (documentId: UUID): Promise<KnowledgeDocument | null> => {
  const { data, error } = await supabase
    .from('knowledge_documents')
    .select('*')
    .eq('id', documentId)
    .single();
  
  if (error) {
    console.error('Error fetching knowledge document:', error);
    return null;
  }
  
  return data;
};

export const createKnowledgeDocument = async (document: Omit<KnowledgeDocument, 'id'>): Promise<KnowledgeDocument | null> => {
  const { data, error } = await supabase
    .from('knowledge_documents')
    .insert(document)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating knowledge document:', error);
    return null;
  }
  
  return data;
};

export const updateKnowledgeDocument = async (documentId: UUID, updates: Partial<KnowledgeDocument>): Promise<boolean> => {
  const { error } = await supabase
    .from('knowledge_documents')
    .update(updates)
    .eq('id', documentId);
  
  if (error) {
    console.error('Error updating knowledge document:', error);
    return false;
  }
  
  return true;
};

export const deleteKnowledgeDocument = async (documentId: UUID): Promise<boolean> => {
  const { error } = await supabase
    .from('knowledge_documents')
    .delete()
    .eq('id', documentId);
  
  if (error) {
    console.error('Error deleting knowledge document:', error);
    return false;
  }
  
  return true;
};

// Workers Comp Documents
export interface WorkersCompDocument {
  id: UUID;
  user_id: UUID;
  title: string;
  document_type: string;
  content: string;
  case_number?: string;
  client_name?: string;
  created_at: string;
  updated_at: string;
}

export const getWorkersCompDocuments = async (userId: UUID): Promise<WorkersCompDocument[]> => {
  const { data, error } = await supabase
    .from('workers_comp_documents')
    .select('*')
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error fetching workers comp documents:', error);
    return [];
  }
  
  return data || [];
};

export const getWorkersCompDocument = async (documentId: UUID): Promise<WorkersCompDocument | null> => {
  const { data, error } = await supabase
    .from('workers_comp_documents')
    .select('*')
    .eq('id', documentId)
    .single();
  
  if (error) {
    console.error('Error fetching workers comp document:', error);
    return null;
  }
  
  return data;
};

export const createWorkersCompDocument = async (document: Omit<WorkersCompDocument, 'id' | 'created_at' | 'updated_at'>): Promise<WorkersCompDocument | null> => {
  const { data, error } = await supabase
    .from('workers_comp_documents')
    .insert(document)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating workers comp document:', error);
    return null;
  }
  
  return data;
};

export const updateWorkersCompDocument = async (documentId: UUID, updates: Partial<Omit<WorkersCompDocument, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<boolean> => {
  const { error } = await supabase
    .from('workers_comp_documents')
    .update(updates)
    .eq('id', documentId);
  
  if (error) {
    console.error('Error updating workers comp document:', error);
    return false;
  }
  
  return true;
};

export const deleteWorkersCompDocument = async (documentId: UUID): Promise<boolean> => {
  const { error } = await supabase
    .from('workers_comp_documents')
    .delete()
    .eq('id', documentId);
  
  if (error) {
    console.error('Error deleting workers comp document:', error);
    return false;
  }
  
  return true;
}; 