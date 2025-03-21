import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { KnowledgeBase, KnowledgeDocument, MarketplaceItem } from '../types/knowledgeBase';

// Initial knowledge bases
const INITIAL_KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: 'ca_workers_comp_knowledge',
    name: 'California Workers\' Compensation',
    description: 'Knowledge base containing California workers\' compensation laws, templates, and procedures',
    documents: [
      {
        id: 'ca_workers_comp_templates',
        name: 'CA Workers\' Comp Templates',
        type: 'text',
        source: 'api',
        content: 'This document links to the Workers\' Compensation templates located in src/templates/legal/workers-comp/.',
        metadata: {
          author: 'System',
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 1024,
          tags: ['templates', 'workers comp', 'California'],
          category: 'Legal',
          sourceUrl: '/src/templates/legal/workers-comp/',
          version: '1.0.0',
        },
      },
      {
        id: 'ca_labor_code',
        name: 'California Labor Code Sections 3200-6208',
        type: 'text',
        source: 'api',
        content: 'Reference to California Labor Code Sections 3200-6208 covering workers\' compensation laws.',
        metadata: {
          author: 'State of California',
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 2048,
          tags: ['labor code', 'statutes', 'California'],
          category: 'Legal',
          sourceUrl: 'https://leginfo.legislature.ca.gov/',
          version: '2023',
        },
      },
      {
        id: 'wcab_procedures',
        name: 'WCAB Rules of Practice and Procedure',
        type: 'text',
        source: 'api',
        content: 'Workers\' Compensation Appeals Board Rules of Practice and Procedure.',
        metadata: {
          author: 'WCAB',
          createdAt: new Date(),
          updatedAt: new Date(),
          size: 1536,
          tags: ['WCAB', 'procedures', 'California'],
          category: 'Legal',
          sourceUrl: 'https://www.dir.ca.gov/wcab/WCABProceduralRegulations.htm',
          version: '2023',
        },
      }
    ],
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: 'system',
      isPublic: true,
      tags: ['workers comp', 'California', 'legal', 'templates'],
      category: 'Legal',
      version: '1.0.0',
      stats: {
        documentCount: 3,
        totalSize: 4608,
        lastUpdated: new Date(),
      },
    },
    config: {
      allowedDocumentTypes: ['text', 'pdf', 'webpage', 'code'],
      maxDocumentSize: 10 * 1024 * 1024, // 10MB
      embeddingModel: 'text-embedding-ada-002',
      searchConfig: {
        algorithm: 'cosine',
        minScore: 0.7,
        maxResults: 10,
      },
    },
  }
];

interface KnowledgeBaseState {
  knowledgeBases: KnowledgeBase[];
  activeKnowledgeBaseId: string | null;
  marketplaceItems: MarketplaceItem[];
  searchResults: KnowledgeDocument[];
  isLoading: boolean;
  error: string | null;

  // Knowledge Base Management
  createKnowledgeBase: (name: string, description: string, category: string) => KnowledgeBase;
  updateKnowledgeBase: (id: string, updates: Partial<Omit<KnowledgeBase, 'id'>>) => void;
  deleteKnowledgeBase: (id: string) => void;
  setActiveKnowledgeBase: (id: string | null) => void;
  getActiveKnowledgeBase: () => KnowledgeBase | null;

  // Document Management
  addDocument: (knowledgeBaseId: string, document: Omit<KnowledgeDocument, 'id'>) => Promise<KnowledgeDocument>;
  updateDocument: (knowledgeBaseId: string, documentId: string, updates: Partial<KnowledgeDocument>) => void;
  removeDocument: (knowledgeBaseId: string, documentId: string) => void;
  searchDocuments: (query: string, filters?: { types?: string[]; tags?: string[] }) => Promise<void>;

  // Marketplace Integration
  fetchMarketplaceItems: () => Promise<void>;
  purchaseMarketplaceItem: (itemId: string) => Promise<void>;
  importKnowledgeBase: (marketplaceItemId: string) => Promise<void>;
}

