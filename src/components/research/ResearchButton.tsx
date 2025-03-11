import React from 'react';
import { BookOpen } from 'lucide-react';
import { useResearchStore } from '../store/researchStore';

export default function ResearchButton() {
  const { toggleResearchSidebar } = useResearchStore();
  
  return (
    <button
      onClick={toggleResearchSidebar}
      className="fixed right-4 top-4 z-20 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-colors"
      aria-label="Toggle research sidebar"
    >
      <BookOpen className="h-5 w-5" />
    </button>
  );
}