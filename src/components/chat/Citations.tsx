import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Citation } from '@/stores/chat/chatStore';

interface CitationsProps {
  citations: Citation[];
}

export default function Citations({ citations }: CitationsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!citations || citations.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 border-t pt-2 text-sm">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center text-primary hover:text-primary/80 mb-1"
      >
        <span className="mr-1">References</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      
      {isExpanded && (
        <div className="space-y-2 ml-1 mt-2">
          {citations.map((citation) => (
            <div key={citation.id} className="p-2 bg-muted/50 rounded-md">
              <div className="flex justify-between items-start">
                <a 
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline flex items-center"
                >
                  {citation.title || citation.url}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
                <span className="text-xs text-muted-foreground">
                  {citation.source}
                </span>
              </div>
              
              {citation.snippet && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {citation.snippet}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 