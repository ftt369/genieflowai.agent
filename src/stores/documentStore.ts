import { create } from 'zustand';

export interface Document {
  id: string;
  fileName: string;
  fileType: string;
  content: string;
  createdAt: Date;
}

interface DocumentStore {
  documents: Document[];
  currentDocumentId: string | null;
  addDocument: (document: Document) => void;
  removeDocument: (id: string) => void;
  getCurrentDocument: () => Document | null;
  setCurrentDocument: (id: string) => void;
  clearCurrentDocument: () => void;
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  documents: [],
  currentDocumentId: null,
  
  addDocument: (document: Document) => {
    set(state => ({
      documents: [...state.documents, document],
      currentDocumentId: document.id // Set as current document when added
    }));
  },
  
  removeDocument: (id: string) => {
    set(state => ({
      documents: state.documents.filter(doc => doc.id !== id),
      currentDocumentId: state.currentDocumentId === id ? null : state.currentDocumentId
    }));
  },
  
  getCurrentDocument: () => {
    const { documents, currentDocumentId } = get();
    return documents.find(doc => doc.id === currentDocumentId) || null;
  },
  
  setCurrentDocument: (id: string) => {
    set({ currentDocumentId: id });
  },
  
  clearCurrentDocument: () => {
    set({ currentDocumentId: null });
  }
})); 