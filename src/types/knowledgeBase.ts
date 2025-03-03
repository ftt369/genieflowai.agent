export type DocumentType = 'text' | 'pdf' | 'webpage' | 'code' | 'dataset' | 'api';

export type DocumentSource = 'upload' | 'url' | 'api' | 'marketplace';

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: DocumentType;
  source: DocumentSource;
  content: string;
  metadata: {
    author?: string;
    createdAt: Date;
    updatedAt: Date;
    size: number;
    tags: string[];
    category?: string;
    sourceUrl?: string;
    version?: string;
  };
  embedding?: number[]; // Vector embedding for semantic search
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documents: KnowledgeDocument[];
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    owner: string;
    isPublic: boolean;
    tags: string[];
    category: string;
    version: string;
    stats: {
      documentCount: number;
      totalSize: number;
      lastUpdated: Date;
    };
  };
  config: {
    allowedDocumentTypes: DocumentType[];
    maxDocumentSize: number;
    embeddingModel: string;
    searchConfig: {
      algorithm: 'cosine' | 'euclidean' | 'dot';
      minScore: number;
      maxResults: number;
    };
  };
}

export interface MarketplaceItem {
  id: string;
  type: 'knowledgeBase' | 'agent' | 'workflow';
  name: string;
  description: string;
  author: {
    id: string;
    name: string;
    reputation: number;
  };
  pricing: {
    type: 'free' | 'one-time' | 'subscription';
    price: number;
    currency: string;
    interval?: 'monthly' | 'yearly';
    commission: number; // Platform commission percentage
  };
  stats: {
    downloads: number;
    rating: number;
    reviews: number;
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    tags: string[];
    category: string;
    requirements: string[];
    compatibility: string[];
  };
  preview?: {
    description: string;
    screenshots: string[];
    demo?: string;
  };
} 