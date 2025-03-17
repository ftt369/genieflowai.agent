import React, { useState } from 'react';
import { Message } from '../services/modelService';

interface WorkflowSuggestionsProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  loading?: boolean;
}

/**
 * Component that displays workflow suggestions to help guide the user through research
 */
const WorkflowSuggestions: React.FC<WorkflowSuggestionsProps> = ({
  suggestions,
  onSuggestionClick,
  loading = false
}) => {
  const [expanded, setExpanded] = useState(true);
  
  // Don't render anything if no suggestions and not loading
  if (suggestions.length === 0 && !loading) return null;
  
  return (
    <div className="workflow-suggestions my-3 bg-muted/30 rounded-lg border border-border">
      <div 
        className="header px-3 py-2 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-primary" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path 
              fillRule="evenodd" 
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" 
              clipRule="evenodd" 
            />
          </svg>
          <span className="text-xs font-medium">Suggested next steps</span>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 transition-transform duration-200 ${expanded ? 'transform rotate-180' : ''}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {expanded && (
        <div className="content px-3 py-2 border-t border-border">
          {loading ? (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="ml-2 text-xs text-muted-foreground">Generating suggestions...</span>
            </div>
          ) : (
            <div className="suggestions-list">
              <div className="grid grid-cols-1 gap-2">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="text-xs text-left px-3 py-2 bg-background hover:bg-accent rounded-md transition-colors duration-200"
                    onClick={() => onSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkflowSuggestions; 