export const useKnowledgeBaseStore = create<KnowledgeBaseState>((set, get) => ({
  knowledgeBases: INITIAL_KNOWLEDGE_BASES,
  activeKnowledgeBaseId: null,
  marketplaceItems: [],
  searchResults: [],
  isLoading: false,
  error: null,

  // Knowledge Base Management
  createKnowledgeBase: (name, description, category) => {
    const newKnowledgeBase: KnowledgeBase = {
      id: uuidv4(),
      name,
      description,
      documents: [],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        owner: 'current-user', // TODO: Replace with actual user ID
        isPublic: false,
        tags: [],
        category,
        version: '1.0.0',
        stats: {
          documentCount: 0,
          totalSize: 0,
          lastUpdated: new Date(),
        },
      },
      config: {
        allowedDocumentTypes: ['text', 'pdf', 'webpage', 'code'],
        maxDocumentSize: 10 * 1024 * 1024, // 10MB
        embeddingModel: 'text-embedding-ada-002',
        searchConfig: {
          algorithm: 'cosine',
          minScore: 0.7,
          maxResults: 10,
        },
      },
    };

    set((state) => ({
      knowledgeBases: [...state.knowledgeBases, newKnowledgeBase],
      activeKnowledgeBaseId: newKnowledgeBase.id,
    }));

    return newKnowledgeBase;
  },

  updateKnowledgeBase: (id, updates) => {
    set((state) => ({
      knowledgeBases: state.knowledgeBases.map((kb) =>
        kb.id === id
          ? {
              ...kb,
              ...updates,
              metadata: {
                ...kb.metadata,
                updatedAt: new Date(),
              },
            }
          : kb
      ),
    }));
  },

  deleteKnowledgeBase: (id) => {
    set((state) => ({
      knowledgeBases: state.knowledgeBases.filter((kb) => kb.id !== id),
      activeKnowledgeBaseId: state.activeKnowledgeBaseId === id ? null : state.activeKnowledgeBaseId,
    }));
  },

  setActiveKnowledgeBase: (id) => {
    set({ activeKnowledgeBaseId: id });
  },

  getActiveKnowledgeBase: () => {
    const { knowledgeBases, activeKnowledgeBaseId } = get();
    return activeKnowledgeBaseId
      ? knowledgeBases.find((kb) => kb.id === activeKnowledgeBaseId) || null
      : null;
  },

  // Document Management
  addDocument: async (knowledgeBaseId, document) => {
    const newDocument: KnowledgeDocument = {
      ...document,
      id: uuidv4(),
    };

    set((state) => ({
      knowledgeBases: state.knowledgeBases.map((kb) =>
        kb.id === knowledgeBaseId
          ? {
              ...kb,
              documents: [...kb.documents, newDocument],
              metadata: {
                ...kb.metadata,
                updatedAt: new Date(),
                stats: {
                  ...kb.metadata.stats,
                  documentCount: kb.documents.length + 1,
                  totalSize: kb.metadata.stats.totalSize + (document.metadata?.size || 0),
                  lastUpdated: new Date(),
                },
              },
            }
          : kb
      ),
    }));

    return newDocument;
  },

  updateDocument: (knowledgeBaseId, documentId, updates) => {
    set((state) => ({
      knowledgeBases: state.knowledgeBases.map((kb) =>
        kb.id === knowledgeBaseId
          ? {
              ...kb,
              documents: kb.documents.map((doc) =>
                doc.id === documentId
                  ? {
                      ...doc,
                      ...updates,
                      metadata: {
                        ...doc.metadata,
                        updatedAt: new Date(),
                      },
                    }
                  : doc
              ),
              metadata: {
                ...kb.metadata,
                updatedAt: new Date(),
              },
            }
          : kb
      ),
    }));
  },

  removeDocument: (knowledgeBaseId, documentId) => {
    set((state) => ({
      knowledgeBases: state.knowledgeBases.map((kb) =>
        kb.id === knowledgeBaseId
          ? {
              ...kb,
              documents: kb.documents.filter((doc) => doc.id !== documentId),
              metadata: {
                ...kb.metadata,
                updatedAt: new Date(),
                stats: {
                  ...kb.metadata.stats,
                  documentCount: kb.documents.length - 1,
                  lastUpdated: new Date(),
                },
              },
            }
          : kb
      ),
    }));
  },

  searchDocuments: async (query, filters) => {
    set({ isLoading: true, error: null });

    try {
      const activeKb = get().getActiveKnowledgeBase();
      if (!activeKb) throw new Error('No active knowledge base');

      const results = activeKb.documents.filter((doc) => {
        const matchesQuery = doc.content.toLowerCase().includes(query.toLowerCase());
        const matchesType = !filters?.types || filters.types.includes(doc.type);
        const matchesTags =
          !filters?.tags ||
          filters.tags.every((tag) => doc.metadata.tags.includes(tag));
        return matchesQuery && matchesType && matchesTags;
      });

      set({ searchResults: results });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  // Marketplace Integration
  fetchMarketplaceItems: async () => {
    set({ isLoading: true, error: null });

    try {
      // TODO: Replace with actual API call
      const mockItems: MarketplaceItem[] = [
        {
          id: uuidv4(),
          type: 'knowledgeBase',
          name: 'Research Papers Collection',
          description: 'A curated collection of academic research papers',
          author: {
            id: '1',
            name: 'Academic AI',
            reputation: 4.8,
          },
          pricing: {
            type: 'free',
            price: 0,
            currency: 'USD',
            commission: 0,
          },
          stats: {
            downloads: 1200,
            rating: 4.7,
            reviews: 156,
          },
          metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '1.0.0',
            tags: ['research', 'academic', 'papers'],
            category: 'Academic',
            requirements: ['GPT-4'],
            compatibility: ['v2.0.0'],
          },
        },
      ];

      set({ marketplaceItems: mockItems });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  purchaseMarketplaceItem: async (itemId) => {
    set({ isLoading: true, error: null });

    try {
      const item = get().marketplaceItems.find((i) => i.id === itemId);
      if (!item) throw new Error('Item not found');

      // TODO: Implement actual purchase flow
      console.log(`Purchased item: ${item.name}`);
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  importKnowledgeBase: async (marketplaceItemId) => {
    set({ isLoading: true, error: null });

    try {
      const item = get().marketplaceItems.find((i) => i.id === marketplaceItemId);
      if (!item || item.type !== 'knowledgeBase') {
        throw new Error('Invalid marketplace item');
      }

      const newKb = get().createKnowledgeBase(
        item.name,
        item.description,
        item.metadata.category
      );

      console.log(`Imported knowledge base: ${newKb.id}`);
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
})); 