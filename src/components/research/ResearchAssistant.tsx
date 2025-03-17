import React, { useState, useRef, useEffect } from 'react';
import { Search, Bot, Book, FileText, Database, ChevronDown, ChevronUp, X, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAiAssistant } from '@/services/aiAssistantService';
import { useKnowledgeBaseStore } from '@/store/knowledgeBaseStore';
import { useModeStore } from '@/stores/model/modeStore';
import { Message } from '@/services/modelService';

interface SearchResult {
  content: string;
  source: string;
  relevance: number;
  title?: string;
  url?: string;
}

const ResearchAssistant: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [expandedResults, setExpandedResults] = useState<string[]>([]);
  
  const aiAssistant = useAiAssistant();
  const { knowledgeBases } = useKnowledgeBaseStore();
  const { modes, activeMode } = useModeStore();
  const currentMode = modes.find(m => m.id === activeMode);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Focus search input on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);
  
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    try {
      setIsSearching(true);
      setSearchResults([]);
      setAiResponse('');
      
      // Use our AI assistant to search knowledge bases
      const kbResults = await aiAssistant.searchKnowledgeBases(query);
      
      // Transform search results to our format
      const formattedResults = kbResults.map(result => ({
        content: result.content,
        source: result.metadata.source,
        title: result.metadata.title,
        url: result.metadata.url,
        relevance: result.score
      }));
      
      setSearchResults(formattedResults);
      setSelectedSources(formattedResults.map(r => r.title || r.source));
    } catch (error) {
      console.error('Error searching knowledge bases:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleGenerateResponse = async () => {
    if (searchResults.length === 0) return;
    
    try {
      setIsGenerating(true);
      
      // Filter search results by selected sources
      const filteredResults = searchResults.filter(
        r => selectedSources.includes(r.title || r.source)
      );
      
      // Prepare context for AI
      const context = filteredResults.map((r, i) => (
        `[Source ${i + 1}: ${r.title || r.source}]\n${r.content}`
      )).join('\n\n');
      
      // Generate response
      const messages: Message[] = [
        {
          role: 'system',
          content: `You are a research assistant. Use the provided sources to answer the user's query. Cite sources as [Source X] when using information from them.`
        },
        {
          role: 'user',
          content: `My question is: ${query}\n\nHere are relevant sources to help you answer:\n\n${context}`
        }
      ];
      
      const response = await aiAssistant.generateResponse(messages, query);
      setAiResponse(response);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const toggleResultExpansion = (id: string) => {
    setExpandedResults(prev => 
      prev.includes(id) 
        ? prev.filter(r => r !== id) 
        : [...prev, id]
    );
  };
  
  const toggleSourceSelection = (source: string) => {
    setSelectedSources(prev => 
      prev.includes(source) 
        ? prev.filter(s => s !== source) 
        : [...prev, source]
    );
  };

  return (
    <div className="flex flex-col h-full bg-background border-l">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          Research Assistant
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Search across knowledge bases and generate AI responses
        </p>
      </div>
      
      {/* Search interface */}
      <div className="p-4 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search query..."
              className="w-full px-4 py-2 pl-10 rounded-lg border bg-background"
            />
            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 rounded-lg",
              "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
              (!query.trim() || isSearching) && "opacity-50 cursor-not-allowed"
            )}
          >
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>
        
        {/* Knowledge base context */}
        <div className="mt-3 text-xs text-muted-foreground">
          {currentMode?.knowledgeBaseIds?.length ? (
            <div className="flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              <span>Searching across {currentMode.knowledgeBaseIds.length} attached knowledge base(s)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Database className="h-3.5 w-3.5" />
              <span>No knowledge bases attached to current mode</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Results */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {searchResults.length > 0 && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Search Results</h3>
              <button
                onClick={handleGenerateResponse}
                disabled={isGenerating}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-xs",
                  "bg-primary text-primary-foreground hover:bg-primary/90",
                  isGenerating && "opacity-50 cursor-not-allowed"
                )}
              >
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Bot className="h-3 w-3" />}
                Generate AI Response
              </button>
            </div>
            
            {/* Filter by source */}
            <div className="mt-3 mb-2">
              <div className="text-xs text-muted-foreground mb-1.5">Filter by source:</div>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(searchResults.map(r => r.title || r.source))).map(source => (
                  <button
                    key={source}
                    onClick={() => toggleSourceSelection(source)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs",
                      selectedSources.includes(source)
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {selectedSources.includes(source) ? (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    ) : (
                      <div className="h-2 w-2 rounded-full border border-muted-foreground" />
                    )}
                    {source}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Results list */}
            <div className="space-y-4 mt-4">
              {searchResults
                .filter(r => selectedSources.includes(r.title || r.source))
                .map((result, index) => {
                  const resultId = `result-${index}`;
                  const isExpanded = expandedResults.includes(resultId);
                  const excerptLength = 150;
                  
                  return (
                    <div key={resultId} className="border rounded-lg overflow-hidden">
                      <div 
                        className="bg-muted/40 p-3 flex items-center justify-between cursor-pointer"
                        onClick={() => toggleResultExpansion(resultId)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-shrink-0">
                            {result.source.toLowerCase().includes('web') ? (
                              <FileText className="h-4 w-4 text-blue-500" />
                            ) : (
                              <Book className="h-4 w-4 text-emerald-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{result.title || 'Untitled'}</div>
                            <div className="text-xs text-muted-foreground">{result.source}</div>
                          </div>
                        </div>
                        <div>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      <div className={cn(
                        "p-3 bg-background transition-all overflow-hidden",
                        isExpanded ? "block" : "hidden"
                      )}>
                        <div className="whitespace-pre-wrap">
                          {result.content}
                        </div>
                        
                        {result.url && (
                          <div className="mt-2 text-xs">
                            <a 
                              href={result.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View source
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
              })}
            </div>
          </div>
        )}
        
        {/* AI Response */}
        {aiResponse && (
          <div className="border-t p-4 bg-muted/30">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                AI Response
              </h3>
              <button
                onClick={() => setAiResponse('')}
                className="p-1 rounded-full hover:bg-muted/80"
                title="Clear response"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            <div className="whitespace-pre-wrap bg-background p-4 rounded-lg border text-sm">
              {aiResponse}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResearchAssistant; 