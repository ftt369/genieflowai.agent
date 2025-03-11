import { web_search } from '@utils/web_search';

export interface WebSearchResult {
  title: string;
  snippet: string;
  url: string;
  relevance: number;
}

export class WebSearchService {
  async search(query: string): Promise<WebSearchResult[]> {
    try {
      const searchResults = await web_search(query);
      return searchResults.map((result: any, index: number) => ({
        title: result.title || 'Search Result',
        snippet: result.snippet || result.content || 'No description available',
        url: result.url || 'https://example.com',
        relevance: 1 - (index * 0.1)
      }));
    } catch (error) {
      console.error('Web search error:', error);
      return [];
    }
  }

  // Main search method that always returns results
  async searchWithAIFallback(query: string): Promise<WebSearchResult[]> {
    try {
      const results = await this.search(query);
      if (results.length > 0) {
        return results;
      }
    } catch (error) {
      console.error('Search failed, using fallback:', error);
    }

    // Fallback to AI-generated result
    return [{
      title: 'AI-Generated Search Result',
      snippet: `Information about: ${query}`,
      url: 'https://example.com',
      relevance: 0.7
    }];
  }
}

export const webSearchService = new WebSearchService(); 