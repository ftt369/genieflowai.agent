import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { Document } from '../types';

interface DocumentState {
  documents: Document[];
  addDocument: (document: Omit<Document, 'id' | 'uploadedAt'>) => void;
  removeDocument: (id: string) => void;
  getDocument: (id: string) => Document | undefined;
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  addDocument: (document) => {
    const newDocument = {
      ...document,
      id: uuidv4(),
      uploadedAt: new Date(),
    };
    set((state) => ({
      documents: [...state.documents, newDocument],
    }));
    return newDocument;
  },
  removeDocument: (id) => {
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    }));
  },
  getDocument: (id) => {
    return get().documents.find((doc) => doc.id === id);
  },
}));