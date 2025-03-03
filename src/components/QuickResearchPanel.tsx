import React, { useState } from 'react';
import { Search, Clock, X, ExternalLink } from 'lucide-react';
import { useAgentStore } from '../store/agentStore';
import { ResearchResult } from '../types';

export default function QuickResearchPanel() {
  const { quickResearch } = useAgentStore();
  
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const result = await quickResearch(query);
      setResults([result, ...results]);
      setQuery('');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleRemoveResult = (id: string) => {
    setResults(results.filter(result => result.id !== id));
  };
  
  return (
    <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-xl p-6 transition-colors">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Research</h2>
      
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Research anything quickly..."
            className="w-full px-4 py-2 bg-white dark:bg-[#3C3C3C] border border-gray-200 dark:border-[#4C4C4C] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isSearching && query.trim()) {
                handleSearch();
              }
            }}
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2 ${
            isSearching || !query.trim()
              ? 'bg-blue-300 dark:bg-blue-800 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSearching ? (
            <>
              <Clock className="animate-spin h-4 w-4" />
              <span>Searching...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Search</span>
            </>
          )}
        </button>
      </div>
      
      {results.length > 0 ? (
        <div className="space-y-4">
          {results.map((result) => (
            <div 
              key={result.id}
              className="bg-white dark:bg-[#3C3C3C] p-4 rounded-lg border border-gray-200 dark:border-[#4C4C4C]"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">{result.query}</h3>
                <button
                  onClick={() => handleRemoveResult(result.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              
              <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line mb-3">{result.content}</p>
              
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {result.sources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gray-100 dark:bg-[#2C2C2C] px-2 py-1 rounded flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <img src={source.avatar} alt={source.name} className="w-3 h-3 rounded-full" />
                      {source.name}
                      <ExternalLink size={10} />
                    </a>
                  ))}
                </div>
                <span className="text-gray-500 dark:text-gray-400">
                  {new Date(result.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#3C3C3C] border border-dashed border-gray-300 dark:border-[#4C4C4C] rounded-lg p-6 text-center">
          <div className="bg-gray-100 dark:bg-[#2C2C2C] rounded-full p-3 inline-flex mb-3">
            <Search className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </div>
          <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-2">No research results yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Use the search bar above to quickly research any topic
          </p>
        </div>
      )}
    </div>
  );
}