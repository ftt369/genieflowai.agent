import { GeminiService } from './gemini';

export interface ResearchStep {
  id: string;
  type: 'search' | 'analyze' | 'summarize';
  query: string;
  results?: string;
  isLoading?: boolean;
}

export interface BotChain {
  id: string;
  name: string;
  steps: ResearchStep[];
  isRunning: boolean;
}

export class ResearchService {
  private gemini: GeminiService;

  constructor(gemini: GeminiService) {
    this.gemini = gemini;
  }

  async executeStep(step: ResearchStep, previousResults: string[] = []): Promise<string> {
    switch (step.type) {
      case 'search':
        return this.executeSearch(step.query);
      case 'analyze':
        return this.executeAnalysis(step.query, previousResults);
      case 'summarize':
        return this.executeSummary(step.query, previousResults);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async executeSearch(query: string): Promise<string> {
    try {
      const searchPrompt = `Search query: "${query}"\nPlease provide relevant information and findings.`;
      const response = await this.gemini.chat([{ role: 'user', content: searchPrompt }]);
      return response.content;
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }

  private async executeAnalysis(query: string, previousResults: string[]): Promise<string> {
    try {
      const context = previousResults.join('\n\n');
      const analysisPrompt = `Context:\n${context}\n\nAnalysis request: ${query}\nPlease analyze the above context and provide insights.`;
      const response = await this.gemini.chat([{ role: 'user', content: analysisPrompt }]);
      return response.content;
    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  private async executeSummary(query: string, previousResults: string[]): Promise<string> {
    try {
      const context = previousResults.join('\n\n');
      const summaryPrompt = `Context:\n${context}\n\nSummary request: ${query}\nPlease provide a concise summary focusing on the key points.`;
      const response = await this.gemini.chat([{ role: 'user', content: summaryPrompt }]);
      return response.content;
    } catch (error) {
      console.error('Summary error:', error);
      throw error;
    }
  }

  async executeChain(chain: BotChain): Promise<void> {
    const results: string[] = [];
    
    for (const step of chain.steps) {
      try {
        const result = await this.executeStep(step, results);
        results.push(result);
        step.results = result;
        step.isLoading = false;
      } catch (error) {
        console.error(`Error executing step ${step.id}:`, error);
        step.results = 'Error: Failed to execute step';
        step.isLoading = false;
        break;
      }
    }
  }
} 