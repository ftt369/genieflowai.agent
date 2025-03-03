import React, { useState } from 'react';
import { MessageCircle, Share2, Copy, MoreHorizontal, BookOpen } from 'lucide-react';
import SourceList from './SourceList';
import RelatedQuestions from './RelatedQuestions';
import FollowUpInput from './FollowUpInput';
import DocumentUpload from './DocumentUpload';
import AgentFlowBuilder from './AgentFlowBuilder';
import ResearchAgent from './ResearchAgent';
import { useResearchStore } from '../store/researchStore';

export default function MainContent() {
  const { toggleResearchSidebar } = useResearchStore();
  const [activeTab, setActiveTab] = useState<'agent' | 'research'>('agent');
  
  return (
    <div className="max-w-3xl mx-auto w-full mt-8 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">GenieAgent Dashboard</h1>
      
      <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-xl p-6 transition-colors">
        <div className="flex gap-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'agent'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-[#3C3C3C] text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('agent')}
          >
            Agent Builder
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'research'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-[#3C3C3C] text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setActiveTab('research')}
          >
            Research
          </button>
        </div>

        {activeTab === 'agent' ? (
          <AgentFlowBuilder />
        ) : (
          <div className="space-y-6">
            <ResearchAgent />
            <DocumentUpload />
          </div>
        )}
      </div>

      <div className="mt-6">
        <RelatedQuestions />
        <FollowUpInput />
      </div>
    </div>
  );
}