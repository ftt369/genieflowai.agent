import { ChatMessage } from '@stores/chat/chatStore';
import { openAIService } from './openaiService';
import { webSearchService } from './webSearchService';
import { web_search } from '@utils/web_search';

interface AnalysisResult {
  requiresSearch: boolean;
  relevantMessages: ChatMessage[];
  confidence: number;
  suggestedActions: string[];
}

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  relevance: number;
}

interface ProcessingResult {
  content: string;
  source: 'main-chat' | 'web-search' | 'flow-execution';
  reference: string;
  actions?: {
    type: string;
    data: any;
  }[];
}

interface AIAnalysisResponse {
  requiresSearch: boolean;
  relevantMessageIndices: number[];
  confidence: number;
  reasoning: string;
  suggestedActions: string[];
}

export class SidebarService {
  private history: { role: string; content: string }[] = [];

  private async analyzeContext(messages: ChatMessage[], query: string): Promise<AnalysisResult> {
    try {
      // Convert messages to AI format with indices for reference
      const aiMessages = messages.map((m, index) => ({
        role: m.role,
        content: m.content,
        index
      }));

      // Get AI analysis of the context and query
      const analysisPrompt = `
Given the conversation history and the user's query, analyze:
1. Whether the query requires web search (if the information isn't in the context)
2. Which messages are most relevant to the query
3. What actions might be helpful

Conversation History:
${aiMessages.map(m => `[${m.index}] ${m.role}: ${m.content}`).join('\n\n')}

Query: ${query}

Respond in JSON format:
{
  "requiresSearch": boolean,
  "relevantMessageIndices": number[],
  "confidence": number,
  "reasoning": string,
  "suggestedActions": string[]
}`;

      const analysis = await openAIService.analyzeContext(aiMessages, analysisPrompt);
      
      try {
        const parsedAnalysis = JSON.parse(analysis) as AIAnalysisResponse;
        const relevantMessages = parsedAnalysis.relevantMessageIndices
          .map(i => messages[i])
          .filter((m): m is ChatMessage => m !== undefined);

        return {
          requiresSearch: parsedAnalysis.requiresSearch || relevantMessages.length === 0,
          relevantMessages,
          confidence: parsedAnalysis.confidence,
          suggestedActions: parsedAnalysis.suggestedActions
        };
      } catch (parseError) {
        console.error('Error parsing analysis:', parseError);
        // Fallback to basic analysis if JSON parsing fails
        const relevantMessages = messages.filter(m => 
          m.content.toLowerCase().includes(query.toLowerCase()) ||
          this.calculateRelevance(m.content, query) > 0.5
        );

        return {
          requiresSearch: relevantMessages.length === 0,
          relevantMessages,
          confidence: relevantMessages.length > 0 ? 0.6 : 0.3,
          suggestedActions: this.getSuggestedActions(query, messages)
        };
      }
    } catch (error) {
      console.error('Error analyzing context:', error);
      // Return a safe fallback that triggers web search
      return {
        requiresSearch: true,
        relevantMessages: [],
        confidence: 0,
        suggestedActions: []
      };
    }
  }

  private calculateRelevance(content: string, query: string): number {
    const contentWords = new Set(content.toLowerCase().split(/\s+/));
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const intersection = new Set([...contentWords].filter(x => queryWords.has(x)));
    return intersection.size / queryWords.size;
  }

  private async searchWeb(query: string): Promise<SearchResult[]> {
    try {
      const results = await webSearchService.searchWithAIFallback(query);
      return results.map(r => ({
        ...r,
        snippet: r.snippet || 'No description available',
        relevance: 1
      }));
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  private getSuggestedActions(query: string, messages: ChatMessage[]): string[] {
    const actions = [];
    
    if (query.toLowerCase().includes('code')) {
      actions.push('analyze_code');
    }
    if (query.toLowerCase().includes('error')) {
      actions.push('debug');
    }
    if (query.toLowerCase().includes('improve')) {
      actions.push('suggest_improvements');
    }
    if (messages.some(m => m.content.includes('```'))) {
      actions.push('extract_code');
    }

    return actions;
  }

  public async processQuery(
    query: string,
    messages: ChatMessage[] = [],
    options: {
      useWebSearch?: boolean;
      useCodeAnalysis?: boolean;
      maxResults?: number;
    } = {}
  ): Promise<ProcessingResult> {
    try {
      // Add user message to history
      this.history.push({ role: 'user', content: query });

      // Use web_search tool to get information
      const searchResults = await web_search(query);
      const searchContext = searchResults.map(r => `${r.title}\n${r.snippet}`).join('\n\n');

      // Generate a response using the search results
      const response = searchContext ? 
        `Based on the search results:\n\n${searchContext}` :
        'I could not find any relevant information for your query.';

      // Add assistant response to history
      this.history.push({ role: 'assistant', content: response });

      return {
        content: response,
        source: 'web-search',
        reference: searchResults.length > 0 ? searchResults[0].title : 'No results',
        actions: []
      };
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        content: 'Sorry, I encountered an error while processing your request.',
        source: 'web-search',
        reference: 'Error',
        actions: []
      };
    }
  }

  public async executeFlow(
    flow: {
      steps: Array<{
        type: string;
        content: string;
        config?: any;
      }>;
    },
    context: {
      messages: ChatMessage[];
      query: string;
    }
  ): Promise<ProcessingResult> {
    const results: any[] = [];
    let currentContext = context.messages.map(m => m.content).join('\n');

    try {
      for (const step of flow.steps) {
        try {
          let stepResult: string;

          switch (step.type) {
            case 'web-search':
              const searchResults = await this.searchWeb(step.content);
              stepResult = searchResults.map(r => `${r.title}: ${r.snippet}`).join('\n');
              break;

            default:
              stepResult = await openAIService.executeFlowStep(step, currentContext);
          }

          results.push({
            type: step.type,
            content: stepResult
          });
          currentContext += `\n${stepResult}`;
        } catch (error) {
          console.error('Error executing flow step:', error);
          results.push({
            type: 'error',
            content: 'Error executing step: ' + (error instanceof Error ? error.message : 'Unknown error')
          });
        }
      }

      return {
        content: results.map(r => `[${r.type}] ${r.content}`).join('\n\n'),
        source: 'flow-execution',
        reference: 'Flow Results',
        actions: []
      };
    } catch (error) {
      console.error('Error executing flow:', error);
      return {
        content: 'Error executing flow: ' + (error instanceof Error ? error.message : 'Unknown error'),
        source: 'flow-execution',
        reference: 'Error',
        actions: []
      };
    }
  }
}

export const sidebarService = new SidebarService(); 