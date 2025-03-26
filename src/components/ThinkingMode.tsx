import React, { useState, useEffect } from 'react';
import { BrainCog, LightbulbIcon, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface ThinkingModeProps {
  thoughts: string;
  isComplete: boolean;
  onComplete: () => void;
}

export function ThinkingMode({ thoughts, isComplete, onComplete }: ThinkingModeProps) {
  const [displayedThoughts, setDisplayedThoughts] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [completionTriggered, setCompletionTriggered] = useState(false);
  
  useEffect(() => {
    // Reset displayed thoughts when new thoughts come in
    if (thoughts && displayedThoughts === '') {
      setDisplayedThoughts('');
      setCompletionTriggered(false);
    }
    
    // Animate the thinking text appearing
    const timer = setTimeout(() => {
      if (displayedThoughts.length < thoughts.length) {
        // Show 10 characters at a time for a smoother but faster typing effect
        const nextChunkEnd = Math.min(displayedThoughts.length + 10, thoughts.length);
        setDisplayedThoughts(thoughts.substring(0, nextChunkEnd));
      } else if (isComplete && !completionTriggered) {
        // Trigger the completion callback when thinking is done
        setCompletionTriggered(true);
        setTimeout(() => {
          onComplete();
        }, 500); // Small delay for better UX
      }
    }, 15); // Adjust speed as needed
    
    return () => clearTimeout(timer);
  }, [displayedThoughts, thoughts, isComplete, onComplete, completionTriggered]);
  
  // Format displayed thoughts to preserve whitespace and format code blocks
  const formattedThoughts = displayedThoughts.split('\n').map((line, i) => (
    <React.Fragment key={i}>
      {line}
      <br />
    </React.Fragment>
  ));
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 my-4">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          {!isComplete ? (
            <BrainCog className="h-5 w-5 text-indigo-500 animate-pulse mr-2" />
          ) : (
            <LightbulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
          )}
          <h3 className="font-medium text-gray-900 dark:text-gray-100">
            {!isComplete ? "Thinking..." : "Thought Process"}
          </h3>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1 rounded-md"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>
      
      {isExpanded && (
        <div className="prose dark:prose-invert max-w-none">
          <div className="bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 font-mono text-sm overflow-auto max-h-[300px]">
            {formattedThoughts}
            {!isComplete && (
              <span className="inline-block h-4 w-0.5 bg-indigo-500 ml-0.5 animate-blink"></span>
            )}
          </div>
        </div>
      )}
      
      <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
        <Clock className="h-3 w-3 mr-1" /> 
        <span>AI reasoning improves response quality and transparency</span>
      </div>
    </div>
  );
}

export default ThinkingMode; 