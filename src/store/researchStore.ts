import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ResearchTopic, Source } from '../types';

interface ResearchState {
  topics: ResearchTopic[];
  activeTopic: string | null;
  isResearchSidebarOpen: boolean;
  addTopic: (title: string, content: string, sources: Source[]) => ResearchTopic;
  removeTopic: (id: string) => void;
  setActiveTopic: (id: string | null) => void;
  toggleResearchSidebar: () => void;
  setResearchSidebarOpen: (isOpen: boolean) => void;
}

export const useResearchStore = create<ResearchState>((set, get) => ({
  topics: [],
  activeTopic: null,
  isResearchSidebarOpen: false,
  
  addTopic: (title, content, sources) => {
    const newTopic: ResearchTopic = {
      id: uuidv4(),
      title,
      content,
      sources,
      createdAt: new Date(),
    };
    
    set((state) => ({
      topics: [...state.topics, newTopic],
      activeTopic: newTopic.id,
      isResearchSidebarOpen: true,
    }));
    
    return newTopic;
  },
  
  removeTopic: (id) => {
    set((state) => ({
      topics: state.topics.filter((topic) => topic.id !== id),
      activeTopic: state.activeTopic === id ? null : state.activeTopic,
    }));
  },
  
  setActiveTopic: (id) => {
    set({ 
      activeTopic: id,
      isResearchSidebarOpen: id !== null,
    });
  },
  
  toggleResearchSidebar: () => {
    set((state) => ({ isResearchSidebarOpen: !state.isResearchSidebarOpen }));
  },
  
  setResearchSidebarOpen: (isOpen) => {
    set({ isResearchSidebarOpen: isOpen });
  },
}));