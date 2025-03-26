import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { Search, Zap, Book, FileText, Cpu, ArrowRight, RefreshCw } from 'lucide-react';

// Simple debounce implementation instead of using lodash
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(...args: Parameters<T>): void {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Add ResearchResult interface
interface ResearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  relevance: number;
  timestamp: Date;
}

// Performance-optimized version of the component
const ResearchAssistant: React.FC = memo(() => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isExpanded, setIsExpanded] = useState(true);
  const prevQueryRef = useRef('');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resultsCache = useRef<Record<string, ResearchResult[]>>({});
  
  // Memoized search handler with debounce
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery || searchQuery.length < 3) {
        setResults([]);
        setIsSearching(false);
        return;
      }
      
      // Check cache first
      if (resultsCache.current[searchQuery]) {
        setResults(resultsCache.current[searchQuery]);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      
      try {
        // Simulate API call - replace with actual API
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Mock results - replace with actual data
        const mockResults: ResearchResult[] = [
          {
            id: '1',
            title: `Research on ${searchQuery}`,
            content: `This is sample content for ${searchQuery} that demonstrates how the research assistant would work.`,
            source: 'Sample Database',
            relevance: 0.95,
            timestamp: new Date()
          },
          {
            id: '2',
            title: `Alternative sources for ${searchQuery}`,
            content: `Here are alternative sources and information about ${searchQuery} that might be useful.`,
            source: 'Knowledge Base',
            relevance: 0.85,
            timestamp: new Date()
          },
          {
            id: '3',
            title: `Related topics to ${searchQuery}`,
            content: `Topics related to ${searchQuery} include various associated subjects and areas of study.`,
            source: 'Research Papers',
            relevance: 0.75,
            timestamp: new Date()
          }
        ];
        
        // Cache the results
        resultsCache.current[searchQuery] = mockResults;
        setResults(mockResults);
    } catch (error) {
        console.error('Error fetching research results:', error);
        setResults([]);
    } finally {
      setIsSearching(false);
    }
    }, 500),
    []
  );
  
  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Avoid search for minor edits or short queries
    if (newQuery.length < 3 || 
        (prevQueryRef.current && newQuery.includes(prevQueryRef.current) && newQuery.length < prevQueryRef.current.length + 3)) {
      return;
    }
    
    prevQueryRef.current = newQuery;
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      debouncedSearch(newQuery);
    }, 200);
  }, [debouncedSearch]);
  
  // Cleanup effect
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);
  
  // Filter results based on activeFilter
  const filteredResults = results.filter(result => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'recent') return result.timestamp > new Date(Date.now() - 86400000);
    // Add more filters as needed
    return true;
  });
  
  const handleRefresh = useCallback(() => {
    if (query) {
      setIsSearching(true);
      debouncedSearch(query);
    }
  }, [query, debouncedSearch]);
  
  const handleResultClick = useCallback((result: ResearchResult) => {
    // Add your click handler logic here
    console.log('Result clicked:', result);
  }, []);

  return (
    <div className="research-assistant bg-card rounded-lg p-4 shadow-sm border border-border flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg flex items-center">
          <Book className="h-5 w-5 mr-2 text-primary" />
          Research Assistant
        </h3>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded hover:bg-muted"
        >
          {isExpanded ? 'Minimize' : 'Expand'}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Research a topic..."
              className="w-full pl-9 pr-4 py-2 rounded-md border border-border bg-background"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <RefreshCw className="h-4 w-4 text-muted-foreground animate-spin" />
          </div>
            )}
        </div>
        
          <div className="flex space-x-2 mb-4">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2 py-1 text-xs rounded ${activeFilter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveFilter('recent')}
              className={`px-2 py-1 text-xs rounded ${activeFilter === 'recent' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            >
              Recent
            </button>
              <button
              onClick={handleRefresh}
              className="ml-auto px-2 py-1 text-xs rounded bg-muted text-muted-foreground hover:bg-muted/80"
              disabled={isSearching}
            >
              Refresh
              </button>
            </div>
            
          <div className="flex-1 overflow-y-auto">
            {filteredResults.length > 0 ? (
              <div className="space-y-3">
                {filteredResults.map(result => (
                  <div 
                    key={result.id}
                    onClick={() => handleResultClick(result)}
                    className="bg-white dark:bg-[#3C3C3C] p-4 rounded-lg hover:shadow-md transition-shadow text-left cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm">{result.title}</h4>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {Math.round(result.relevance * 100)}%
                      </span>
              </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {result.content}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{result.source}</span>
                      <div className="flex items-center">
                        <ArrowRight className="h-3 w-3 mr-1" />
                        <span>View</span>
                      </div>
                    </div>
            </div>
                ))}
          </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                {query ? (
                  isSearching ? (
                    <>
                      <Cpu className="h-8 w-8 mb-2 animate-pulse" />
                      <p>Researching...</p>
                    </>
                  ) : (
                    <>
                      <FileText className="h-8 w-8 mb-2 opacity-50" />
                      <p>No results found</p>
                      <p className="text-xs mt-1">Try a different search term</p>
                    </>
                  )
                ) : (
                  <>
                    <Zap className="h-8 w-8 mb-2 opacity-50" />
                    <p>Enter a topic to research</p>
                    <p className="text-xs mt-1">Get instant insights and references</p>
                  </>
                )}
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
});

ResearchAssistant.displayName = 'ResearchAssistant';

export default ResearchAssistant; 