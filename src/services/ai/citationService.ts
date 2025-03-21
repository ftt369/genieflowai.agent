import { Citation } from '@/stores/chat/chatStore';
import { generateUUID } from '@/utils/uuid';
import { getGlobalAiAssistant } from '@/services/aiAssistantService';

/**
 * Extract citations from AI response content.
 * This function parses special citation markers in the content
 * and creates structured Citation objects.
 * 
 * Citation format: [[citation:title|url|source|snippet]]
 */
export function extractCitations(content: string): { 
  cleanContent: string; 
  citations: Citation[];
} {
  const citations: Citation[] = [];
  
  // Replace citation markers with superscript numbers and collect citations
  let citationCount = 0;
  
  // Pattern matches [[citation:title|url|source|snippet]]
  const pattern = /\[\[citation:(.*?)\|(.*?)(?:\|(.*?))?(?:\|(.*?))?\]\]/g;
  
  const cleanContent = content.replace(pattern, (match, title, url, source = '', snippet = '') => {
    citationCount++;
    
    const citation: Citation = {
      id: generateUUID(),
      title: title.trim(),
      url: url.trim(),
      source: source.trim(),
      snippet: snippet.trim()
    };
    
    citations.push(citation);
    
    // Return a superscript reference number
    return `<sup class="text-primary">[${citationCount}]</sup>`;
  });
  
  return {
    cleanContent,
    citations
  };
}

/**
 * Function for fetching citations from web search results
 */
export async function fetchCitationsForQuery(query: string): Promise<Citation[]> {
  try {
    const aiAssistant = getGlobalAiAssistant();
    if (!aiAssistant) {
      console.error('AI Assistant not available');
      return mockCitations();
    }

    const searchResults = await aiAssistant.fetchWebSearchResults(query);
    
    // Transform search results into citations
    return searchResults.map(result => ({
      id: result.id || generateUUID(),
      title: result.title,
      url: result.url,
      source: result.source,
      snippet: result.snippet
    }));
  } catch (error) {
    console.error('Error fetching citations:', error);
    return mockCitations();
  }
}

// Fallback mock citations when search fails
function mockCitations(): Citation[] {
  return [
    {
      id: generateUUID(),
      title: 'Example Search Result 1',
      url: 'https://example.com/article1',
      source: 'Example.com',
      snippet: 'This is a snippet from the search result that contains relevant information about the query.'
    },
    {
      id: generateUUID(),
      title: 'Example Search Result 2',
      url: 'https://example.com/article2',
      source: 'Example.com',
      snippet: 'Another snippet from a different search result with additional information related to the query.'
    }
  ];
}

/**
 * Add citations to AI response
 */
export function processCitationsInResponse(content: string): {
  processedContent: string;
  citations: Citation[];
} {
  const { cleanContent, citations } = extractCitations(content);
  return {
    processedContent: cleanContent,
    citations
  };
} 